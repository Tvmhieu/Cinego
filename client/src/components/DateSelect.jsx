import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import BlurCircle from "./BlurCircle";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DateSelect = ({ dateTime, id, onSelectDate }) => {
  const [selected, setSelected] = useState(null);

  // ←— added guard to prevent runtime errors if dateTime is missing or invalid
  if (!dateTime || typeof dateTime !== "object") {
    return null;
  }

  const handleSelect = (date) => {
    setSelected(date);
    if (onSelectDate) onSelectDate(date);
  };

  return (
    <div id="dateSelect" className="pt-30">
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0px" />

        <div className="flex flex-col items-center">
          <p className="text-lg font-semibold">Chọn ngày chiếu</p>
          <div className="flex items-center gap-6 text-sm mt-5">
            <ChevronLeftIcon width={28} />
            <span className="grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4">
              {Object.keys(dateTime).map((date) => (
                <button
                  onClick={() => handleSelect(date)}
                  key={date}
                  className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer ${
                    selected === date
                      ? "bg-primary text-white"
                      : "border border-primary/70"
                  }`}
                >
                  <span>{new Date(date).getDate()}</span>
                  <span>
                    Thg {new Date(date).getMonth() + 1}
                  </span>
                </button>
              ))}
            </span>
            <ChevronRightIcon width={28} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSelect;
