import Booking from "../models/Booking.js";
import sendEmail from "../configs/nodemailer.js";

export const sendBookingConfirmationEmail = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      })
      .populate("user");

    if (!booking) {
      console.error("sendBookingConfirmationEmail: Booking not found");
      return;
    }

    if (!booking.user || !booking.user.email) {
      console.error("sendBookingConfirmationEmail: User email not found");
      return;
    }

    await sendEmail({
      to: booking.user.email,
      subject: `Xác nhận đặt vé thành công: "${booking.show.movie.title}"`,
      body: `<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    <h2>Xin chào ${booking.user.name},</h2>
    <p>
      Vé xem phim 
      <strong style="color: #F84565;">"${booking.show.movie.title}"</strong> của bạn đã được xác nhận.
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
    console.log(`Booking confirmation email sent successfully to ${booking.user.email}`);
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
  }
};
