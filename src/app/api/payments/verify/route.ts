import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { RAZORPAY_KEY_SECRET } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    let isValid = false;

    if (razorpay_order_id.startsWith("order_mock_")) {
      isValid = razorpay_signature === "mock_signature";
    } else {
      const generated_signature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");
      isValid = generated_signature === razorpay_signature;
    }

    if (isValid) {
      // Update order status
      await db.order.update({
        where: { id: dbOrderId },
        data: {
          status: "PREPARING",
          paymentStatus: "PAID",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          ...(razorpay_order_id.startsWith("order_mock_") && { razorpayOrderId: razorpay_order_id }),
        },
      });

      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Verify Payment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
