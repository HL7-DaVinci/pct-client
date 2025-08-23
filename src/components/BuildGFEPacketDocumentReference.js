const PCT_GFE_BUNDLE_PROFILE = "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-bundle";
const PCT_GFE_MISSING_BUNDLE_PROFILE = "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-missing-bundle";

const buildGFEPacketDocumentReference = (gfePacket, coordinationTask) => {
    console.log("Building GFE Packet DocumentReference for coordination task " + coordinationTask.id);
    const docRef = {
        resourceType: "DocumentReference",
        id: `PCT-GFE-DocumentReference-${coordinationTask.id}`,
        meta: {
            profile: ["http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-document-reference"]
        },
        status: "current",
        docStatus: (coordinationTask.businessStatus === "closed") ? "final" : "preliminary",
        type: {
            coding: [{
                system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentTypeTemporaryTrialUse",
                code: "gfe-packet"
            }]
        },
        category: [{
            coding: [{
                system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentCategoryTemporaryTrialUse",
                code: "estimate"
            }]
        }],
        date: new Date().toISOString(),
        content: [{
            attachment: {
                contentType: "application/fhir+json",
                data: btoa(JSON.stringify(gfePacket)) // Attach the whole GFE packet as base64
            },
            format: {
                system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentTypeTemporaryTrialUse",
                code: "pct-gfe-packet"
            }
        }],
        author: [],
        extension: [],
    };

    // Get requestInitiationTime from coordinationTask extension directly
    let requestInitiationTime;
    if (coordinationTask.extension) {
        const ext = coordinationTask.extension.find(
            e => e.url === "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/requestInitiationTime"
        );
        requestInitiationTime = ext?.valueInstant;
    }
    docRef.extension.push({
        url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/requestInitiationTime",
        valueInstant: requestInitiationTime
    });

    // Find and copy gfeServiceLinkingInfo extension from the Composition resource in the GFE packet
    gfePacket.entry?.forEach(entry => {
        if (entry.resource?.resourceType === 'Composition') {
            const compExtensions = entry.resource.extension || [];
            const gfeServiceLinkingInfo = compExtensions.find(
                ext => ext.url === "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeServiceLinkingInfo"
            );
            if (gfeServiceLinkingInfo) {
                // Copy the extension as-is
                docRef.extension.push({ ...gfeServiceLinkingInfo });
            }
        }
    });

    // Find Patient entry in gfePacket.entries
    const patientEntry = gfePacket?.entry?.find(e => e.resource?.resourceType === 'Patient');
    if (patientEntry && patientEntry.resource?.id) {
        docRef.subject = { reference: `Patient/${patientEntry.resource.id}` };
    }

    // Use a Set to track unique author references
    const authorRefs = new Set();
    const addUniqueAuthor = (ref) => {
        if (ref) authorRefs.add(ref);
    };
    const isGFEBundle = (resource) => {
        return resource?.resourceType === 'Bundle' &&
            resource.meta?.profile?.includes(PCT_GFE_BUNDLE_PROFILE) &&
            !(resource.meta?.profile?.includes(PCT_GFE_MISSING_BUNDLE_PROFILE));
    };

    gfePacket.entry?.forEach(entry => {
        if (entry.resource?.resourceType === 'Patient' && !docRef.subject) {
            docRef.subject = { reference: `Patient/${entry.resource.id}` };
        }

        let bundle = null;
        if (isGFEBundle(entry.resource)) {
            bundle = entry.resource;
        }
        if (bundle && Array.isArray(bundle.entry)) {
            bundle.entry.forEach(bundleEntry => {
                if (
                    bundleEntry.resource?.resourceType === 'Claim' &&
                    !(bundleEntry.resource.type?.coding?.some(coding => coding.code === "estimate-summary"))
                ) {
                    const claim = bundleEntry.resource;
                    if (claim.provider && claim.provider.reference) addUniqueAuthor(claim.provider.reference);
                    if (claim.insurer && claim.insurer.reference) addUniqueAuthor(claim.insurer.reference);
                }
            });
        }
    });

    docRef.author = Array.from(authorRefs).map(ref => ({ reference: ref }));
    console.log("Authors added to DocumentReference:", docRef.author);
    return docRef; // Return the created DocumentReference
};

export default buildGFEPacketDocumentReference;