export const dateFormat = (date) => {
  return new Date(date).toLocaleString("vi-VN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
};
