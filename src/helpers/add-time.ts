export const getFormattedTime = (seconds: number) => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + seconds);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export const getFormattedMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return minutes;
};

export const formatTime = (minutes: number): string => {
  if (!minutes || isNaN(minutes)) return '0 min';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours} h`;

  return `${hours}h ${remainingMinutes} min`;
};