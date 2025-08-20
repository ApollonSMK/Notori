// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.3/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.3/contracts/access/Ownable.sol";

/**
 * @title WZT Token
 * @dev A simple ERC20 test token with a minting function restricted to the owner.
 */
contract WZT is ERC20, Ownable {
    constructor() ERC20("Wize Test Token", "WZT") {
        // Mint an initial supply of 1,000,000 tokens to the deployer.
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /**
     * @dev Creates `amount` new tokens and assigns them to `to`.
     * Can only be called by the owner.
     * @param to The address that will receive the minted tokens.
     * @param amount The a-mount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
