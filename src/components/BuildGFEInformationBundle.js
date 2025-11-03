import { v4 as uuidv4 } from 'uuid';

// Dynamically build a GFE Information Bundle from patient, coverage and ServiceRequest resources
export default function buildGFEInformationBundle({ patient, coverage, payor, providers = [], providerOrganizations = [], requestedServiceItems = [] }) {
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
            const srResource = createServiceRequestResource({
                code: item.code,
                description: item.description,
                patientId: patient?.id || 'unknown',
                id: srId,
                system: item.system // Use system from the row
            });
            return {
                id: srId,
                fullUrl: `http://example.org/fhir/ServiceRequest/${srId}`,
                resource: srResource
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
            ...requestedServiceItemEntries
        ]
    };
}

function createServiceRequestResource({ code, description, patientId, id, system }) {
    return {
        resourceType: "ServiceRequest",
        id: id,
        meta: {
            profile: [
                "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-servicerequest"
            ]
        },
        text: {
            status: "generated",
            div: `<div xmlns=\"http://www.w3.org/1999/xhtml\"><a name=\"ServiceRequest_${id}\"> </a><p><b>Generated Narrative: ServiceRequest</b><a name=\"${id}\"> </a></p><div style=\"display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%\"><p style=\"margin-bottom: 0px\">Resource ServiceRequest &quot;${id}&quot; </p><p style=\"margin-bottom: 0px\">Profile: <a href=\"StructureDefinition-davinci-pct-servicerequest.html\">PCT GFE ServiceRequest</a></p></div><p><b>status</b>: active</p><p><b>intent</b>: proposal</p><p><b>code</b>: ${description} <span style=\"background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki\"> (<a href=\"http://terminology.hl7.org/5.3.0/CodeSystem-CPT.html\">Current Procedural Terminology (CPTÂ®)</a>#${code})</span></p><p><b>subject</b>: See on this page: Patient/${patientId}</p></div>`
        },
        status: "active",
        intent: "proposal",
        code: {
            coding: [
                {
                    system: system || "http://www.ama-assn.org/go/cpt",
                    code: code,
                    display: description
                }
            ]
        },
        subject: {
            reference: `Patient/${patientId}`
        }
    };
}
