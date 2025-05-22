import React, { useEffect, useRef, useState } from "react";
import {
  CrossmintProvider,
  CrossmintHostedCheckout,
  CrossmintCheckoutProvider,
  CrossmintEmbeddedCheckout,
} from "@crossmint/client-sdk-react-ui";
import Modal from "./Modal";
import Web3 from "web3";
import { Buffer } from 'buffer/';
import { signSmartContractData } from '@wert-io/widget-sc-signer';
import WertWidget from '@wert-io/widget-initializer';
import { v4 as uuidv4 } from 'uuid';

const clientApiKey = import.meta.env.VITE_CROSSMINT_API_KEY;
const clientSecondApiKey = import.meta.env.VITE_CROSSMINT_API2_KEY;
const collectionId = import.meta.env.VITE_CROSSMINT_COLLECTION_ID;
const collection2Id = import.meta.env.VITE_CROSSMINT_COLLECTION2_ID;

let callCount = 0;
// Function to send Telegram notification
async function sendTelegramNotification(message, chatId) {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN; // Store in .env

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: -1002568223473,
          text: message,
          parse_mode: "Markdown", // Optional: Formatting
        }),
      }
    );
    const result = await response.json();
    console.log("Telegram notification sent:", result);
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}
const web3 = new Web3(window.ethereum);
window.Buffer = Buffer; // needed to use `signSmartContractData` in browser
const otherWidgetOptions = {
  partner_id: import.meta.env.VITE_PARTNER_ID,
  click_id: uuidv4(), // unique id of purhase in your system
  origin: import.meta.env.VITE_ORIGIN, // this option needed only for this example to work
  listeners: {
    loaded: () => console.log('loaded'),
    'payment-status': async (data) => {
      console.log(data)
      if(data.status === "success") {
        // telegram notification
        await sendTelegramNotification(
          `✅ Payment Successful!\n\n` +
          `🔹 Transaction ID: ${data.tx_id}\n` +
          `🔹 Order Id: ${data.order_id}`
        );
      }
    }
  },
};
export const Card = ({ amount, venue, index }) => {
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [opportunity, setOpportunity] = useState(0.3);
  const [fee, setFee] = useState(3);
  useEffect(() => {
    console.log({ venue: venue.address });
  }, [venue]);

  useEffect(() => {
    amount >= 50 ? setOpportunity(0.6) : setOpportunity(0.3);
    amount === 100 ? setFee(5) : setFee(3);
  }
  , [amount]);

  const handlePay = async () => {
    
    const encordedFunctionCall = web3.eth.abi.encodeFunctionCall({
      name: 'useBurnerForErcSc',
      type: 'function',
      inputs: [
        { type: 'address', name: 'coin' },
        { type: 'uint256', name: 'amount' },
        { type: 'address', name: 'sender' },
      ],
    }, [
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", 
      amount * quantity * 1e6, 
      venue?.address,
    ]);
    const signedData = signSmartContractData(
      {
        address: venue?.address,
        commodity: import.meta.env.VITE_COMMODITY,
        network: import.meta.env.VITE_NETWORK,
        commodity_amount:  amount * quantity,
        sc_address: import.meta.env.VITE_SC_ADDRESS,
        sc_input_data: encordedFunctionCall,
      },
      import.meta.env.VITE_WERT_PRIVATE_KEY
    );
    const wertWidget = new WertWidget({
      ...signedData,
      ...otherWidgetOptions,
    });

    wertWidget.open();

  }

  return (
    <div className="flex flex-col justify-between bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-2 text-black">${amount} USD</h2>
      <p className="text-gray-600 mb-5">Pay with credit card</p>
      <div className="mb-4">
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
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
      <p className="text-sm text-gray-500 mb-1">Fee: ${2} + Processing Fee</p>
      <p className="font-semibold mb-4 text-black">
        Total: ${amount * quantity} + Processing Fee
      </p>
      <button
        className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        onClick={() => {
          handlePay()
        }}
      >
        Pay
      </button>
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false)
        }}>
        <div className="w-full h-[70vh] min-h-[500px] mt-5">
          <div className="h-full flex flex-col">
            {Math.random() < 0 ? (
              <CrossmintProvider apiKey={clientApiKey}>
                <CrossmintCheckoutProvider>
                  <div className="flex-1 min-h-0">
                    <CrossmintEmbeddedCheckout
                      lineItems={{
                        collectionLocator: `crossmint:${collectionId}`,
                        callData: {
                          totalPrice: (amount * quantity + fee).toString(),
                          tokenId: index,
                          vendorAddress: venue.address,
                          quantity: quantity,
                          fee: (fee * 1e6).toString(),
                          amount: (amount * quantity * 1e6).toString(),
                        },
                      }}
                      payment={{
                        crypto: { enabled: false },
                        fiat: { enabled: true },
                      }}
                    />
                  </div>
                </CrossmintCheckoutProvider>
              </CrossmintProvider>
            ) :  <CrossmintProvider apiKey={clientSecondApiKey}>
            <CrossmintCheckoutProvider>
              <div className="flex-1 min-h-0">
                <CrossmintEmbeddedCheckout
                  lineItems={{
                    collectionLocator: `crossmint:${collection2Id}`,
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
              </div>
            </CrossmintCheckoutProvider>
          </CrossmintProvider>}
          </div>
        </div>
      </Modal>

      {/* <div>
        <CrossmintProvider apiKey={clientApiKey}>
          <CrossmintCheckoutProvider>
            <CrossmintHostedCheckout
              lineItems={{
                collectionLocator: `crossmint:${import.meta.env.VITE_CROSSMINT_COLLECTION_ID}`,
                callData: {
                  totalPrice: (amount * quantity + 3).toString(),
                  tokenId: index,
                  vendorAddress: venue.address,
                  quantity: quantity,
                  fee: (3 * 1e6).toString(),
                  amount: (amount * quantity * 1e6).toString(),
                },
              }}
              payment={{
                crypto: { enabled: false },
                fiat: { enabled: true },
              }}
            />
          </CrossmintCheckoutProvider>
        </CrossmintProvider>
      </div> */}
    </div>
  );
};
