import { HandlerContext } from "@xmtp/message-kit";
import { ethers } from "ethers"
import XmtpP2PABI from "../abis/XmtpP2P.json" assert { type: "json" }

export async function releaseFunds(orderId: string, buyer_wallet_address: string) {
    try{
    const provider = new ethers.providers.JsonRpcProvider("https://sepolia-rpc.kakarot.org")
    const xmtpP2PABI = XmtpP2PABI.abi
    const addr = "0xF8147c98b6222970D1E1b145F321Df34D5Da07E0"

    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) {
        throw new Error("PRIVATE_KEY is not set")
    }
    const signer = new ethers.Wallet(privateKey, provider)
    const xmtpP2P = new ethers.Contract(addr, xmtpP2PABI, signer)

    console.log("Releasing funds for order", BigInt(orderId))
    console.log("Buyer wallet address", buyer_wallet_address)
    const tx = await xmtpP2P.releaseFunds(BigInt(orderId), buyer_wallet_address)
    const receipt = await tx.wait()
    console.log("Funds released", receipt)

    return receipt.transactionHash
    } catch (error) {
        console.error("Error releasing funds", error)
    }

}

// releaseFunds("2", "0x33260be985120938B476987aD21C147135A11B98")

async function depositFunds(orderId: number, seller_wallet_address: string) {
    try{
    const provider = new ethers.providers.JsonRpcProvider("https://sepolia-rpc.kakarot.org")
    const xmtpP2PABI = XmtpP2PABI.abi
    const addr = "0xF8147c98b6222970D1E1b145F321Df34D5Da07E0"
    
    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) {
        throw new Error("PRIVATE_KEY is not set")
    }
    const signer = new ethers.Wallet(privateKey, provider)
    const xmtpP2P = new ethers.Contract(addr, xmtpP2PABI, signer)

    console.log("Depositing funds for order", BigInt(orderId))
    console.log("Seller wallet address", seller_wallet_address)
    const amount = ethers.utils.parseUnits("10", 6)

    const tx = await xmtpP2P.depositFunds(orderId, amount)

    const receipt = await tx.wait()
    console.log("Funds deposited", receipt.transactionHash)
    } catch (error) {
        console.error("Error depositing funds", error)
    }
}

depositFunds(5, "0xcA2fC531F2f9921AF4298Ca1aADe596d2e2197fF")
