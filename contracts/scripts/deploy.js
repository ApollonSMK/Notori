
const hre = require("hardhat");

async function main() {
  const stakingTokenAddress = "0x..."; // Replace with your ERC20 token address for staking (e.g., WLD on World Chain)
  const rewardsTokenAddress = "0x..."; // Replace with your ERC20 token address for rewards
  const initialRewardRate = "10000000000000000"; // Example: 0.01 rewards per second (assuming 18 decimals)

  const NotoriStake = await hre.ethers.getContractFactory("NotoriStake");
  const notoriStake = await NotoriStake.deploy(stakingTokenAddress, rewardsTokenAddress, initialRewardRate);

  await notoriStake.waitForDeployment();

  console.log(`NotoriStake contract deployed to: ${await notoriStake.getAddress()}`);
  console.log("Constructor arguments:");
  console.log(`  - Staking Token: ${stakingTokenAddress}`);
  console.log(`  - Rewards Token: ${rewardsTokenAddress}`);
  console.log(`  - Initial Reward Rate: ${initialRewardRate}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
