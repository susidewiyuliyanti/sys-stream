// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SysStream Token
 * @notice Fixed initial supply for the SYS ecosystem.
 *
 * Total supply: 1,000,000,000 SYS
 * Decimals: 18 (OpenZeppelin ERC20 default)
 *
 * No public mint function is exposed. The complete initial supply is
 * assigned to the deployer and can subsequently be distributed/transferred.
 */
contract SysStreamToken is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 ether;

    constructor() ERC20("SysStream Token", "SYS") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
