const buildGFERequest = (input) => {
    // Map role code -> canonical display text (from claimcareteamrole v1.0.1)
    const CARE_TEAM_ROLE_DISPLAY = {
        primary: "Primary provider",
        assist: "Assisting Provider",
        supervisor: "Supervising Provider",
        attending: "Attending",
        referring: "Referring",
        operating: "Operating",
        otheroperating: "Other Operating",
        prescribing: "Prescribing provider",
        purchasedservice: "Purchased Service",
        rendering: "Rendering provider",
        other: "Other"
    };
    const CARE_TEAM_ROLE_SYSTEM = "http://terminology.hl7.org/CodeSystem/claimcareteamrole";
    const CARE_TEAM_ROLE_VERSION = "1.0.1";
    let GFERequest = {
        "resourceType": "Claim",
        "meta": input.gfeType === "institutional" ? {
            "profile": [
                "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-institutional"
            ]
        } : {
            "profile": [
                "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-professional"
            ]
        },
        "status": "active",
        "use": "predetermination",
        "priority": {
            "coding": [
                {
                    "code": "normal", 
                    "system": "http://terminology.hl7.org/CodeSystem/processpriority"
                }
            ]
        },
        ...(input.gfeType !== "institutional" && {
            "payee": {
                "type": {
                    "coding": [
                        {
                            "code": "subscriber",
                            "system": "http://terminology.hl7.org/CodeSystem/payeetype"
                        }
                    ]
                }
            }
        }),
    };

    GFERequest.identifier = input.identifier;
    
    GFERequest.type = input.gfeType === "institutional" ? {
        "coding": [
            {
                "system": "http://terminology.hl7.org/CodeSystem/claim-type",
                "code": "institutional",
                "display": "Institutional"
            }
        ]
    } : {
        "coding": [
            {
                "system": "http://terminology.hl7.org/CodeSystem/claim-type",
                "code": "professional",
                "display": "Professional"
            }
        ]
    }
    GFERequest.created = new Date().toISOString();
    GFERequest.patient = {
        reference: input.patient.reference
    }

    GFERequest.total = {
        value: input.billing.total,
        currency: "USD"
    };

    GFERequest.item = input.billing.items;

    if (input.supportingInfo) {
        GFERequest.supportingInfo = input.supportingInfo;
    }

    GFERequest.procedure = input.procedure;

    GFERequest.insurer = {
        reference: input.insurer.reference
    };
    GFERequest.provider = {
        reference: input.provider.reference,
        extension: input.provider.extension
    };

    if (input.careTeam) {
        GFERequest.careTeam = [];
        input.careTeam.forEach(member => {
            if (!CARE_TEAM_ROLE_DISPLAY[member.role]) {
                throw new Error(`Invalid careTeam role code: ${member.role}`);
            }

            const entry = {
                sequence: member.sequence,
                role: {
                    coding: [
                        {
                            system: CARE_TEAM_ROLE_SYSTEM,
                            version: CARE_TEAM_ROLE_VERSION,
                            code: member.role,
                            display: CARE_TEAM_ROLE_DISPLAY[member.role]
                        }
                    ]
                },
                provider: member.providerRef
            };

            // qualification is mandatory for rendering, optional for referring/other slices
            if (member.role === "rendering" && !member.qualification) {
                throw new Error("qualification is required for rendering care team members");
            }
            if (member.qualification) {
                entry.qualification = {
                    coding: [
                        {
                            system: "http://nucc.org/provider-taxonomy",
                            code: member.qualification.code,
                            display: member.qualification.display
                        }
                    ]
                };
            }

            GFERequest.careTeam.push(entry);
        });
    }

    GFERequest.diagnosis = input.diagnosis;

    GFERequest.insurance = [
        {
            sequence: 1,
            focal: true,
            coverage: {
                reference: input.request.coverage.reference
            }
        }
    ];

    return GFERequest;
};

export default buildGFERequest;
