//@ts-nocheck
import { frames } from "../frames";
import { transaction } from "frames.js/core";
import { encodeFunctionData } from "viem";
import USDCAbi from "../../MockUSDC.json";
import { ethers } from "ethers";

const functionName = 'approve';
const contractAddress = '0x648eAcAa1C7FEbb06f9b682603fFC6d20b97450b'; // P2P contract address
const usdcContractAddress = '0x254Ff46538bf3C581435850F73D2f26011417a1C'; // USDC contract address

export const POST = frames(async (ctx) => {
    const amount = "1";
    const parsedAmount = ethers.utils.parseUnits(amount, 6);

    const data = encodeFunctionData({
        abi: USDCAbi.abi,
        functionName,
        args: [contractAddress, parsedAmount],
    });

    return transaction({
        chainId: "eip155:84532", // base sepolia
        method: "eth_sendTransaction",
        params: {
            to: usdcContractAddress,
            data
        },
    });
});
