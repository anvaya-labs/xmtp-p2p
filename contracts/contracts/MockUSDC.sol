// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals;

    constructor() ERC20("Mock USDC", "mUSDC") Ownable(msg.sender) {
        _decimals = 6; // USDC uses 6 decimal places
        _mint(msg.sender, 1000000000000000000);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
