//@ts-nocheck
import { frames } from "../frames";
import { transaction } from "frames.js/core";
import XmtpP2PAbi from "../../contract-abi.json";
import {
    Abi,
    createPublicClient,
    encodeFunctionData,
    getContract,
    http,
} from "viem";
import { baseSepolia } from "viem/chains";
import { ethers } from "ethers";

const functionName = 'depositFunds';
const contractAddress = '0x648eAcAa1C7FEbb06f9b682603fFC6d20b97450b';

export const POST = frames(async (ctx) => {

    const url = new URL(ctx.url);
    const { searchParams } = url;
    const token = searchParams.get("orderId") || 123;
    const amount = searchParams.get("amount") || 0.000001;



    const parsedDepositAmount = ethers.utils.parseUnits(amount, 6) // 1 USDC



    const data = encodeFunctionData({
        abi: XmtpP2PAbi.abi,
        functionName,
        args: [orderId, parsedDepositAmount],
    });

    // Initiating the transaction
    return transaction({
        chainId: "eip155:84532", // base sepolia
        method: "eth_sendTransaction",
        params: {
            to: contractAddress,
            data
        },
    });
});
