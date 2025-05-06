import { v4 } from "uuid";

const buildGFEBundleSummary = (gfeBundle) => {
    console.log("Summarizing GFE bundle "+gfeBundle.id)
    const summaryId = `PCT-GFE-Summary-${v4()}`;
    const summaryClaim = {
        resourceType: "Claim",
        id: summaryId,
        meta: {
            profile: ["http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-summary"]
        },
        type: {
            "coding": [
                {
                    "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTEstimateTypeSummaryCSTemporaryTrialUse",
                    "code": "estimate-summary",
                    "display": "Estimate Summary"
                }
            ]
        },
        use: "predetermination",
        provider: {
            "extension": [
                {
                    "url": "http://hl7.org/fhir/StructureDefinition/data-absent-reason",
                    "valueCode": "not-applicable"
                }
            ]
        },
    };
    let total = 0;
    gfeBundle.entry?.forEach((entry) => {
        const resource = entry.resource;
        if( resource.resourceType === "Claim"){
            if (!summaryClaim.status && resource.status) {
                summaryClaim.status = resource.status;
            }

            if (!summaryClaim.priority && resource.priority) {
                summaryClaim.priority = resource.priority;
            }

            if (!summaryClaim.patient && resource.patient) {
                summaryClaim.patient = resource.patient;
            }

            if (!summaryClaim.supportingInfo && resource.supportingInfo) {
                summaryClaim.supportingInfo = resource.supportingInfo;
            }

            if (!summaryClaim.insurer && resource.insurer) {
                summaryClaim.insurer = resource.insurer;
            }

            if (!summaryClaim.insurance && resource.insurance) {
                summaryClaim.insurance = resource.insurance;
            }

            if (!summaryClaim.diagnosis && resource.diagnosis) {
                summaryClaim.diagnosis = resource.diagnosis;
            }

            if (resource.total && resource.total.value ) {
                total += resource.total.value;
            }
        }

    });
    summaryClaim.total = {
        value: total,
        currency: "USD"
    };
    return summaryClaim;
};
export default buildGFEBundleSummary;