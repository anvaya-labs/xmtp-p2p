import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

import "./tasks/deploy";
import "./tasks/allowSpend";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY as string],
    },
    "kakarot-sepolia": {
      url: "https://sepolia-rpc.kakarot.org",
      accounts: [process.env.PRIVATE_KEY as string],
    }
  },
  etherscan: {
    apiKey: {
      "kakarot-sepolia": "testnet/evm/1802203764"
    },
    customChains: [
      {
        network: "kakarot-sepolia",
        chainId: 1802203764,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/1802203764_2/etherscan",
          browserURL: "https://routescan.io"
        }
      }
    ]
  }
};

export default config;
