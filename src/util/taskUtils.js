import { getOrganizations, getPractitioners } from "../api";
import {getDisplayNameForParticipant} from "./displayUtils";


export function getParticipants(coordinationServer) {
  let options = [];
  return Promise.all([
    getOrganizations(coordinationServer),
    getPractitioners(coordinationServer)
  ]).then((res) => {
    (res || []).forEach((bundle) => {
      bundle.entry.forEach((entry) => {
        if (!entry.resource) return;
        // Skip payer organizations in participants
        if (entry.resource.resourceType === "Organization" && entry.resource?.type?.some(t => t?.coding?.some(c => c?.code === 'pay'))) {
          return;
        }
        const label = getDisplayNameForParticipant(entry.resource);
        const value = `${entry.resource.resourceType}/${entry.resource.id}`;
        if (label && value) options.push({ value, label });
      });
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
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