/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";

const handleRequest = frames(async (ctx) => {
    if (ctx.message?.transactionId) {
        console.log("ctx.message.transactionId----------", ctx.message.transactionId)
        return {
            image: (
                <div tw="bg-purple-800 text-white w-full h-full justify-center items-center flex">
                    <div tw="text-center">
                        <p tw="text-lg">Transaction ID - {ctx.message.transactionId}.</p>
                    </div>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1:1",
            },
            buttons: [
                <Button
                    action="link"
                    target={`https://sepolia.basescan.org/tx/${ctx.message.transactionId}`}
                >
                    View on block explorer
                </Button>,
                <Button action="tx" target={`/deposit`}>Deposit</Button>
            ],
        };
    }

    return {
        image: <span>Send 0.1 USDT to 0x648eAcAa1C7FEbb06f9b682603fFC6d20b97450b</span>,
        buttons: [
            <Button action="tx" target="/allow-spend">
                Allow Spend
            </Button>,
        ],
    };
});

export const GET = handleRequest;
export const POST = handleRequest;