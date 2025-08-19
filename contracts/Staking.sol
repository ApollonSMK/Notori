// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract NotoriStake is ReentrancyGuard, Ownable {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    uint256 public totalStaked;
    uint256 public rewardRate;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    uint256 public entryFeePercent = 1; // 1%
    uint256 public earlyUnstakePenaltyPercent = 5; // 5%
    uint256 public minStakeDuration = 7 days;

    mapping(address => uint256) public userStakedBalance;
    mapping(address => uint256) public userRewards;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public userStakeTimestamp;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRewardRate);

    constructor(address _stakingToken, address _rewardsToken, uint256 _initialRewardRate) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Staking token is zero address");
        require(_rewardsToken != address(0), "Rewards token is zero address");

        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        rewardRate = _initialRewardRate;
        lastUpdateTime = block.timestamp;
    }

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        userRewards[_account] = earned(_account);
        userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        _;
    }

    function stake(uint256 _amount) external nonReentrant updateReward(msg.sender) {
        require(_amount > 0, "Cannot stake 0");

        uint256 fee = (_amount * entryFeePercent) / 100;
        uint256 amountAfterFee = _amount - fee;

        totalStaked += amountAfterFee;
        userStakedBalance[msg.sender] += amountAfterFee;
        userStakeTimestamp[msg.sender] = block.timestamp;

        require(stakingToken.transferFrom(msg.sender, address(this), amountAfterFee), "Stake transfer failed");
        require(stakingToken.transferFrom(msg.sender, owner(), fee), "Fee transfer failed");

        emit Staked(msg.sender, amountAfterFee);
    }

    function unstake(uint256 _amount) external nonReentrant updateReward(msg.sender) {
        require(_amount > 0, "Cannot unstake 0");
        require(userStakedBalance[msg.sender] >= _amount, "Insufficient staked balance");

        totalStaked -= _amount;
        userStakedBalance[msg.sender] -= _amount;

        uint256 penalty = 0;
        if (block.timestamp < userStakeTimestamp[msg.sender] + minStakeDuration) {
            penalty = (_amount * earlyUnstakePenaltyPercent) / 100;
        }

        uint256 amountAfterPenalty = _amount - penalty;

        require(stakingToken.transfer(msg.sender, amountAfterPenalty), "Unstake transfer failed");
        if (penalty > 0) {
            require(stakingToken.transfer(owner(), penalty), "Penalty transfer failed");
        }

        emit Unstaked(msg.sender, _amount);
    }

    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = userRewards[msg.sender];
        require(reward > 0, "No rewards to claim");

        userRewards[msg.sender] = 0;
        require(rewardsToken.transfer(msg.sender, reward), "Reward transfer failed");

        emit RewardPaid(msg.sender, reward);
    }

    function earned(address _account) public view returns (uint256) {
        return ((userStakedBalance[_account] * (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) + userRewards[_account];
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalStaked);
    }

    function setRewardRate(uint256 _newRewardRate) external onlyOwner updateReward(address(0)) {
        rewardRate = _newRewardRate;
        emit RewardRateUpdated(_newRewardRate);
    }

    function fund(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Cannot fund 0");
        require(rewardsToken.transferFrom(msg.sender, address(this), _amount), "Funding transfer failed");
    }

    // Optional: setters for admin configuration
    function setEntryFeePercent(uint256 _percent) external onlyOwner {
        require(_percent <= 10, "Too high");
        entryFeePercent = _percent;
    }

    function setEarlyUnstakePenaltyPercent(uint256 _percent) external onlyOwner {
        require(_percent <= 20, "Too high");
        earlyUnstakePenaltyPercent = _percent;
    }

    function setMinStakeDuration(uint256 _seconds) external onlyOwner {
        require(_seconds <= 30 days, "Too long");
        minStakeDuration = _seconds;
    }
}
