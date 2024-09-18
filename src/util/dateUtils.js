
export const displayInstant = (instant) => {
  if (!instant) {
    return "";
  }
  return new Date(instant).toLocaleString();
}


export const displayPeriod = (period) => {
  if (!period) {
    return "";
  }

  return `${displayInstant(period.start)} - ${displayInstant(period.end)}`;
}
