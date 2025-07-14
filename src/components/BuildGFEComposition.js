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

    // Gather authors from GFE Bundles (All the provider references who submitted)
    const authors = [];

    // Build extensions array
    const extensions = [];
    extensions.push({
        url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeServiceLinkingInfo",
        extension: [
            {
                url: "linkingIdentifier",
                valueString: "223452-2342-2435-008002"
            }
        ]
    });
    extensions.push({
        url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/requestOriginationType",
        valueCodeableConcept: {
            coding: [
                {
                    system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFERequestTypeCSTemporaryTrialUse",
                    code: "nonscheduled-request"
                }
            ]
        }
    });



    // Build sections for each GFE bundle
    const sections = gfeBundles.map(bundle => {
        // Find authors (all the providers who submitted)
        const sectionAuthors = [];
        bundle.entry?.forEach(e => {
            if (e.resource.resourceType === "Claim" && !(e.resource.type?.coding?.some(coding => coding.code === "estimate-summary"))) {
                if (e.resource.provider && e.resource.provider.reference) {
                    const providerRef = e.resource.provider;
                    if (!authors.find(a => a.reference === providerRef.reference)) {
                        authors.push({ reference: providerRef.reference });
                    }
                    sectionAuthors.push({ reference: providerRef.reference });
                }
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
        title: `GFE Composition for ${patientEntry?.resource?.name?.[0]?.given?.join(" ")} ${patientEntry?.resource?.name?.[0]?.family || ""}`.trim(),
        section: sections
    };

    return composition;
};

export default buildGFEComposition;
