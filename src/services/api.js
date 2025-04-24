import axios from "axios";

export const getVendorInformation = async (address) => {
    const result = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/vendor?address=${address}`);
    return result.status == 200 ? result : false;
}