import { run, HandlerContext } from "@xmtp/message-kit";
import { supabase } from "./lib/supabase.js";
import { getPrice } from "./lib/priceFeed.js";
import { releaseFunds } from "./lib/releaseFunds.js";

let clientInitialized = false;

run(async (context: HandlerContext) => {
  const {
    v2client,
    message: {
      content: { content: text },
      typeId,
      sender,
    },
  } = context;

  if (typeId !== "text") {
    return;
  }

  const price = await getPrice();

  console.log("price", price);


  // Check user state
  const { data: userData } = await supabase
    .from('users')
    .select('id, wallet_address')
    .eq('wallet_address', sender.address)
    .single();

  console.log("userData", userData);

  if (!userData) {
    // Create new user if not exists
    const { data: newUser } = await supabase
      .from('users')
      .insert({ wallet_address: sender.address })
      .select()
      .single();

    console.log("newUser", newUser);

    if (!newUser) {
      await context.reply("Error creating user. Please try again.");
      return;
    }
  }

  // dummyHandleSell();
  const [command, ...args] = text.split(' ');

  switch (command.toLowerCase()) {
    case '/buy':
      if (args.length !== 1) {
        await context.reply("Invalid format. Use: /buy <usdc_amount>");
        return;
      }
      const [buyAmount] = args;
      await handleBuy(context, buyAmount);
      break;

    case '/sell':
      if (args.length !== 2) {
        await context.reply("Invalid format. Use: /sell <usdc_amount> <account_details>");
        return;
      }
      const [sellAmount, accountDetails] = args;
      await handleSell(context, sellAmount, accountDetails);
      break;

    case '1':
      const { data: activeOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', sender.address)
        .eq('status', 'MATCHED')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (activeOrder) {
        await getSellerConfirmation(context, activeOrder );
      } else {
        await context.reply("No active buy order found.");
      }
      break;

    case '9':
      const { data: confirmedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', sender.address)
        .eq('status', 'MATCHED')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (confirmedOrder) {
        await getSellerConfirmation(context, confirmedOrder);
        await handlePayment(context, confirmedOrder);
      } else {
        await context.reply("No active buy order found.");
      }
      break;

    default:
      await context.reply("Unknown command. Available commands: /buy, /sell");
  }
});

async function handleBuy(context: HandlerContext, amount: string) {
  const { sender } = context.message;

  // Check for existing sell orders
  const { data: sellOrders, error: sellOrderError } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'PENDING')
    .eq('amount', parseFloat(amount))
    .order('created_at', { ascending: true })
    .limit(1);

  if (sellOrderError) {
    await context.reply("Error checking for sell orders. Please try again.");
    console.log("sellOrderError", sellOrderError);
    return;
  }

  if (!sellOrders || sellOrders.length === 0) {
    await context.reply("We do not have any seller. Come back later.");
    return;
  }

  const sellOrder = sellOrders[0];

  // Get seller's account details
  const { data: seller, error: sellerError } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', sellOrder.seller_id!)
    .single();

  if (sellerError || !seller) {
    await context.reply("Error retrieving seller information. Please try again.");
    return;
  }

  const price = await getPrice();

  console.log("price", price);

  const amountInUsd = Number(price) * parseFloat(amount);

  await context.reply(`A seller is available. Please send ${amountInUsd} USD to the following account:`);
  await context.reply(`${seller.account_details}`);

  await context.send("Press: \n\n 1. if you've paid the amount to the seller, or \n\n 2. if you want to cancel.");

  // Update the order to matched
  const { data: buyOrder, error: buyOrderError } = await supabase
    .from('orders')
    .update({
      buyer_id: sender.address,
      status: 'MATCHED',
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', sellOrder.order_id)
    .select()
    .single();

  if (buyOrderError || !buyOrder) {
    await context.reply("Error creating buy order. Please try again.");
    console.log("buyOrderError", buyOrderError);
    return;
  }
}
async function handleSell(context: HandlerContext, amount: string, accountDetails: string) {
  const { sender } = context.message;

  const { data: seller } = await supabase
    .from('users')
    .select('id, wallet_address')
    .eq('wallet_address', sender.address)
    .single();

  if (!seller) {
    await context.reply("Error retrieving user data. Please try again.");
    return;
  }

  console.log("seller", seller);

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      amount: parseFloat(amount),
      seller_id: seller.wallet_address,
      status: 'PENDING',
    })
    .select()
    .single();

  // update the user's account details
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ account_details: accountDetails })
    .eq('wallet_address', sender.address)
    .select()
    .single();

  // taking a break for sometime, comeback and check if this is working
  console.log("order", order);
  console.log("error", error);

  if (error || !order) {
    await context.reply("Error creating sell order. Please try again.");
    return;
  }



  await context.reply(`Sell order created for ${amount} USDC. Order ID: ${order.order_id}.`);
}

// dummy function to test if supabase read and write is working
async function dummyHandleSell() {
  // first get the user details
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', "0x33260be985120938B476987aD21C147135A11B98")
    .single();

  console.log("user", user);
  console.log("error", error);

  // create a new sell order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      amount: 100,
      seller_id: user?.wallet_address,
      status: 'PENDING',
    })
    .select()
    .single();

  console.log("order", order);
  console.log("orderError", orderError);
}

async function getSellerConfirmation(context: HandlerContext, activeOrder: any) {
  console.log("activeOrder", activeOrder);
  console.log("activeOrder.seller_id", activeOrder.seller_id);
  console.log("activeOrder.buyer_id", activeOrder.buyer_id);
  console.log("activeOrder.amount", activeOrder.amount);

  const conversations = await context.v2client.conversations.list()

  const targetConversation = conversations.find(
    (conv) => conv.peerAddress === activeOrder.seller_id,
  );

  targetConversation?.send(`Have you received the payment of ${activeOrder.amount} USDC?`)
  targetConversation?.send("Press 9 if you have received the payment, or 2 if you want to cancel.")
  // // ask the seller from order details if they have received the payment
  // await context.sendTo(`Have you received the payment of ${activeOrder.amount} USDC?`, activeOrder.seller_id)
  // await context.sendTo("Press 9 if you have received the payment, or 2 if you want to cancel.", activeOrder.seller_id)



  // if yes, update the order to completed

  // if no, ask the buyer to send the payment again

  // if the payment is not received, cancel the order

  // if the payment is received, update the order to completed
}

async function handlePayment(context: HandlerContext, confirmedOrder: any) {
  console.log("confirmedOrder", confirmedOrder);
  const txHash = await releaseFunds(confirmedOrder.order_id, confirmedOrder.buyer_id)
  console.log("txHash", txHash);

  // update the order to completed
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'COMPLETED',
    })
    .eq('order_id', confirmedOrder.order_id)
    .select()
    .single();

    // update transaction table with the txHash
    const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      amount: confirmedOrder.amount,
      tx_hash: txHash,
      order_id: confirmedOrder.order_id,
    })

    console.log("transaction", transaction);
    console.log("transactionError", transactionError);

    if (updateError || !updatedOrder) {
      await context.reply("Error updating order. Please try again.");
      return;
    }

    if (transactionError || !transaction) {
      await context.reply("Error creating transaction. Please try again.");
      return;
    }

    await context.reply(`Payment of ${confirmedOrder.amount} USDC has been released.`)
}

// dummyHandleSell();
