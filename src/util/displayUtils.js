
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


export const displayAddress = (address) => {

  if (!address) {
    return "";
  }

  return address.line && address.line.length > 0 ? 
    `${address.line.join(", ")} ${address.city}, ${address.state} ${address.postalCode} ${address.country}`
    :
    address.text;

}
