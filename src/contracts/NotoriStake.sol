// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "solmate/src/tokens/ERC20.sol";

// Interface for Permit2
interface IPermit2 {
    function permit(address owner, address token, uint256 amount, uint256 expiration, bytes calldata signature) external;
    function transferFrom(address from, address to, uint160 amount, address token) external;
}


contract NotoriStake is Ownable, ReentrancyGuard {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    IPermit2 public constant permit2 = IPermit2(0x000000000022D473030F116dDEE9F6B43aC78BA3);

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lastUpdateTime;
    mapping(address => uint256) public rewardPerTokenStored;
    mapping(address => uint256) public rewards;

    uint256 public rewardRate; // Rewards per second (in wei)
    uint256 public lastGlobalUpdateTime;
    uint256 public rewardPerTokenPaid;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);

    constructor(
        address _stakingToken,
        address _rewardsToken,
        uint256 _initialRewardRate
    ) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        rewardRate = _initialRewardRate;
        lastGlobalUpdateTime = block.timestamp;
    }

    // --- External Functions ---

    function stake(uint256 _amount, bytes calldata _permit2Signature) external nonReentrant {
        require(_amount > 0, "Cannot stake 0");
        updateReward(msg.sender);
        
        // Use Permit2 to transfer tokens
        permit2.permit(msg.sender, address(stakingToken), _amount, block.timestamp + 600, _permit2Signature);
        permit2.transferFrom(msg.sender, address(this), uint160(_amount), address(stakingToken));
        
        stakedBalance[msg.sender] += _amount;
        emit Staked(msg.sender, _amount);
    }


    function unstake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot unstake 0");
        require(stakedBalance[msg.sender] >= _amount, "Insufficient staked balance");
        updateReward(msg.sender);
        stakedBalance[msg.sender] -= _amount;
        stakingToken.transfer(msg.sender, _amount);
        emit Unstaked(msg.sender, _amount);
    }

    function claimRewards() external nonReentrant {
        updateReward(msg.sender);
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.transfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    // --- View Functions ---

    function getStakedAmount(address _user) external view returns (uint256) {
        return stakedBalance[_user];
    }

    function getRewardsAmount(address _user) external view returns (uint256) {
        return rewards[_user] + calculateReward(_user);
    }
    
    // --- Internal & Public Functions ---

    function calculateReward(address _user) public view returns (uint256) {
        return stakedBalance[_user] * (rewardPerToken() - rewardPerTokenStored[_user]) / 1e18;
    }

    function rewardPerToken() public view returns (uint256) {
        uint256 totalStaked = stakingToken.balanceOf(address(this));
        if (totalStaked == 0) {
            return rewardPerTokenPaid;
        }
        return rewardPerTokenPaid + (rewardRate * (block.timestamp - lastGlobalUpdateTime) * 1e18 / totalStaked);
    }

    function updateReward(address _user) internal {
        rewardPerTokenPaid = rewardPerToken();
        lastGlobalUpdateTime = block.timestamp;
        rewards[_user] += calculateReward(_user);
        rewardPerTokenStored[_user] = rewardPerTokenPaid;
    }

    // --- Admin Functions ---

    function setRewardRate(uint256 _newRate) external onlyOwner {
        updateReward(address(0)); // Update global state before changing rate
        rewardRate = _newRate;
        emit RewardRateUpdated(_newRate);
    }
    
    // In case rewards tokens get stuck in the contract
    function emergencyWithdrawRewards(uint256 _amount) external onlyOwner {
        rewardsToken.transfer(owner(), _amount);
    }
}
