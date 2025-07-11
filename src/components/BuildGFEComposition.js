import { v4 } from "uuid";

// gfeBundles: array of GFE Bundle resources included in the packet
const buildGFEComposition = (gfeBundles) => {
    // Find Patient resource for subject from all GFE bundles
    let patientEntry;
    for (const bundle of gfeBundles) {
        patientEntry = bundle.entry?.find(e => e.resource.resourceType === "Patient");
        if (patientEntry) break;
    }
    const patientRef = patientEntry
        ? { reference: `Patient/${patientEntry.resource.id}` }
        : undefined;

    // Gather authors from GFE Bundles (Organization and Practitioner references excluding payers)
    const authors = [];
    gfeBundles.forEach(bundle => {
        bundle.entry?.forEach(e => {
            if (e.resource.resourceType === "Organization") {
                // Exclude organizations with type code "pay"
                const orgType = e.resource.type?.[0]?.coding?.[0]?.code;
                if (orgType !== "pay") {
                    const orgRef = { reference: `Organization/${e.resource.id}` };
                    if (!authors.find(a => a.reference === orgRef.reference)) {
                        authors.push(orgRef);
                    }
                }
            } else if (e.resource.resourceType === "Practitioner") {
                const pracRef = { reference: `Practitioner/${e.resource.id}` };
                if (!authors.find(a => a.reference === pracRef.reference)) {
                    authors.push(pracRef);
                }
            }
        });
    });

    // Gather linkingIdentifier and requestOriginationType from GFE Bundles (first found)
    let linkingIdentifier;
    let requestOriginationType;
    for (const bundle of gfeBundles) {
        if (bundle.linkingIdentifier) {
            linkingIdentifier = bundle.linkingIdentifier;
        }
        if (bundle.requestOriginationType) {
            requestOriginationType = bundle.requestOriginationType;
        }
        // If using FHIR extensions, look for them in the bundle or its resources
        if (bundle.extension) {
            bundle.extension.forEach(ext => {
                if (
                    ext.url === "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeServiceLinkingInfo" &&
                    ext.extension
                ) {
                    const linkExt = ext.extension.find(e => e.url === "linkingIdentifier");
                    if (linkExt) linkingIdentifier = linkExt.valueString;
                }
                if (
                    ext.url === "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/requestOriginationType" &&
                    ext.valueCodeableConcept
                ) {
                    requestOriginationType = ext.valueCodeableConcept;
                }
            });
        }
        if (linkingIdentifier && requestOriginationType) break;
    }

    // Build extensions array
    const extensions = [];
    if (linkingIdentifier) {
        extensions.push({
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeServiceLinkingInfo",
            extension: [
                {
                    url: "linkingIdentifier",
                    valueString: linkingIdentifier
                }
            ]
        });
    }
    if (requestOriginationType) {
        extensions.push({
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/requestOriginationType",
            valueCodeableConcept: requestOriginationType
        });
    }

    // Build sections for each GFE bundle
    const sections = gfeBundles.map(bundle => {
        // Find author organizations and practitioners in this bundle (excluding payers)
        const sectionAuthors = [];
        bundle.entry?.forEach(e => {
            if (e.resource.resourceType === "Organization") {
                const orgType = e.resource.type?.[0]?.coding?.[0]?.code;
                if (orgType !== "pay") {
                    sectionAuthors.push({ reference: `Organization/${e.resource.id}` });
                }
            } else if (e.resource.resourceType === "Practitioner") {
                sectionAuthors.push({ reference: `Practitioner/${e.resource.id}` });
            }
        });
        return {
            code: {
                coding: [
                    {
                        system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentSection",
                        code: "gfe-section"
                    }
                ]
            },
            author: sectionAuthors.length > 0 ? sectionAuthors : undefined,
            entry: [
                {
                    reference: `Bundle/${bundle.id}`
                }
            ]
        };
    });

    // Compose the Composition resource
    const composition = {
        resourceType: "Composition",
        id: `PCT-GFE-Composition-${v4()}`,
        meta: {
            profile: [
                "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-composition"
            ]
        },
        extension: extensions.length > 0 ? extensions : undefined,
        identifier: {
            system: "http://www.example.org/identifiers/composition",
            value: v4()
        },
        status: "final",
        type: {
            coding: [
                {
                    system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentTypeTemporaryTrialUse",
                    code: "gfe-packet",
                    display: "GFE Packet"
                }
            ]
        },
        category: [
            {
                coding: [
                    {
                        system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentTypeTemporaryTrialUse",
                        code: "estimate"
                    }
                ]
            }
        ],
        subject: patientRef,
        date: new Date().toISOString(),
        author: authors,
        title: `Good Faith Estimate Packet for ${patientEntry?.resource?.name?.[0]?.given?.join(" ")} ${patientEntry?.resource?.name?.[0]?.family || ""}`.trim(),
        section: sections
    };

    return composition;
};

export default buildGFEComposition;
