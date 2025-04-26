import React, { useEffect, useRef, useState } from "react";
import { CrossmintProvider, CrossmintHostedCheckout, CrossmintCheckoutProvider, useCrossmintCheckout } from "@crossmint/client-sdk-react-ui";
import { createPaymentHistory } from "./services/api";

const clientApiKey = import.meta.env.VITE_CROSSMINT_API_KEY;
let callCount = 0;
// Function to send Telegram notification
async function sendTelegramNotification(message, chatId) {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN; // Store in .env

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: -1002568223473,
          text: message,
          parse_mode: 'Markdown', // Optional: Formatting
        }),
      }
    );
    const result = await response.json();
    console.log('Telegram notification sent:', result);
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

function CheckoutStatus({venueId}) {
  const { order } = useCrossmintCheckout();
  const getMessage = () => {
    console.log({order})
    if(order ?.phase !== "delivery") {
      callCount = 0;
    }
    if (order ?.phase == "delivery") {
      console.log({venueId})
      createPaymentHistory({orderId: order?.orderId, venueId})
      callCount++;
    }
    // if(order ?.phase !== "completed") {
    //   callCount = 0;
    // }
    // if (order ?.phase === "completed" && callCount == 0) {
    //   crossmintAmount.current = order?.quote?.totalPrice.amount
    //   sendTelegramNotification(
    //     `✅ Payment Successful!\n\n` +
    //     `🔹 Transaction ID: ${order.lineItems[0].delivery.txId}\n` +
    //     `🔹 Amount: ${(parseFloat(crossmintAmount.current) - 2).toFixed(2)}\n` +
    //     `🔹 Order Id: ${order.orderId}`, chatId
    //   );
    //   callCount++;
    // } 
    return <></>
  }
  return getMessage()
}

export const Card = ({ amount, venue, index }) => {
  const [quantity, setQuantity] = useState(1)
useEffect(() => {
  console.log({venue: venue.address})
}, [venue])
  return (
    <div className="flex flex-col justify-between bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-2 text-black">${amount} USD</h2>
      <p className="text-gray-600 mb-5">Pay with credit card</p>
      <div className="mb-4">
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Quantity
        </label>
        <select
          id="quantity"
          className="block h-9 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-gray-500 mb-1">
        Fee: ${2} + Processing Fee
    </p>
      <p className="font-semibold mb-4 text-black">
        Total: ${(amount * quantity) + 2} + Processing Fee
      </p>
      {/* <button onClick={() => {
        sendTelegramNotification('test', venue.chatId)
      }}>click</button> */}
      <div>
        <CrossmintProvider apiKey={clientApiKey}>
          <CrossmintCheckoutProvider>
            <CrossmintHostedCheckout
              lineItems={{
                collectionLocator: `crossmint:${import.meta.env.VITE_CROSSMINT_COLLECTION_ID}`,
                callData: {
                  totalPrice: (amount * quantity + 2).toString(),
                  tokenId: index,
                  vendorAddress: venue.address,
                  quantity: quantity,
                },
              }}
              payment={{
                crypto: { enabled: false },
                fiat: { enabled: true },
              }}
              
            />
            <CheckoutStatus venueId={venue.id}/>
          </CrossmintCheckoutProvider>
        </CrossmintProvider>
      </div>
    </div>
  );
};