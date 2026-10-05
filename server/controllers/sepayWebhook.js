import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

// SePay Webhook - automatically called when money is received in bank account
export const sepayWebhook = async (req, res) => {
  try {
    // SePay sends transaction data in the request body
    const { transferType, transferAmount, content, gateway } = req.body;

    // Only process incoming transfers
    if (transferType !== "in") {
      return res.json({ success: true, message: "Ignored outgoing transfer" });
    }

    // Extract booking code from transfer content (e.g., "CG123456")
    const bookingCodeMatch = content?.match(/CG\d{6}/i);
    
    if (!bookingCodeMatch) {
      console.log("SePay webhook: No booking code found in content:", content);
      return res.json({ success: true, message: "No booking code found" });
    }

    const bookingCode = bookingCodeMatch[0].toUpperCase();

    // Find the booking by bookingCode
    const booking = await Booking.findOne({ bookingCode, isPaid: false });

    if (!booking) {
      console.log("SePay webhook: Booking not found for code:", bookingCode);
      return res.json({ success: true, message: "Booking not found" });
    }

    // Verify the transfer amount matches booking amount
    if (Number(transferAmount) < booking.amount) {
      console.log(
        `SePay webhook: Amount mismatch. Expected: ${booking.amount}, Received: ${transferAmount}`
      );
      return res.json({ success: true, message: "Amount mismatch" });
    }

    // Mark booking as paid
    booking.isPaid = true;
    booking.paymentLink = "";
    await booking.save();

    console.log(`SePay webhook: Booking ${bookingCode} confirmed as paid!`);

    // Send Confirmation Email via Inngest
    await inngest.send({
      name: "app/show.booked",
      data: { bookingId: booking._id.toString() },
    });

    res.json({ success: true, message: "Payment confirmed" });
  } catch (error) {
    console.error("SePay webhook error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
