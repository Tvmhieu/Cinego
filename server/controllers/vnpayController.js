import crypto from "crypto";
import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

// Sort object keys alphabetically (required by VNPay)
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  }
  return sorted;
}

// Format date as yyyyMMddHHmmss (VNPay requirement) - Must be GMT+7
function formatVnpDate(date) {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const vnTime = new Date(utc + (3600000 * 7));
  
  const pad = (n) => String(n).padStart(2, "0");
  return (
    vnTime.getFullYear().toString() +
    pad(vnTime.getMonth() + 1) +
    pad(vnTime.getDate()) +
    pad(vnTime.getHours()) +
    pad(vnTime.getMinutes()) +
    pad(vnTime.getSeconds())
  );
}

// Create VNPay payment URL
export const createVnpayUrl = (booking, ipAddr, returnUrl) => {
  const vnp_TmnCode = process.env.VNP_TMN_CODE;
  const vnp_HashSecret = process.env.VNP_HASH_SECRET;
  const vnp_Url = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

  const createDate = formatVnpDate(new Date());
  const expireDate = formatVnpDate(new Date(Date.now() + 5 * 60 * 1000)); // 5 min

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: booking.bookingCode,
    vnp_OrderInfo: `Thanh toan ve xem phim - ${booking.bookingCode}`,
    vnp_OrderType: "other",
    vnp_Amount: booking.amount * 100, // VNPay requires amount * 100
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  vnp_Params = sortObject(vnp_Params);

  const signData = new URLSearchParams(vnp_Params).toString();
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;

  const paymentUrl =
    vnp_Url + "?" + new URLSearchParams(vnp_Params).toString();

  return paymentUrl;
};

// VNPay Return URL handler (user is redirected here after payment)
export const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    // Remove hash fields before verifying
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const signData = new URLSearchParams(vnp_Params).toString();
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    if (secureHash === signed) {
      const responseCode = vnp_Params["vnp_ResponseCode"];
      const bookingCode = decodeURIComponent(vnp_Params["vnp_TxnRef"]);

      if (responseCode === "00") {
        // Payment successful
        const booking = await Booking.findOne({ bookingCode });

        if (booking && !booking.isPaid) {
          booking.isPaid = true;
          booking.paymentLink = "";
          await booking.save();

          // Send Confirmation Email via Inngest
          await inngest.send({
            name: "app/show.booked",
            data: { bookingId: booking._id.toString() },
          });
        }

        // Redirect to success page
        res.redirect(`${clientUrl}/payment-result?status=success&code=${bookingCode}`);
      } else {
        // Payment failed
        res.redirect(`${clientUrl}/payment-result?status=failed&code=${bookingCode}`);
      }
    } else {
      // Invalid hash
      res.redirect(`${clientUrl}/payment-result?status=failed&code=invalid`);
    }
  } catch (error) {
    console.error("VNPay return error:", error.message);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/payment-result?status=failed&code=error`);
  }
};

// VNPay IPN (Instant Payment Notification) handler - VNPay server calls this
export const vnpayIPN = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const signData = new URLSearchParams(vnp_Params).toString();
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const bookingCode = decodeURIComponent(vnp_Params["vnp_TxnRef"]);
      const responseCode = vnp_Params["vnp_ResponseCode"];

      const booking = await Booking.findOne({ bookingCode });

      if (!booking) {
        return res.status(200).json({ RspCode: "01", Message: "Order not found" });
      }

      // Check if amount matches
      const vnpAmount = Number(vnp_Params["vnp_Amount"]) / 100;
      if (vnpAmount !== booking.amount) {
        return res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
      }

      if (booking.isPaid) {
        return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
      }

      if (responseCode === "00") {
        // Payment successful
        booking.isPaid = true;
        booking.paymentLink = "";
        await booking.save();

        // Send Confirmation Email
        await inngest.send({
          name: "app/show.booked",
          data: { bookingId: booking._id.toString() },
        });

        return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
      } else {
        return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
      }
    } else {
      return res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
    }
  } catch (error) {
    console.error("VNPay IPN error:", error.message);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};
