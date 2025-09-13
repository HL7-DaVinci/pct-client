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

export const retrieveGFEPacket = (url, taskId) => {
    const headers = {
        "Accept": "application/fhir+json",
        "Accept-Encoding": "identity"
    };

    return fetch(`${url}/Task/${taskId}/$gfe-retrieve`, {
        method: "POST",
        headers: headers
    });
}

export const submitGFEClaim = (url, bundle) => {
    const headers = {
        "Content-Type": "application/fhir+json",
        "Accept": "application/fhir+json",
        "Accept-Encoding": "identity"
    };
    if(url.includes("healthsparq")) {
        const tokenValue = localStorage.getItem('payer-token');
        if (tokenValue) {
            headers['Subject-Token'] = `${tokenValue}`;
        }
    }
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
    const headers = {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "Access-Control-Request-Headers": "Retry-After",
        "Origin": "*"
    };
    if(url.includes("healthsparq")) {
        const subjectToken = localStorage.getItem('payer-token');
        if (subjectToken) {
            headers['Subject-Token'] = subjectToken;
        }
    }
    return fetch(url, {
        method: "GET",
        headers: headers
    });
}

export const getLocations = (url) => {
    return FHIRClient(url).request("Location");
}


export const getCoordinationTasks = (url, dataServer, requester) => {
    let query = `_total=accurate&_profile=http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-coordination-task`;
    if (requester) {
        query += `&requester=${encodeURIComponent(`${dataServer.replace(/\/+$/, '')}/${requester}`)}`;
    }
    return FHIRClient(url).request(`Task?${query}`);
}


export const getContributorTasks = (url, dataServer, contributor) => {
    let query = `_total=accurate&_profile=http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-contributor-task`;
    if (contributor) {
        query += `&owner=${encodeURIComponent(`${dataServer.replace(/\/+$/, '')}/${contributor}`)}`;
    }
    return FHIRClient(url).request(`Task?${query}`);
}

export const searchDocumentReference = (url, params) => {
    const headers = {
        "Accept": "application/fhir+json"
    };
    const tokenValue = localStorage.getItem('payer-token');
    if (tokenValue) {
        headers['Authorization'] = `Bearer ${tokenValue}`;
    }
    const query = new URLSearchParams(params).toString();
    return fetch(`${url}/DocumentReference?${query}`, {
        method: "GET",
        headers: headers
    });
}

