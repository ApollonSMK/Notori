// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/IPermit2.sol";

contract NotoriStake is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    IERC20Upgradeable public stakingToken;
    IERC20Upgradeable public rewardsToken;

    IPermit2 public constant permit2 = IPermit2(0x000000000022D473030F116dDEE9F6B43aC78BA3);

    // Staking state
    mapping(address => uint256) public stakedBalance;
    uint256 public totalStaked;

    // Rewards state
    mapping(address => uint256) public rewards;
    uint256 public rewardRate; // Rate of rewards per second
    uint256 public lastGlobalUpdateTime;
    mapping(address => uint256) public lastUpdateTime;
    mapping(address => uint256) public rewardPerTokenStored;
    uint256 public rewardPerToken;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _stakingToken,
        address _rewardsToken,
        uint256 _initialRewardRate
    ) public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();

        require(_stakingToken != address(0) && _rewardsToken != address(0), "Tokens cannot be zero address");
        
        stakingToken = IERC20Upgradeable(_stakingToken);
        rewardsToken = IERC20Upgradeable(_rewardsToken);
        rewardRate = _initialRewardRate;
        lastGlobalUpdateTime = block.timestamp;
    }

    modifier updateReward(address _user) {
        rewardPerToken = calculateRewardPerToken();
        rewards[_user] = calculateReward(_user);
        lastUpdateTime[_user] = block.timestamp;
        rewardPerTokenStored[_user] = rewardPerToken;
        _;
    }

    function calculateRewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored[address(0)]; // Use a global stored value if no one is staking
        }
        return rewardPerTokenStored[address(0)] + ((block.timestamp - lastGlobalUpdateTime) * rewardRate * 1e18) / totalStaked;
    }

    function calculateReward(address _user) public view returns (uint256) {
        uint256 currentRewardPerToken = calculateRewardPerToken();
        return rewards[_user] + (stakedBalance[_user] * (currentRewardPerToken - rewardPerTokenStored[_user])) / 1e18;
    }
    
    function stake(uint256 _amount, bytes calldata _permit2Signature) external nonReentrant updateReward(msg.sender) {
        require(_amount > 0, "Cannot stake 0");

        // Define the Permit2 transfer details
        ISignatureTransfer.PermitTransferFrom memory permit = ISignatureTransfer.PermitTransferFrom({
            permitted: ISignatureTransfer.TokenPermissions({
                token: address(stakingToken),
                amount: _amount
            }),
            spender: address(this),
            nonce: block.timestamp, // Nonce can be less strict for this specific use case
            deadline: block.timestamp + 30 minutes
        });

        // Execute the transfer using Permit2
        permit2.permitTransferFrom(permit, ISignatureTransfer.SignatureTransferDetails({ to: address(this), requestedAmount: _amount }), msg.sender, _permit2Signature);

        stakedBalance[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    function unstake(uint256 _amount) external nonReentrant updateReward(msg.sender) {
        require(_amount > 0, "Cannot unstake 0");
        require(stakedBalance[msg.sender] >= _amount, "Insufficient staked balance");

        stakedBalance[msg.sender] -= _amount;
        totalStaked -= _amount;

        stakingToken.transfer(msg.sender, _amount);
        emit Unstaked(msg.sender, _amount);
    }

    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to claim");

        rewards[msg.sender] = 0;
        rewardsToken.transfer(msg.sender, reward);
        emit RewardPaid(msg.sender, reward);
    }

    // --- Admin Functions ---

    function setRewardRate(uint256 _newRate) external onlyOwner {
        rewardPerToken = calculateRewardPerToken();
        lastGlobalUpdateTime = block.timestamp;
        rewardPerTokenStored[address(0)] = rewardPerToken;
        rewardRate = _newRate;
        emit RewardRateUpdated(_newRate);
    }
    
    function emergencyWithdrawRewards(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        require(rewardsToken.balanceOf(address(this)) >= _amount, "Insufficient reward token balance in contract");
        rewardsToken.transfer(owner(), _amount);
    }

    // --- View Functions ---

    function getStakedAmount(address _user) public view returns (uint256) {
        return stakedBalance[_user];
    }

    function getRewardsAmount(address _user) public view returns (uint256) {
        return calculateReward(_user);
    }

    /// @dev This is required by UUPS upgrades to prevent storage clashes.
    uint256[49] private __gap;
}
