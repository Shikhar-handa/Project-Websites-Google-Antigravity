import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { razorpay, isMockKey, RAZORPAY_KEY_ID } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, restaurantId, deliveryAddress } = body;

    if (!items || !items.length || !restaurantId || !deliveryAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Recalculate total amount from DB to prevent tampering
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = await db.menuItem.findUnique({ where: { id: item.itemId } });
      if (!menuItem) {
        return NextResponse.json({ error: `Item not found: ${item.itemId}` }, { status: 404 });
      }
      totalAmount += menuItem.price * item.qty;
      orderItemsData.push({
        menuItemId: item.itemId,
        quantity: item.qty,
        price: menuItem.price,
      });
    }

    // Add Delivery fee + taxes (mock calculation: ₹50 delivery + 5% tax)
    const deliveryFee = 50;
    const tax = totalAmount * 0.05;
    const finalAmount = totalAmount + deliveryFee + tax;

    // Create Order in DB
    const order = await db.order.create({
      data: {
        userId: session.user.id,
        restaurantId,
        totalAmount: finalAmount,
        deliveryAddress,
        status: "PENDING",
        paymentStatus: "UNPAID",
        orderItems: {
          create: orderItemsData,
        },
      },
    });

    const isMock = isMockKey(RAZORPAY_KEY_ID);

    if (isMock) {
      return NextResponse.json({
        isMock: true,
        orderId: `order_mock_${order.id}`,
        amount: finalAmount,
        currency: "INR",
        dbOrderId: order.id,
      });
    } else {
      // Create real Razorpay order
      // amount is in paise
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: order.id,
      });

      // Update order with razorpayOrderId
      await db.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: rzpOrder.id },
      });

      return NextResponse.json({
        isMock: false,
        keyId: RAZORPAY_KEY_ID,
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        dbOrderId: order.id,
      });
    }
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
