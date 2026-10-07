import Booking from "../models/Booking.js";
import sendEmail from "../configs/nodemailer.js";
import { clerkClient } from "@clerk/express";

export const sendBookingConfirmationEmail = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      });

    if (!booking) {
      console.error("sendBookingConfirmationEmail: Booking not found");
      return;
    }

    let userEmail = null;
    let userName = booking.customerName || "Khách hàng";

    // Fetch user details from Clerk since MongoDB User collection might be empty
    try {
      if (booking.user) {
        const clerkUser = await clerkClient.users.getUser(booking.user.toString());
        userEmail = clerkUser.emailAddresses[0]?.emailAddress;
        if (clerkUser.firstName || clerkUser.lastName) {
          userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
        }
      }
    } catch (err) {
      console.error("Error fetching user from Clerk in email sender:", err.message);
    }

    if (!userEmail) {
      console.error("sendBookingConfirmationEmail: User email not found");
      return;
    }

    await sendEmail({
      to: userEmail,
      subject: `Xác nhận đặt vé thành công: "${booking.show.movie.title}"`,
      body: `<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    <h2>Xin chào ${userName},</h2>
    <p>
      Vé xem phim 
      <strong style="color: #F84565;">"${booking.show.movie.title}"</strong> của bạn đã được xác nhận thanh toán.
    </p>
    <p>
      <strong>Mã vé:</strong> ${booking.bookingCode}<br/>
      <strong>Ngày chiếu:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}<br/>
      <strong>Giờ chiếu:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: '2-digit', minute: '2-digit' })}<br/>
      <strong>Ghế:</strong> ${booking.bookedSeats.join(", ")}<br/>
    </p>
    <p>Chúc bạn xem phim vui vẻ! 🍿</p>
    <p>
      Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!<br/>
      - CineGo Team
    </p>
  </div>`,
    });
    console.log(`Booking confirmation email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
  }
};
