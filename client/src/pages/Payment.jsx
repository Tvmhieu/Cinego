import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status");
  const code = searchParams.get("code");

  const isSuccess = status === "success";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
      <div
        className={`w-full max-w-md p-8 text-center border rounded-2xl ${
          isSuccess
            ? "bg-green-500/10 border-green-500/30"
            : "bg-red-500/10 border-red-500/30"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-green-500" />
        ) : (
          <XCircle className="w-20 h-20 mx-auto mb-4 text-red-500" />
        )}

        <h1
          className={`mb-2 text-2xl font-bold ${
            isSuccess ? "text-green-400" : "text-red-400"
          }`}
        >
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </h1>

        <p className="mb-4 text-gray-400 text-sm md:text-base leading-relaxed">
          {isSuccess ? (
            <>
              Vé của bạn đã được xác nhận. <br />
              <span className="text-yellow-400 font-medium mt-2 inline-block">Lưu ý:</span> Vui lòng có mặt tại rạp đúng giờ chiếu để có trải nghiệm xem phim tuyệt vời nhất nhé! 🎬
            </>
          ) : (
            "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."
          )}
        </p>

        {code && code !== "invalid" && code !== "error" && (
          <p className="mb-6 text-sm text-gray-500">
            Mã đơn hàng: <span className="font-mono font-medium text-primary">{code}</span>
          </p>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => navigate("/my-bookings")}
            className="px-8 py-3 font-medium transition rounded-full cursor-pointer bg-primary hover:bg-primary-dull active:scale-95"
          >
            {isSuccess ? "Xem vé của tôi" : "Xem lịch sử đặt vé"}
          </button>

          {!isSuccess && (
            <button
              onClick={() => navigate("/movies")}
              className="px-8 py-3 font-medium transition border rounded-full cursor-pointer border-white/20 hover:bg-white/5 active:scale-95"
            >
              Quay lại chọn phim
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
