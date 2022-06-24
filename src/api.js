import FHIR from 'fhirclient';

export const FHIRClient = url => FHIR.client({
    serverUrl: url
});

export const getPatients = (url) => FHIRClient(url).request("Patient");

export const getDeviceRequestsForPatient = (url, patientId) => {
    return FHIRClient(url)
        .request(`DeviceRequest?subject=Patient/${patientId}`, {
            resolveReferences: ["subject", "performer", "insurance"],
            graph: false,
            flat: true,
        })
};


export const getAddress = (url, patientId) => {
    return FHIRClient(url).request(`Patient/${patientId}`, {
        graph: false,
        flat: true,
    })
}

//gets the address of the patient to display on patient tab
export const getAddressByPatient = (url, patientId) => {
    return FHIRClient(url).request(`Patient?_id=${patientId}`, {
        graph: false,
        flat: true,
    })
}




export const getOrganizations = (url) => FHIRClient(url).request("Organization");

export const getCoverage = (url, coverageId) => {
    return FHIRClient(url).request(`Coverage/${coverageId}`, {
        resolveReferences: ["payor"],
        graph: false,
        flat: true,
    })
}

export const getCoverageByPatient = (url, patientId) => {
    return FHIRClient(url).request(`Coverage?beneficiary=Patient/${patientId}`, {
        resolveReferences: ["payor"],
        graph: false,
        flat: true,
    })
}

export const submitGFEClaim = (url, bundle) => {
    const headers = new Headers({
        "Content-Type": "application/json"
    });

    return FHIRClient(url).request({
        url: `${url}/Claim/$gfe-submit`,
        method: "POST",
        headers: headers,
        body: JSON.stringify(bundle)
    });
}

export const getPractitionerRoles = (url) => {
    return FHIRClient(url).request("PractitionerRole", {
        resolveReferences: ["practitioner", "organization", "location"],
        graph: false,
        flat: true,
    })
}

export const getPractitioners = (url) => {
    return FHIRClient(url).request("Practitioner");
}

export const sendAEOInquiry = (url, bundleIdentifier) => {
    return FHIRClient(url).request(`Bundle?identifier=${bundleIdentifier}`)
}

export const getLocations = (url) => {
    return FHIRClient(url).request("Location");
}