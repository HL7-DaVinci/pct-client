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

export const getOrganizations = (url, context = "cp") => {
    return FHIRClient(url, getAccessToken(context)).request("Organization");
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

export const getPractitioners = (url, context = "cp") => {
    return FHIRClient(url, getAccessToken(context)).request("Practitioner");
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


export const getCoordinationTasks = async (url, dataServer, requester) => {
    let queryParams = [];
    const isRequesterSupported = isSearchParamsSupported("requester", "Task", "cp");
    const isCodeSupported = isSearchParamsSupported("code", "Task", "cp");
    if (isCodeSupported) {
        queryParams.push("code=gfe-coordination-task");
    }
    if (requester && isRequesterSupported) {
        queryParams.push(`requester=${encodeURIComponent(requester)}`);
    }
    const query = queryParams.length ? queryParams.join('&') : '';
    try {
        const response = await FHIRClient(url, getAccessToken("cp")).request(`Task${query ? '?' + query : ''}`);
        let filteredEntries = response.entry || [];
        // Manual filters if server does not support code or requester
        if (!isCodeSupported || (!isRequesterSupported && requester)) {
            filteredEntries = filteredEntries.filter(entry => {
                let codeMatch = true;
                let requesterMatch = true;
                if (!isCodeSupported) {
                    const codingArr = entry.resource?.code?.coding;
                    codeMatch = Array.isArray(codingArr) && codingArr.some(coding =>
                        coding.system === "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFERequestTaskCSTemporaryTrialUse" &&
                        coding.code === "gfe-coordination-task"
                    );
                }
                if (!isRequesterSupported && requester) {
                    const requesterRef = entry.resource?.requester?.reference;
                    requesterMatch = requesterRef === requester;
                }
                return codeMatch && requesterMatch;
            });
        }
        return { ...response, entry: filteredEntries };
    } catch (error) {
        console.error('[CoordinationTasks] Error:', error);
        return { entry: [], error };
    }
}

export const getContributorTasks = async (url, dataServer, contributor) => {
    let queryParams = [];
    const isOwnerSupported = isSearchParamsSupported("owner", "Task", "cp");
    const isCodeSupported = isSearchParamsSupported("code", "Task", "cp");
    if (isCodeSupported) {
        queryParams.push("code=gfe-contributor-task");
    }
    if (contributor && isOwnerSupported) {
        queryParams.push(`owner=${encodeURIComponent(contributor)}`);
    }
    const query = queryParams.length ? queryParams.join('&') : '';
    try {
        const response = await FHIRClient(url, getAccessToken("cp")).request(`Task${query ? '?' + query : ''}`);
        let filteredEntries = response.entry || [];
        // Manual filters if server does not support code or owner
        if (!isCodeSupported || (!isOwnerSupported && contributor)) {
            filteredEntries = filteredEntries.filter(entry => {
                let codeMatch = true;
                let ownerMatch = true;
                if (!isCodeSupported) {
                    const codingArr = entry.resource?.code?.coding;
                    codeMatch = Array.isArray(codingArr) && codingArr.some(coding =>
                        coding.system === "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFERequestTaskCSTemporaryTrialUse" &&
                        coding.code === "gfe-contributor-task"
                    );
                }
                if (!isOwnerSupported && contributor) {
                    const ownerRef = entry.resource?.owner?.reference;
                    ownerMatch = ownerRef === contributor;
                }
                return codeMatch && ownerMatch;
            });
        }
        return { ...response, entry: filteredEntries };
    } catch (error) {
        console.error('[ContributorTasks] Error:', error);
        return { entry: [], error };
    }
}

export const getContributorTasksByPartOf = async (coordinationServer, taskId) => {
    const isPartOfSupported = isSearchParamsSupported("part-of", "Task", "cp");
    if (isPartOfSupported) {
        const response = await FHIRClient(coordinationServer, getAccessToken("cp")).request(`Task?part-of=${encodeURIComponent(taskId)}`);
        return (response.entry || []).map((entry) => entry.resource);
    } else {
        // Manual filter
        const response = await FHIRClient(coordinationServer, getAccessToken("cp")).request(`Task`);
        const filtered = (response.entry || []).filter(entry => {
            const partOfRef = entry.resource?.partOf?.reference;
            return partOfRef === `Task/${taskId}` || partOfRef === taskId;
        }).map(entry => entry.resource);
        return filtered;
    }
};

export const searchDocumentReference = async (url, params, context) => {
    let searchParams = {...params};
    const isTypeSupported = isSearchParamsSupported('type', 'DocumentReference', context);
    const isAuthorSupported = isSearchParamsSupported('author', 'DocumentReference', context);
    let requiredType = null;
    if (!isTypeSupported && searchParams['type']) {
        requiredType = searchParams['type'];
        delete searchParams['type'];
    }
    if (!isAuthorSupported) {
        delete searchParams['author'];
    }
    const headers = {
        "Accept": "application/fhir+json"
    };
    const tokenValue = getAccessToken(context)
    if (tokenValue) {
        headers['Authorization'] = `Bearer ${tokenValue}`;
    }
    const query = new URLSearchParams(searchParams).toString();
    const fetchUrl = query ? `${url}/DocumentReference?${query}` : `${url}/DocumentReference`;
    const response = await fetch(fetchUrl, {
        method: "GET",
        headers: headers
    });
    if (!isTypeSupported && requiredType) {
        // Manual filter for type
        try {
            if (response.entry && Array.isArray(response.entry)) {
                const filteredEntries = response.entry.filter(entry => {
                    const codings = entry.resource?.type?.coding || [];
                    return codings.some(coding =>
                        coding.system === "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentTypeTemporaryTrialUse" &&
                        coding.code === requiredType
                    );
                });
                return {...response, entry: filteredEntries};
            }
            return response;
        } catch (e) {
            console.error('[searchDocumentReference] Error filtering type:', e);
            return response;
        }
    }
    return response;
}

export function needsToken(url) {
    return url && !(url.includes('localhost') || url.includes('pct-payer') || url.includes('pct-coordination-platform') || url.includes('pct-ehr'));
}

export const getAccessToken = (context) => {
    const tokenKeyMap = {
        payer: 'payer-token',
        ehr: 'ehr-token',
        cp: 'cp-token'
    };
    //console.log("Getting access token for key:", key);
    if (context && tokenKeyMap[context]) {
        //console.log(`Retrieving token for key: ${key}, tokenKey: ${tokenKeyMap[key]}, tokenValue: ${localStorage.getItem(tokenKeyMap[key])}`);
        return localStorage.getItem(tokenKeyMap[context]);
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

/**
 * Fetches CapabilityStatement and extracts supported search parameters for a given resource type and server.
 */
export const getSupportedSearchParams = async (url, resourceType = "Task", context) => {
    const capability = await FHIRClient(url, getAccessToken(context)).request("metadata");
    let searchParams = [];
    const localStorageKey = `searchParams_${resourceType}_${context}`;
    if (capability.rest && Array.isArray(capability.rest)) {
        const rest = capability.rest.find(r => r.resource);
        if (rest) {
            const resource = rest.resource.find(res => res.type === resourceType);
            if (resource && Array.isArray(resource.searchParam)) {
                searchParams = resource.searchParam.map(param => param.name);
                localStorage.setItem(localStorageKey, JSON.stringify(searchParams));
                console.log(`${localStorageKey}:`, searchParams);
            } else {
                console.warn(`Resource type '${resourceType}' not found in CapabilityStatement for context '${context}'.`);
                localStorage.setItem(localStorageKey, JSON.stringify([]));
            }
        }
    } else {
        localStorage.setItem(localStorageKey, JSON.stringify([]));
    }
};

export function isSearchParamsSupported(param, resourceType = "Task", context) {
    const key = `searchParams_${resourceType}_${context}`;
    let params = localStorage.getItem(key);
    if (params) {
        try {
            const arr = JSON.parse(params);
            return arr.includes(param);
        } catch (e) {
            console.warn(`Failed to parse stored searchParams for ${resourceType} (${context})`, e);
        }
    }
    return false;
}

export const searchResourceByParams = async (url, type, params = [], context = "ehr") => {
    if (!params || params.length === 0) return null;
    let query = `${type}`;
    if (params.length > 0) {
        const queryString = params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
        query += `?${queryString}`;
    }
    console.log(`Searching for ${type} with params:`, query);
    try {
        const result = await FHIRClient(url, getAccessToken(context)).request(query);
        if (result && result.entry && result.entry.length > 0) {
            const resource = result.entry[0].resource;
            console.log(`Found existing ${type} (id):`, resource.id);
            return resource;
        }
    } catch (e) {
        console.error(`Error searching for ${type}:`, e);
    }
    return null;
};

export const upsertResource = async (url, resource, context = "ehr") => {
    if (!resource || !resource.resourceType) return { resource: null, created: false, updated: false };
    const type = resource.resourceType;
    try {
        // If resource.id is present, use update (PUT) to create with client-supplied id
        if (resource.id) {
            // Remove urn:uuid: prefix from id if present to use as FHIR id
            const resourceId = resource.id;
            if (typeof resourceId === 'string') {
                const urnMatch = resourceId.match(/^urn:uuid:(.+)$/);
                if (urnMatch) resource.id = urnMatch[1];
            }
            const resourceUrl = `${url}/${type}/${resource.id}`;
            const token = getAccessToken(context);
            const response = await fetch(resourceUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/fhir+json",
                    "Accept": "application/fhir+json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(resource)
            });
            let createdResource = null;
            if (response.ok) {
                createdResource = await response.json();
                console.info(`[upsertResource] PUT succeeded for resourceType=${type}, id=${createdResource?.id}`);
            }
            console.info("Response status:", response.status);
            return { resource: createdResource, created: response.status === 201, updated: response.status === 200 };
        } else {
            // No resource.id, create resource (POST) with server-generated id
            const created = await FHIRClient(url, getAccessToken(context)).create(resource);
            console.info(`[upsertResource] POST (server-generated id) for ${type}:`, created.id);
            return { resource: created, created: true, updated: false };
        }
    } catch (e) {
        console.error(`Error upserting ${type}/${resource.id}:`, e);
        return { resource: null, created: false, updated: false, error: e };
    }
};

export const searchCoordinationEntities = async (url, type, text = "") => {
    if (!url || !type || !text) return [];
    const context = "cp";
    const token = getAccessToken(context);
    const headers = { "Accept": "application/fhir+json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    let results = [];
    try {
        // _id search first
        const byId = await FHIRClient(url, token).request(`${type}?_id=${encodeURIComponent(text)}`);
        if (byId?.entry?.length > 0) {
            results = byId.entry.map(entry => entry.resource);
            return results;
        }
        // Fallback to partial name search
        const byName = await FHIRClient(url, token).request(`${type}?name=${encodeURIComponent(text)}`);
        if (byName?.entry?.length > 0) {
            results = byName.entry.map(entry => entry.resource);
        }
    } catch (e) {
        throw new Error(e?.message || "Error searching for entities");
    }
    return results;
};