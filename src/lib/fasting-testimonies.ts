const parseMinuteDate = (date: string) => {
  const [day, month, year] = date.split("-").map(Number);

  if (!day || !month || !year) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
};

export const isFastingTestimoniesDate = (date: string) => {
  const parsedDate = parseMinuteDate(date);

  if (!parsedDate || parsedDate.getUTCDay() !== 0) {
    return false;
  }

  const month = parsedDate.getUTCMonth() + 1;
  const weekOfMonth = Math.floor((parsedDate.getUTCDate() - 1) / 7) + 1;

  return weekOfMonth === (month === 4 || month === 10 ? 2 : 1);
};
