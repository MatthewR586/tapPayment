import React, { useState, useEffect } from "react";

import { Buffer } from "buffer/";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import logo from "./assets/logo.png";
import venuesData from "./assets/vendors.json";
import { Card } from "./Card";

const options = [
  { amount: 5 },
  { amount: 10 },
  { amount: 20 },
  { amount: 25 },
  { amount: 50 },
  { amount: 100 },
];

window.Buffer = Buffer; // needed to use `signSmartContractData` in browser

/* We advise you not to use the private key on the frontend
    It is used here for example only
*/

export default function WertCheckout() {
  const { address } = useParams();
  const venue = venuesData.find((v) => {
    return v.link.toLowerCase() === (address ? address.toLowerCase() : "");
  });

  return venue ? (
    <div className="min-h-screen bg-blue-50 py-10 px-4 w-full content-center">
      <div className="flex justify-center">
        <img
          src={logo}
          alt="Company Logo"
          className="h-52 w-auto" // Adjust height as needed
        />
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {options.map(({ amount }, index) => (
          <Card
            key={amount}
            amount={amount}
            venue={venue}
            index={index}
          />
        ))}
      </div>
      <ToastContainer />
    </div>
  ) : (
    <div>Vendor not found</div>
  );
}
