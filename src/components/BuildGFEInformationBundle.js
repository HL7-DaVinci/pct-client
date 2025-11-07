import { v4 as uuidv4 } from 'uuid';

// Dynamically build a GFE Information Bundle from patient, coverage, ServiceRequest, DeviceRequest, and MedicationRequest resources
export default function buildGFEInformationBundle({ patient, coverage, payor, providers = [], providerOrganizations = [], requestedServiceItems = [], deviceRequestItems = [], medicationRequestItems = [] }) {
    const patientEntry = (patient && patient.id) ? {
        id: patient.id,
        fullUrl: `http://example.org/fhir/Patient/${patient.id}`,
        resource: patient
    } : null;

    const coverageEntry = (coverage && coverage.id) ? {
        id: coverage.id,
        fullUrl: `http://example.org/fhir/Coverage/${coverage.id}`,
        resource: coverage
    } : null;

    // Handle payor as array or object
    let payorObj = payor;
    if (Array.isArray(payor) && payor.length > 0) {
        payorObj = payor[0];
    }
    const payorEntry = (payorObj && payorObj.id) ? {
        id: payorObj.id,
        fullUrl: `http://example.org/fhir/Organization/${payorObj.id}`,
        resource: payorObj
    } : null;

    const providerEntries = Array.isArray(providers) ? providers.map(provider => ({
        id: provider.id,
        fullUrl: `urn:uuid:${provider.id}`,
        resource: provider
    })) : [];

    const providerOrganizationEntries = Array.isArray(providerOrganizations) ? providerOrganizations.map(org => ({
        id: org.id,
        fullUrl: `urn:uuid:${org.id}`,
        resource: org
    })) : [];

    // Multiple requested items (ServiceRequest)
    const requestedServiceItemEntries = Array.isArray(requestedServiceItems)
        ? requestedServiceItems.map((item) => {
            const srId = `PCT-ServiceRequest-${uuidv4()}`;
            const srResource = createRequestItemResource(item, 'ServiceRequest', srId, patient?.id || 'unknown');
            return {
                id: srId,
                fullUrl: `http://example.org/fhir/ServiceRequest/${srId}`,
                resource: srResource
            };
        })
        : [];

    const deviceRequestItemEntries = Array.isArray(deviceRequestItems)
        ? deviceRequestItems.map((item) => {
            const drId = `PCT-DeviceRequest-${uuidv4()}`;
            const drResource = createRequestItemResource(item, 'DeviceRequest', drId, patient?.id || 'unknown');
            return {
                id: drId,
                fullUrl: `http://example.org/fhir/DeviceRequest/${drId}`,
                resource: drResource
            };
        })
        : [];

    const medicationRequestItemEntries = Array.isArray(medicationRequestItems)
        ? medicationRequestItems.map((item) => {
            const mrId = `PCT-MedicationRequest-${uuidv4()}`;
            const mrResource = createRequestItemResource(item, 'MedicationRequest', mrId, patient?.id || 'unknown');
            return {
                id: mrId,
                fullUrl: `http://example.org/fhir/MedicationRequest/${mrId}`,
                resource: mrResource
            };
        })
        : [];

    return {
        resourceType: "Bundle",
        //id: id || "PCT-GFE-Information-Bundle-1",
        meta: {
            profile: [
                "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-information-bundle"
            ]
        },
        type: "collection",
        timestamp: new Date().toISOString(),
        entry: [
            ...(patientEntry ? [patientEntry] : []),
            ...(coverageEntry ? [coverageEntry] : []),
            ...(payorEntry ? [payorEntry] : []),
            ...providerEntries,
            ...providerOrganizationEntries,
            ...requestedServiceItemEntries,
            ...deviceRequestItemEntries,
            ...medicationRequestItemEntries
        ]
    };
}

function createRequestItemResource(item, resourceType, id, patientId) {
    // Use a single template and fill in details dynamically
    let codeProp, codeSystem;
    if (resourceType === 'ServiceRequest') {
        codeProp = 'code';
        codeSystem = 'http://www.ama-assn.org/go/cpt';
    } else if (resourceType === 'DeviceRequest') {
        codeProp = 'codeCodeableConcept';
        codeSystem = 'http://snomed.info/sct';
    } else if (resourceType === 'MedicationRequest') {
        codeProp = 'medicationCodeableConcept';
        codeSystem = 'http://www.nlm.nih.gov/research/umls/rxnorm';
    } else {
        codeProp = 'code';
        codeSystem = item.system || '';
    }

    return {
        resourceType,
        id,
        meta: {
            profile: [`http://hl7.org/fhir/StructureDefinition/${resourceType}`]
        },
        status: 'active',
        intent: 'proposal',
        subject: { reference: `Patient/${patientId}` },
        [codeProp]: {
            coding: [
                {
                    system: codeSystem,
                    code: item.code,
                    display: item.description
                }
            ]
        }
    };
}
