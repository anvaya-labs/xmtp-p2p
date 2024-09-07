/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";

const handleRequest = frames(async (ctx) => {
    let iAm: string | undefined;

    if (ctx.message) {
        iAm = (await ctx.message.walletAddress()) ?? "anonymous";
    }

    return {
        image: <span>Send 0.1usdt to 0x648eAcAa1C7FEbb06f9b682603fFC6d20b97450b</span>,
        buttons: [<Button action="tx" target={`/deposit`}>Deposit</Button>],
    };
});

export const GET = handleRequest;
export const POST = handleRequest