import { getOrganizations, getPractitioners } from "../api";


export function getParticipants(coordinationServer) {
  let options = [];
  return Promise.all([
    getOrganizations(coordinationServer),
    getPractitioners(coordinationServer)
  ]).then((res) => {
    (res || []).forEach((bundle) => {
      bundle.entry.forEach((entry) => {
        options.push(`${entry.resource.resourceType}/${entry.resource.id}`);
      });
    });
    options.sort();
    return options;
  }).catch(() => {
    return [];
  });
}


export function getRequestInitiationTime(task) {

  if (!task) {
    return null;
  }

  const initiationTimeExt = task.extension?.find((extension) => extension.url === "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/requestInitiationTime");

  if (initiationTimeExt) {
    return initiationTimeExt.valueInstant;
  }

  return null;
}


export function getPlannedServicePeriod(task) {

  if (!task) {
    return null;
  }

  const plannedServicePeriodExt = task.extension?.find((extension) => extension.url === "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/plannedServicePeriod");

  if (plannedServicePeriodExt) {
    return plannedServicePeriodExt.valuePeriod;
  }

  return null;
}