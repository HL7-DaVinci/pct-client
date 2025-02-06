import React from 'react';

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

export const getHumanDisplayName = (resource) => {
  if (resource === undefined) return null;
  const name = resource.name[0];
  if (name.text != null) return name.text;
  else return `${name.given[0]} ${name.family}`;
}


export const getCodingDisplayFragment = (coding) => {
  return (coding || []).map((c, index, array) => (
    <React.Fragment key={index}>
      {`${c.code} (${c.system || 'unknown'}) ${c.display}`}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
}

export const getDisplayForReferenceFromBundle = (reference, bundle) => {

  if (!reference) {
    return "";
  }
  if (!bundle) {
    return reference;
  }

  const type = reference.split("/")[0];
  const id = reference.split("/")[1];
  const entries = (bundle.entry || []).filter((entry) => entry.resource.resourceType === type);

  if (!type || !id || entries.length < 1) {
    return reference;
  }

  const entry = entries.find((entry) => entry.resource.resourceType === type && entry.resource.id === id);
  console.log("entry:", entry);

  if (!entry) {
    return reference;
  }

  if (type === "Patient") {
    return `${getHumanDisplayName(entry.resource)} (${entry.resource.id})`;
  }
  else if (type === "Organization") {
    if (entry.resource.name) {
      return `${entry.resource.name} (${entry.resource.id})`;
    }
    return entry.resource.id;
  }

  return reference;

}
