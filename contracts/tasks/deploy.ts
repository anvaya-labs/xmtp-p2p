import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";

task("deploy:mockUSDC", "Deploys the MockUSDC contract")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();

    console.log("MockUSDC deployed to:", await mockUSDC.getAddress());

    const deployments = JSON.parse(fs.readFileSync("deployments/deployments.json", "utf8"));
    const network = hre.network.name;
    if (!deployments[network]) {
      deployments[network] = {};
    }
    deployments[network]["MockUSDC"] = await mockUSDC.getAddress();
    fs.writeFileSync("deployments/deployments.json", JSON.stringify(deployments, null, 2));
  });

task("deploy:p2p", "Deploys the P2P contract")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const deployments = JSON.parse(fs.readFileSync("deployments/deployments.json", "utf8"));
    const network = hre.network.name;

    const xmtpP2P = await hre.ethers.getContractFactory("XmtpP2P");
    const xmtpP2PTx = await xmtpP2P.deploy(deployments[network]["MockUSDC"]);
    await xmtpP2PTx.waitForDeployment();

    console.log("XmtpP2P deployed to:", await xmtpP2PTx.getAddress());

    if (!deployments[network]) {
      deployments[network] = {};
    }
    deployments[network]["P2P"] = await xmtpP2PTx.getAddress();
    fs.writeFileSync("deployments/deployments.json", JSON.stringify(deployments, null, 2));
  });

