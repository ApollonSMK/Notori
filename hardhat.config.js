
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    worldchain: {
      url: process.env.WORLDCHAIN_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  etherscan: {
    // apiKey: process.env.ETHERSCAN_API_KEY // Add if you want to verify on a supported explorer
  }
};
