// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract XmtpP2P is Ownable {
    // USDC token contract address
    IERC20 public usdcToken;

    // Data structures
    struct Order {
        address seller;
        address buyer;
        uint256 amount;
        bool isCompleted;
    }

    // State variables
    mapping(uint256 => Order) public orders;

    // Events
    event FundsDeposited(
        uint256 orderId,
        address indexed seller,
        uint256 amount
    );
    event FundsReleased(uint256 orderId, address indexed buyer, uint256 amount);

    // Constructor
    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
    }

    // Seller deposits USDC into the contract, order ID provided by the bot
    function depositFunds(uint256 orderId, uint256 _amount) external {
        require(_amount > 0, "Must deposit funds");
        require(orders[orderId].amount == 0, "Order ID already used");
        require(
            orders[orderId].seller == address(0),
            "Order ID already exists"
        );

        // Transfer USDC from seller to contract
        require(
            usdcToken.transferFrom(msg.sender, address(this), _amount),
            "USDC transfer failed"
        );

        orders[orderId] = Order({
            seller: msg.sender,
            buyer: address(0),
            amount: _amount,
            isCompleted: false
        });

        // Emit event for record-keeping or external integrations
        emit FundsDeposited(orderId, msg.sender, _amount);
    }

    // Admin releases funds to the buyer after confirming fiat payment
    function releaseFunds(uint256 orderId, address buyer) external onlyOwner {
        Order storage order = orders[orderId];
        require(order.amount > 0, "Order does not exist");
        require(order.buyer == address(0), "Order already has a buyer");
        require(!order.isCompleted, "Order already completed");

        // Assign the buyer
        order.buyer = buyer;
        order.isCompleted = true;

        // Transfer USDC to the buyer
        uint256 amount = order.amount;
        require(
            usdcToken.transfer(order.buyer, amount),
            "USDC transfer failed"
        );

        // Emit event for record-keeping or external integrations
        emit FundsReleased(orderId, order.buyer, amount);
    }
}
