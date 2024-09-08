//@ts-nocheck
import { frames } from "../frames";
import { createPublicClient, encodeFunctionData, getContract, http } from "viem";
import { baseSepolia } from "viem/chains";
import XmtpP2PAbi from "../../contract-abi.json";
import USDCAbi from "../../MockUSDC.json";
import { ethers } from "ethers";

const functionName = 'approve';
const contractAddress = '0x648eAcAa1C7FEbb06f9b682603fFC6d20b97450b'; // P2P contract address
const usdcContractAddress = '0x254Ff46538bf3C581435850F73D2f26011417a1C'; // USDC contract address

export const POST = frames(async (ctx) => {
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
    });


    const walletAddress = ctx?.message?.walletAddress;
    const amount = "1";
    const parsedAmount = ethers.parseUnits(amount, 6);


    const data = encodeFunctionData({
        abi: USDCAbi.abi,
        functionName,
        args: [contractAddress, parsedAmount],
    });

    try {
        // Initiate the transaction to approve spending on behalf of the user
        const txResponse = await publicClient.sendTransaction({
            to: usdcContractAddress,
            from: walletAddress,
            data,
        });

        console.log(`Transaction sent: ${txResponse.hash}`);


        return {
            image: <span>Approved {amount} USDC for P2P contract. View on <a href={`https://sepolia.etherscan.io/tx/${txResponse.hash}`} target="_blank" rel="noopener noreferrer">Etherscan</a></span>,
        };
    } catch (error) {
        console.error("Error approving USDC spend:", error);
        return {
            image: <span>Error approving USDC spend: {error.message}</span>,
        };
    }
});