import FHIR from 'fhirclient';

export const
    FHIRClient = (url, tokenValue) => {
    const config = { serverUrl: url };
    if (tokenValue) {
        config.tokenResponse = {
            access_token: tokenValue,
            token_type: "Bearer"
        };
    }
    return FHIR.client(config);
};

export const getOrganizations = (url) => {
    return FHIRClient(url, getAccessToken("ehr")).request("Organization");
};

export const getPatients = (url) => FHIRClient(url, getAccessToken("ehr")).request("Patient");

export const getClaims = (url) => FHIRClient(url, getAccessToken("ehr")).request("Claim");

export const getDeviceRequestsForPatient = (url, patientId) => {
    return FHIRClient(url, getAccessToken("ehr")).request(`DeviceRequest?subject=Patient/${patientId}`, {
        resolveReferences: ["subject", "performer", "insurance"],
        graph: false,
        flat: true,
    });
};

//gets the address of the patient to display on patient tab
export const getPatientInfo = (url, patientId) => {
    return FHIRClient(url, getAccessToken("ehr")).request(`Patient?_id=${patientId}`, {
        graph: false,
        flat: true,
    });
};

export const getCoverage = (url, coverageId) => {
    return FHIRClient(url, getAccessToken("ehr")).request(`Coverage/${coverageId}`, {
        resolveReferences: ["payor"],
        graph: false,
        flat: true,
    });
};

export const getCoverageByPatient = (url, patientId) => {
    return FHIRClient(url, getAccessToken("ehr")).request(`Coverage?beneficiary=Patient/${patientId}`, {
        resolveReferences: ["payor"],
        graph: false,
        flat: true,
    });
};

export const retrieveGFEPacket = (url, taskId) => {
    const tokenValue = getAccessToken("cp");
    const headers = {
        "Accept": "application/fhir+json",
        "Accept-Encoding": "identity"
    };
    if (tokenValue) {
        headers["Authorization"] = `Bearer ${tokenValue}`;
    }
    return fetch(`${url}/Task/${taskId}/$gfe-retrieve`, {
        method: "POST",
        headers: headers
    });
};

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
            //headers['Content-Location'] = "";
        }
    }
    return fetch(`${url}/Claim/$gfe-submit`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(bundle)
    });
};

export const getPractitionerRoles = (url) => {
    return FHIRClient(url, getAccessToken("ehr")).request("PractitionerRole", {
        resolveReferences: ["practitioner", "organization", "location"],
        graph: false,
        flat: true,
    })
}

export const getPractitioners = (url) => {
    return FHIRClient(url, getAccessToken("ehr")).request("Practitioner");
}

export const sendAEOInquiry = (url, bundleIdentifier) => {
    return FHIRClient(url, getAccessToken("cp")).request(`Bundle?identifier=${bundleIdentifier}`)
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
    return FHIRClient(url, getAccessToken("ehr")).request("Location");
}


export const getCoordinationTasks = (url, dataServer, requester) => {
    let query;
    if (!needsToken(url)) {
        query = `_total=accurate&_profile=http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-coordination-task`;
        if (requester) {
            query += `&requester=${encodeURIComponent(`${dataServer.replace(/\/+$/, '')}/${requester}`)}`;
        }
        return FHIRClient(url, getAccessToken("cp")).request(`Task?${query}`);
    } else {
        return FHIRClient(url, getAccessToken("cp")).request("Task");
    }
}

export const getContributorTasks = (url, dataServer, contributor) => {
    let query;
    if (!needsToken(url)) {
        query = `_total=accurate&_profile=http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-contributor-task`;
        if (contributor) {
            query += `&owner=${encodeURIComponent(`${dataServer.replace(/\/+$/, '')}/${contributor}`)}`;
        }
        return FHIRClient(url, getAccessToken("cp")).request(`Task?${query}`);
    } else {
        return FHIRClient(url, getAccessToken("cp")).request("Task");
    }
}

export const searchDocumentReference = (url, params, key) => {
    const headers = {
        "Accept": "application/fhir+json"
    };
    const tokenValue = getAccessToken(key)
    if (tokenValue) {
        //console.log("Adding Authorization header with token:", tokenValue);
        headers['Authorization'] = `Bearer ${tokenValue}`;
    }
    const query = new URLSearchParams(params).toString();
    return fetch(`${url}/DocumentReference?${query}`, {
        method: "GET",
        headers: headers
    });
}

export function needsToken(url) {
    return url && !(url.includes('localhost') || url.includes('pct-payer') || url.includes('pct-coordination-platform') || url.includes('pct-ehr'));
}

export const getAccessToken = (key) => {
    const tokenKeyMap = {
        payer: 'payer-token',
        ehr: 'ehr-token',
        cp: 'cp-token'
    };
    //console.log("Getting access token for key:", key);
    if (key && tokenKeyMap[key]) {
        //console.log(`Retrieving token for key: ${key}, tokenKey: ${tokenKeyMap[key]}, tokenValue: ${localStorage.getItem(tokenKeyMap[key])}`);
        return localStorage.getItem(tokenKeyMap[key]);
    }
    return null;
};

export const getExpandedValueset = async (url, valueSetUrl, text = "") => {
    if (!url || !valueSetUrl || !text) return [];
    const token = getAccessToken("ehr");
    const headers = { "Accept": "application/fhir+json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Helper function to fetch expansion results
    const fetchExpansion = async (expandUrl) => {
        const response = await fetch(expandUrl, { headers });
        if (!response.ok) return [];
        const data = await response.json();
        if (data.expansion && Array.isArray(data.expansion.contains)) {
            return data.expansion.contains.map(e => ({ code: e.code || "", display: e.display || "" }));
        }
        return [];
    };
    // In FHIR R4, the $expand filter param matches only display, not code
    //If text is numeric (code search), get all code concepts and filter manually; else use expand filter param.
    if (/^\d+$/.test(text)) {
        const expandUrl = `${url}/ValueSet/$expand?url=${encodeURIComponent(valueSetUrl)}`;
        const allCodes = await fetchExpansion(expandUrl);
        const match = allCodes.filter(e =>
            (e.code && e.code.includes(text)) ||
            (e.display && e.display.toLowerCase().includes(text.toLowerCase()))
        );
        if (match.length > 0) return match;
        return await fetchExpansion(`${expandUrl}&filter=${text}`);
    } else {
        return await fetchExpansion(`${url}/ValueSet/$expand?url=${encodeURIComponent(valueSetUrl)}&filter=${text}`);
    }
};
