// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WZTToken
 * @dev A simple ERC20 token for testing purposes in the NotoriStake Mini App.
 * The owner can mint new tokens.
 */
contract WZT is ERC20, Ownable {
    /**
     * @dev Constructor that sets the token name and symbol, and mints an initial supply to the contract deployer.
     */
    constructor() ERC20("Wize Token", "WZT") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * (10 ** decimals()));
    }

    /**
     * @dev Creates `amount` new tokens and assigns them to `to`, increasing the total supply.
     * Only the owner of the contract can call this function.
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
