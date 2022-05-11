const buildGFERequest = (input) => {
    let GFERequest = {
        "resourceType": "Claim",
        "text": {
            "status": "extensions",
            "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><p><b>GFESubmitter</b>: <a href=\"Organization-Submitter-Org-1.html\">Generated Summary: Electronic Transmitter Identification Number: ETIN-10010001; active; name: GFE Service Help INC.</a></p><p><b>InterTransIdentifier</b>: id: GFEService0001</p><p><b>status</b>: active</p><p><b>type</b>: <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/claim-type institutional}\">Institutional</span></p><p><b>use</b>: predetermination</p><p><b>patient</b>: <a href=\"Patient-patientBSJ1.html\">Generated Summary: Betsy Smith-Johnson</a></p><p><b>created</b>: 2021-09-07</p><p><b>insurer</b>: <a href=\"Organization-Insurer-Org-1.html\">Generated Summary: Electronic Transmitter Identification Number: ETIN-70010001; active; name: Blue Cross Blue Shield</a></p><p><b>provider</b>: <a href=\"PractitionerRole-Provider-Role-neurologist.html\">Generated Summary: active; <span title=\"Codes: {http://nucc.org/provider-taxonomy 2084N0400X}\">Neurology</span>; <span title=\"Codes: {http://nucc.org/provider-taxonomy 2084N0400X}\">Neurology</span></a></p><p><b>priority</b>: <span title=\"Codes: \">normal</span></p><h3>Payees</h3><table class=\"grid\"><tr><td>-</td><td><b>Type</b></td></tr><tr><td>*</td><td><span title=\"Codes: \">subscriber</span></td></tr></table><h3>Insurances</h3><table class=\"grid\"><tr><td>-</td><td><b>Sequence</b></td><td><b>Focal</b></td><td><b>Coverage</b></td></tr><tr><td>*</td><td>1</td><td>true</td><td><a href=\"Coverage-BSJ-Coverage-1.html\">Generated Summary: status: active; subscriberId: 123456789; period: 2020-12-01 --&gt; 2021-11-30</a></td></tr></table></div>"
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
        "payee": {
            "type": {
                "coding": [
                    {
                        "code": "subscriber"
                    }
                ]
            }
        },

    };

    GFERequest.meta = input.gfeType === "institutional" ? {
        "profile": [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/pct-gfe-Institutional"
        ]
    } : {
        "profile": [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-professional"
        ]
    }

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
        reference: input.provider.reference
    };

    if (input.careTeam) {
        GFERequest.careTeam = [];
        input.careTeam.forEach(member => {
            GFERequest.careTeam.push({
                sequence: member.sequence,
                role: {
                    coding: [
                        {
                            "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTCareTeamRole",
                            "code": member.role
                        }
                    ]
                },
                provider: member.providerRef,
                qualification: {
                    coding: [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/ex-providerqualification",
                            "code": "604215",
                            "display": "Physician"
                        }
                    ]
                }
            })
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


    GFERequest.extension = [
        {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeSubmitter",
            valueReference: {
                reference: input.submitter.reference
            }
        }
    ];

    if (input.billing.interTransIntermediary) {
        GFERequest.extension.push({
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/interTransIdentifier",
            valueIdentifier: {
                value: input.billing.interTransIntermediary
            }
        })
    };

    if (input.billing.gfeAssignedServiceId) {
        GFERequest.extension.push({
            "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeProviderAssignedIdentifier",
            valueIdentifier: {
                value: input.billing.gfeAssignedServiceId
            }
        });
    }

    return GFERequest;
};

export default buildGFERequest;

