import axios from "axios";
import { toast } from "react-toastify";

export const getVendorInformation = async (address) => {
    const result = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/vendor?address=${address}`);
    if (result.status == 200) {
        return result.data.message;
    } else {
        toast.info(result.data.message)
        return false;
    }
}

export const createPaymentHistory = async ({orderId, venueId}) => {
    const result = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payment`, {orderId, venueId});
    if (result.status == 200) {
        return result.data.message;
    } else {
        toast.info(result.data.message)
        return false;
    }
}