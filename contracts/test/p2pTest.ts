import { expect } from "chai";
import { ethers } from "hardhat";
import { XmtpP2P, IERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("XmtpP2P", function () {
  let xmtpP2P: XmtpP2P;
  let usdcToken: IERC20;
  let owner: SignerWithAddress;
  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;
  const initialBalance = ethers.parseUnits("1000", 6); // 1000 USDC
  const depositAmount = ethers.parseUnits("100", 6); // 100 USDC

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy mock USDC token
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdcToken = await MockUSDC.deploy();

    // Deploy XmtpP2P contract
    const XmtpP2P = await ethers.getContractFactory("XmtpP2P");
    xmtpP2P = await XmtpP2P.deploy(await usdcToken.getAddress());

    // Mint some USDC to the seller
    await usdcToken.transfer(seller.address, initialBalance);

    // Approve XmtpP2P contract to spend seller's USDC
    await usdcToken.connect(seller).approve(await xmtpP2P.getAddress(), depositAmount);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await xmtpP2P.owner()).to.equal(owner.address);
    });

    it("Should set the correct USDC token address", async function () {
      expect(await xmtpP2P.usdcToken()).to.equal(await usdcToken.getAddress());
    });
  });

  describe("Deposit Funds", function () {
    it("Should allow seller to deposit funds", async function () {
      await expect(xmtpP2P.connect(seller).depositFunds(1, depositAmount))
        .to.emit(xmtpP2P, "FundsDeposited")
        .withArgs(1, seller.address, depositAmount);

      const order = await xmtpP2P.orders(1);
      expect(order.seller).to.equal(seller.address);
      expect(order.amount).to.equal(depositAmount);
    });

    it("Should fail if deposit amount is zero", async function () {
      await expect(xmtpP2P.connect(seller).depositFunds(1, 0)).to.be.revertedWith("Must deposit funds");
    });

    it("Should fail if order ID is already used", async function () {
      await xmtpP2P.connect(seller).depositFunds(1, depositAmount);
      await expect(xmtpP2P.connect(seller).depositFunds(1, depositAmount)).to.be.revertedWith("Order ID already used");
    });
  });

  describe("Release Funds", function () {
    beforeEach(async function () {
      await xmtpP2P.connect(seller).depositFunds(1, depositAmount);
    });

    it("Should allow owner to release funds to buyer", async function () {
      await expect(xmtpP2P.connect(owner).releaseFunds(1, buyer.address))
        .to.emit(xmtpP2P, "FundsReleased")
        .withArgs(1, buyer.address, depositAmount);

      const order = await xmtpP2P.orders(1);
      expect(order.buyer).to.equal(buyer.address);
      expect(order.isCompleted).to.be.true;

      const buyerBalance = await usdcToken.balanceOf(buyer.address);
      expect(buyerBalance).to.equal(depositAmount);
    });

    it("Should fail if non-owner tries to release funds", async function () {
      await expect(xmtpP2P.connect(seller).releaseFunds(1, buyer.address)).to.be.reverted;
    });

    it("Should fail if order does not exist", async function () {
      await expect(xmtpP2P.connect(owner).releaseFunds(2, buyer.address)).to.be.revertedWith("Order does not exist");
    });

    it("Should fail if order is already completed", async function () {
      await xmtpP2P.connect(owner).releaseFunds(1, buyer.address);
      await expect(xmtpP2P.connect(owner).releaseFunds(1, buyer.address)).to.be.revertedWith("Order already has a buyer");
    });
  });
});
