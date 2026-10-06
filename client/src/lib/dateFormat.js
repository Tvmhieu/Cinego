export const dateFormat = (date) => {
  const d = new Date(date);
  
  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23"
  });
  
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  
  return `${time}, ${day}/${month}/${year}`;
};
