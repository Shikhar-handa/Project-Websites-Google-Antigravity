import Razorpay from "razorpay";

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_yourkeyhere";
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "your_secret_here";

export const isMockKey = (keyId: string) => {
  return keyId === "rzp_test_yourkeyhere" || !keyId || keyId.trim() === "";
};

export const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});
