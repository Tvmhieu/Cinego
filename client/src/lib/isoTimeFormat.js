const isoTimeFormat = (dateTime) => {
  const date = new Date(dateTime);
  const localTime = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23"
  });

  return localTime;
};

export default isoTimeFormat;
