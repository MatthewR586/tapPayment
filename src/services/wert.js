import WertWidget from '@wert-io/widget-initializer';
import { signSmartContractData } from '@wert-io/widget-sc-signer';
import { v4 as uuidv4 } from 'uuid';

import { Buffer } from 'buffer/';

window.Buffer = Buffer; // needed to use `signSmartContractData` in browser

/* We advise you not to use the private key on the frontend
    It is used here for example only
*/
const privateKey = import.meta.env.VITE_WERT_PRIVATE_KEY;
const signedData = signSmartContractData(
  {
    address: import.meta.env.VITE_ADDRESS,
    commodity: import.meta.env.VITE_COMMODITY,
    network: import.meta.env.VITE_NETWORK,
    commodity_amount: amount,
    sc_address: import.meta.env.VITE_SC_ADDRESS,
    sc_input_data: scInputData,
  },
  privateKey
);
const otherWidgetOptions = {
  partner_id: import.meta.env.VITE_PARTNER_ID,
  click_id: uuidv4(), // unique id of purhase in your system
  origin: import.meta.env.VITE_ORIGIN, // this option needed only for this example to work
  listeners: {
    loaded: () => console.log('loaded'),
  },
};

export const wertWidget = new WertWidget({
  ...signedData,
  ...otherWidgetOptions,
});

