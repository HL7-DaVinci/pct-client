
export const displayInstant = (instant, includeTime=true) => {
  if (!instant) {
    return "";
  }

  if (!includeTime) {
    return new Date(instant).toLocaleDateString();
  }
  return new Date(instant).toLocaleString();
}


export const displayPeriod = (period, includeTime=true) => {
  if (!period) {
    return "";
  }

  return `${displayInstant(period.start, includeTime)} - ${displayInstant(period.end, includeTime)}`;
}
