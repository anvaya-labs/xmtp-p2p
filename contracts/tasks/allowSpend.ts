// task to allow the contract to spend USDC on behalf of the wallet callig=ng this function

import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";

task("allowSpend", "Allows the P2P contract to spend USDC on behalf of the caller")
  .addParam("amount", "The amount of USDC to approve")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const deployments = JSON.parse(fs.readFileSync("deployments/deployments.json", "utf8"));
    const network = hre.network.name;

    if (!deployments[network] || !deployments[network]["MockUSDC"] || !deployments[network]["P2P"]) {
      console.error("Contract addresses not found for the current network");
      return;
    }

    const usdcAddress = deployments[network]["MockUSDC"];
    const p2pAddress = deployments[network]["P2P"];

    const [signer] = await hre.ethers.getSigners();
    const usdcContract = await hre.ethers.getContractAt("MockUSDC", usdcAddress, signer);

    const amount = hre.ethers.parseUnits(taskArgs.amount, 6); // Assuming USDC has 6 decimals

    try {
      const tx = await usdcContract.approve(p2pAddress, amount);
      await tx.wait();
      console.log(`Approved ${taskArgs.amount} USDC for P2P contract at ${p2pAddress}`);
    } catch (error) {
      console.error("Error approving USDC spend:", error);
    }
  });
