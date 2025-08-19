
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title NotoriStake
 * @dev A simple staking contract where users can stake ERC20 tokens and earn rewards.
 */
contract NotoriStake is ReentrancyGuard, Ownable {
    
    // --- State Variables ---

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    uint256 public totalStaked;
    uint256 public rewardRate; // Rewards per second (in rewardsToken smallest unit)
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userStakedBalance;
    mapping(address => uint256) public userRewards;
    mapping(address => uint256) public userRewardPerTokenPaid;

    // --- Events ---

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRewardRate);

    // --- Constructor ---

    constructor(address _stakingToken, address _rewardsToken, uint256 _initialRewardRate) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Staking token is zero address");
        require(_rewardsToken != address(0), "Rewards token is zero address");
        
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        rewardRate = _initialRewardRate;
        lastUpdateTime = block.timestamp;
    }

    // --- Modifiers ---

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        userRewards[_account] = earned(_account);
        userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        _;
    }

    // --- Core Functions ---

    /**
     * @dev Stakes a specified amount of tokens.
     * @param _amount The amount of tokens to stake.
     */
    function stake(uint256 _amount) external nonReentrant updateReward(msg.sender) {
        require(_amount > 0, "Cannot stake 0");
        
        totalStaked += _amount;
        userStakedBalance[msg.sender] += _amount;
        
        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Stake transfer failed");
        
        emit Staked(msg.sender, _amount);
    }

    /**
     * @dev Unstakes a specified amount of tokens.
     * @param _amount The amount of tokens to unstake.
     */
    function unstake(uint256 _amount) external nonReentrant updateReward(msg.sender) {
        require(_amount > 0, "Cannot unstake 0");
        require(userStakedBalance[msg.sender] >= _amount, "Insufficient staked balance");
        
        totalStaked -= _amount;
        userStakedBalance[msg.sender] -= _amount;
        
        require(stakingToken.transfer(msg.sender, _amount), "Unstake transfer failed");
        
        emit Unstaked(msg.sender, _amount);
    }

    /**
     * @dev Claims accumulated rewards.
     */
    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = userRewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        
        userRewards[msg.sender] = 0;
        
        require(rewardsToken.transfer(msg.sender, reward), "Reward transfer failed");
        
        emit RewardPaid(msg.sender, reward);
    }
    
    // --- View Functions ---

    /**
     * @dev Calculates the amount of rewards earned by an account.
     * @param _account The address of the account.
     * @return The amount of rewards earned.
     */
    function earned(address _account) public view returns (uint256) {
        return ((userStakedBalance[_account] * (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) + userRewards[_account];
    }
    
    /**
     * @dev Calculates the reward per token since the last update.
     * @return The reward per token.
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalStaked);
    }
    
    // --- Admin Functions ---
    
    /**
     * @dev Updates the reward rate.
     * @param _newRewardRate The new reward rate.
     */
    function setRewardRate(uint256 _newRewardRate) external onlyOwner updateReward(address(0)) {
        rewardRate = _newRewardRate;
        emit RewardRateUpdated(_newRewardRate);
    }

    /**
     * @dev Allows the owner to fund the contract with reward tokens.
     * @param _amount The amount of reward tokens to fund.
     */
    function fund(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Cannot fund 0");
        require(rewardsToken.transferFrom(msg.sender, address(this), _amount), "Funding transfer failed");
    }
}
