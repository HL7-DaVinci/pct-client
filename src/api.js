import FHIR from 'fhirclient';

export const FHIRClient = url => FHIR.client({
    serverUrl: url
});

export const getPatients = (url) => FHIRClient(url).request("Patient");



export const getClaims = (url) => FHIRClient(url).request("Claim");



export const getDeviceRequestsForPatient = (url, patientId) => {
    return FHIRClient(url)
        .request(`DeviceRequest?subject=Patient/${patientId}`, {
            resolveReferences: ["subject", "performer", "insurance"],
            graph: false,
            flat: true,
        })
};


//gets the address of the patient to display on patient tab
export const getPatientInfo = (url, patientId) => {
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

export const retrieveGFEBundle = (url, taskId) => {
    const headers = {
        "Content-Type": "application/fhir+json",
        "Accept": "application/fhir+json",
        "Accept-Encoding": "identity"
    };
    
    const params = {
        "resourceType": "Parameters",
        "parameter": [{
          "name": "request",
          "valueReference": {
              "reference": `Task/${taskId}`
              }
        }]
    };

    return fetch(`${url}/$gfe-retrieve`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(params)
    });
}

export const submitGFEClaim = (url, bundle) => {
    const headers = {
        "Content-Type": "application/fhir+json",
        "Accept": "application/fhir+json",
        "Accept-Encoding": "identity"
    };
    
    return fetch(`${url}/Claim/$gfe-submit`, {
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

export const pollAEOBStatus = (url) => {
    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Access-Control-Request-Headers": "Retry-After",
            "Origin": "*"
        }
    });
}

export const getLocations = (url) => {
    return FHIRClient(url).request("Location");
}


export const getCoordinationTasks = (url, requester) => {
    let query = `_profile=http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-coordination-task`;
    if (requester) {
        query += `&requester=${encodeURIComponent(requester)}`;
    }
    return FHIRClient(url).request(`Task?${query}`)
        .then((response) => {
            console.log("API Response at", new Date().toISOString(), response);
            return response;
        });
}


export const getContributorTasks = (url, contributor) => {
    let query = `_profile=http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-contributor-task`;
    if (contributor) {
        query += `&owner=${encodeURIComponent(contributor)}`;
    }
    return FHIRClient(url).request(`Task?${query}`);
}

