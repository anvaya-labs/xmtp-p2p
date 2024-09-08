/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";
import { supabase } from "../../../xmtp-p2p-bot/src/lib/supabase";

const handleRequest = frames(async (ctx) => {
    console.log("ctx----------", ctx.message?.transactionId)
    if (ctx.message?.transactionId) {

        // save to supabase
        const { data, error } = await supabase.from('transactions').insert([
            {
                tx_hash: ctx.message.transactionId,
                amount: 0.1, // get it from the transaction or url params
                order_id: 1, // get it from the transaction or url params
            }
        ])

        return {
            image: (
                <div tw="bg-purple-800 text-white w-full h-full justify-center items-center flex">
                    {data ? <span>Transaction saved</span> : <span>Error saving transaction</span>}
                </div>
            ),
            imageOptions: {
                aspectRatio: "1:1",
            },
            buttons: [
                <Button
                    action="link"
                    target={`https://www.onceupon.gg/tx/${ctx.message.transactionId}`}
                >
                    View on block explorer
                </Button>,
            ],
        };
    }

    return {
        image: <span>Send 0.1usdt to 0x648eAcAa1C7FEbb06f9b682603fFC6d20b97450b</span>,
        buttons: [
            <Button action="tx" target="/allow-spend" >
                Allow Spend
            </Button>,

            <Button action="tx" target={`/deposit`}>Deposit</Button>



        ],
    };
});

export const GET = handleRequest;
export const POST = handleRequest