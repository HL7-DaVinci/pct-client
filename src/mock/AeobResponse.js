export const MockAeobResponse = {
    "resourceType": "Bundle",
    "id": "2e06b9d9-029c-4505-be74-c2ca799bda59",
    "meta": {
        "lastUpdated": "2022-09-08T11:10:30.659-04:00"
    },
    "type": "searchset",
    "total": 1,
    "link": [
        {
            "relation": "self",
            "url": "http://localhost:8080/Bundle?identifier=d6857f1c-4ae1-490a-84fe-38afb06ca08f"
        }
    ],
    "entry": [
        {
            "fullUrl": "http://localhost:8080/Bundle/6508",
            "resource": {
                "resourceType": "Bundle",
                "id": "6508",
                "meta": {
                    "versionId": "2",
                    "lastUpdated": "2022-09-06T17:06:46.437-04:00",
                    "source": "#oVQwWALDHS4FsDJp"
                },
                "identifier": {
                    "system": "http://example.org/documentIDs",
                    "value": "d6857f1c-4ae1-490a-84fe-38afb06ca08f"
                },
                "type": "collection",
                "timestamp": "2022-09-06T17:06:43.680-04:00",
                "entry": [
                    {
                        "fullUrl": "http://example.org/fhir/ExplanationOfBenefit/ExplanationOfBenefit/6510",
                        "resource": {
                            "resourceType": "ExplanationOfBenefit",
                            "id": "6510",
                            "meta": {
                                "versionId": "1",
                                "lastUpdated": "2022-09-06T17:06:46.374-04:00",
                                "profile": [
                                    "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-aeob"
                                ]
                            },
                            "text": {
                                "status": "extensions",
                                "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><p><b>GFE Reference</b>: <a href=\"Claim-PCT-Good-Faith-Estimate-1.html\">Generated Summary: status: active; <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/claim-type institutional}\">Institutional</span>; use: claim; created: 2021-10-05; <span title=\"Codes: \">normal</span></a></p><p><b>Disclaimer</b>: Estimate Only ...</p><p><b>Expiration Date</b>: 2021-10-31</p><p><b>status</b>: active</p><p><b>type</b>: <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/claim-type institutional}\">Institutional</span></p><p><b>use</b>: claim</p><p><b>patient</b>: <a href=\"Patient-patient1001.html\">Generated Summary: MB: 12345; Eve Betterhalf; Phone: 781-949-4949; gender: female; birthDate: 1955-07-23; <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/v3-MaritalStatus U}\">unmarried</span></a></p><p><b>created</b>: 2021-10-12</p><p><b>insurer</b>: <a href=\"Organization-org1001.html\">Generated Summary: id: ETIN-1001001; active: true; <span title=\"Codes: \">Payer</span>; name: Umbrella Insurance Company; Phone: 860-547-5001</a></p><p><b>provider</b>: <a href=\"Organization-org1002.html\">Generated Summary: Tax ID number: TAX-1001001; active: true; <span title=\"Codes: \">Healthcare Provider</span>; name: Boston Radiology Center; Phone: 781-232-3200</a></p><p><b>priority</b>: <span title=\"Codes: \">normal</span></p><p><b>outcome</b>: complete</p><h3>Insurances</h3><table class=\"grid\"><tr><td>-</td><td><b>Focal</b></td><td><b>Coverage</b></td></tr><tr><td>*</td><td>true</td><td><a href=\"Coverage-coverage1001.html\">Generated Summary: status: active; subscriberId: PFP123450000; period: 2021-01-01 --&gt; 2022-01-01</a></td></tr></table><blockquote><p><b>item</b></p><p><b>EstimatedDateOfService</b>: 2021-10-31</p><p><b>sequence</b>: 1</p><p><b>revenue</b>: <span title=\"Codes: {https://www.nubc.org/CodeSystem/RevenueCodes 1212}\">Some revenue code description</span></p><p><b>productOrService</b>: <span title=\"Codes: {http://www.ama-assn.org/go/cpt 71010}\">Some CPT code description</span></p><p><b>modifier</b>: <span title=\"Codes: {http://www.ama-assn.org/go/cpt 71020}\">Some CPT code description</span></p><blockquote><p><b>adjudication</b></p><p><b>Subject To Medical Management</b>: <span title=\"{null concurrent-review}\">Concurrent Review</span></p><p><b>category</b>: <span title=\"Codes: \">Paid to provider</span></p></blockquote></blockquote><blockquote><p><b>total</b></p><p><b>category</b>: <span title=\"Codes: \">Submitted Amount</span></p></blockquote></div>"
                            },
                            "extension": [
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeReference",
                                    "valueReference": {
                                        "reference": "Bundle/6509"
                                    }
                                },
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/disclaimer",
                                    "valueString": "Estimate Only ..."
                                },
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/expirationDate",
                                    "valueDate": "2023-03-06"
                                },
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeProviderAssignedIdentifier",
                                    "valueIdentifier": {
                                        "value": "GFEAssignedServiceID0001"
                                    }
                                }
                            ],
                            "status": "active",
                            "type": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/claim-type",
                                        "code": "institutional",
                                        "display": "Institutional"
                                    }
                                ]
                            },
                            "use": "predetermination",
                            "patient": {
                                "reference": "https://davinci-pct-ehr.logicahealth.org/fhir/Patient/patient1001"
                            },
                            "created": "2022-09-06T17:06:46-04:00",
                            "insurer": {
                                "reference": "https://davinci-pct-ehr.logicahealth.org/fhir/Organization/org1001"
                            },
                            "provider": {
                                "reference": "https://davinci-pct-ehr.logicahealth.org/fhir/Organization/org1002"
                            },
                            "priority": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/processpriority",
                                        "code": "normal"
                                    }
                                ]
                            },
                            "outcome": "complete",
                            "insurance": [
                                {
                                    "focal": true,
                                    "coverage": {
                                        "reference": "https://davinci-pct-ehr.logicahealth.org/fhir/Coverage/coverage1001"
                                    }
                                }
                            ],
                            "item": [
                                {
                                    "extension": [
                                        {
                                            "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/estimatedDateOfService",
                                            "valueDate": "2022-08-30"
                                        }
                                    ],
                                    "sequence": 1,
                                    "revenue": {
                                        "coding": [
                                            {
                                                "system": "https://www.nubc.org/CodeSystem/RevenueCodes",
                                                "code": "0611"
                                            }
                                        ]
                                    },
                                    "productOrService": {
                                        "coding": [
                                            {
                                                "system": "http://www.ama-assn.org/go/cpt",
                                                "code": "70551",
                                                "display": "Magnetic resonance (eg, proton) imaging, brain (including brain stem)"
                                            }
                                        ]
                                    },
                                    "net": {
                                        "value": 266,
                                        "currency": "USD"
                                    },
                                    "adjudication": [
                                        {
                                            "category": {
                                                "coding": [
                                                    {
                                                        "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTAdjudicationCategoryType",
                                                        "code": "paidtoprovider",
                                                        "display": "Paid to Provider"
                                                    }
                                                ]
                                            },
                                            "amount": {
                                                "value": 266,
                                                "currency": "USD"
                                            }
                                        },
                                        {
                                            "category": {
                                                "coding": [
                                                    {
                                                        "system": "http://terminology.hl7.org/CodeSystem/adjudication",
                                                        "code": "eligible",
                                                        "display": "Eligible Amount"
                                                    }
                                                ]
                                            },
                                            "amount": {
                                                "value": 247.38000000000002
                                            }
                                        },
                                        {
                                            "category": {
                                                "coding": [
                                                    {
                                                        "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTAdjudicationCategoryType",
                                                        "code": "coinsurance",
                                                        "display": "Co-insurance"
                                                    }
                                                ]
                                            },
                                            "amount": {
                                                "value": 53.2
                                            }
                                        }
                                    ]
                                }
                            ],
                            "total": [
                                {
                                    "category": {
                                        "coding": [
                                            {
                                                "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTAdjudicationCategoryType",
                                                "code": "paidtoprovider",
                                                "display": "Paid to Provider"
                                            }
                                        ]
                                    },
                                    "amount": {
                                        "value": 194.18
                                    }
                                },
                                {
                                    "category": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/adjudication",
                                                "code": "submitted",
                                                "display": "Submitted Amount"
                                            }
                                        ]
                                    },
                                    "amount": {
                                        "value": 266,
                                        "currency": "USD"
                                    }
                                },
                                {
                                    "category": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/adjudication",
                                                "code": "eligible",
                                                "display": "Eligible Amount"
                                            }
                                        ]
                                    },
                                    "amount": {
                                        "value": 247.38000000000002
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "fullUrl": "http://example.org/fhir/Claim/PCT-Good-Faith-Estimate-1",
                        "resource": {
                            "resourceType": "Claim",
                            "id": "PCT-Good-Faith-Estimate-1",
                            "meta": {
                                "profile": [
                                    "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/pct-gfe-Institutional"
                                ]
                            },
                            "text": {
                                "status": "extensions",
                                "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><p><b>GFESubmitter</b>: <a href=\"Organization-Submitter-Org-1.html\">Generated Summary: Electronic Transmitter Identification Number: ETIN-10010001; active; name: GFE Service Help INC.</a></p><p><b>InterTransIdentifier</b>: id: GFEService0001</p><p><b>status</b>: active</p><p><b>type</b>: <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/claim-type institutional}\">Institutional</span></p><p><b>use</b>: predetermination</p><p><b>patient</b>: <a href=\"Patient-patientBSJ1.html\">Generated Summary: Betsy Smith-Johnson</a></p><p><b>created</b>: 2021-09-07</p><p><b>insurer</b>: <a href=\"Organization-Insurer-Org-1.html\">Generated Summary: Electronic Transmitter Identification Number: ETIN-70010001; active; name: Blue Cross Blue Shield</a></p><p><b>provider</b>: <a href=\"PractitionerRole-Provider-Role-neurologist.html\">Generated Summary: active; <span title=\"Codes: {http://nucc.org/provider-taxonomy 2084N0400X}\">Neurology</span>; <span title=\"Codes: {http://nucc.org/provider-taxonomy 2084N0400X}\">Neurology</span></a></p><p><b>priority</b>: <span title=\"Codes: \">normal</span></p><h3>Payees</h3><table class=\"grid\"><tr><td>-</td><td><b>Type</b></td></tr><tr><td>*</td><td><span title=\"Codes: \">subscriber</span></td></tr></table><h3>Insurances</h3><table class=\"grid\"><tr><td>-</td><td><b>Sequence</b></td><td><b>Focal</b></td><td><b>Coverage</b></td></tr><tr><td>*</td><td>1</td><td>true</td><td><a href=\"Coverage-BSJ-Coverage-1.html\">Generated Summary: status: active; subscriberId: 123456789; period: 2020-12-01 --&gt; 2021-11-30</a></td></tr></table></div>"
                            },
                            "extension": [
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeSubmitter",
                                    "valueReference": {
                                        "reference": "Organization/Submitter-Org-1"
                                    }
                                },
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/interTransIdentifier",
                                    "valueIdentifier": {
                                        "value": "InterTransID0001"
                                    }
                                },
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeProviderAssignedIdentifier",
                                    "valueIdentifier": {
                                        "value": "GFEAssignedServiceID0001"
                                    }
                                }
                            ],
                            "status": "active",
                            "type": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/claim-type",
                                        "code": "institutional",
                                        "display": "Institutional"
                                    }
                                ]
                            },
                            "use": "predetermination",
                            "patient": {
                                "reference": "Patient/patient1001"
                            },
                            "created": "2022-08-16T20:39:45.097Z",
                            "insurer": {
                                "reference": "Organization/org1001"
                            },
                            "provider": {
                                "reference": "Organization/org1002"
                            },
                            "priority": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/processpriority",
                                        "code": "normal"
                                    }
                                ]
                            },
                            "payee": {
                                "type": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/payeetype",
                                            "code": "subscriber"
                                        }
                                    ]
                                }
                            },
                            "careTeam": [
                                {
                                    "sequence": 1,
                                    "provider": {
                                        "reference": "http://davinci-pct-ehr.logicahealth.org/fhir/Practitioner/Submitter-Practitioner-1"
                                    },
                                    "role": {
                                        "coding": [
                                            {
                                                "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTCareTeamRole",
                                                "code": "rendering"
                                            }
                                        ]
                                    },
                                    "qualification": {
                                        "coding": [
                                            {
                                                "system": "http://nucc.org/provider-taxonomy",
                                                "code": "207T00000X",
                                                "display": "Neurological Surgery Physician"
                                            }
                                        ]
                                    }
                                }
                            ],
                            "supportingInfo": [
                                {
                                    "sequence": 1,
                                    "category": {
                                        "coding": [
                                            {
                                                "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTSupportingInfoType",
                                                "code": "typeofbill",
                                                "display": "Type of Bill"
                                            }
                                        ]
                                    },
                                    "code": {
                                        "coding": [
                                            {
                                                "system": "https://www.nubc.org/CodeSystem/TypeOfBill",
                                                "code": "112",
                                                "display": "Type of Bill"
                                            }
                                        ]
                                    }
                                }
                            ],
                            "diagnosis": [
                                {
                                    "sequence": 1,
                                    "diagnosisCodeableConcept": {
                                        "coding": [
                                            {
                                                "system": "http://hl7.org/fhir/sid/icd-10-cm",
                                                "code": "S06.3",
                                                "display": "Focal traumatic brain injury"
                                            }
                                        ]
                                    },
                                    "type": [
                                        {
                                            "coding": [
                                                {
                                                    "system": "http://terminology.hl7.org/CodeSystem/ex-diagnosistype",
                                                    "code": "principal"
                                                }
                                            ]
                                        }
                                    ],
                                    "packageCode": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/ex-diagnosisrelatedgroup",
                                                "code": "400",
                                                "display": "Head trauma - concussion"
                                            }
                                        ]
                                    }
                                }
                            ],
                            "insurance": [
                                {
                                    "sequence": 1,
                                    "focal": true,
                                    "coverage": {
                                        "reference": "Coverage/coverage1001"
                                    }
                                }
                            ],
                            "item": [
                                {
                                    "extension": [
                                        {
                                            "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/estimatedDateOfService",
                                            "valueDate": "2022-08-30"
                                        }
                                    ],
                                    "sequence": 1,
                                    "revenue": {
                                        "coding": [
                                            {
                                                "system": "https://www.nubc.org/CodeSystem/RevenueCodes",
                                                "code": "0611"
                                            }
                                        ]
                                    },
                                    "productOrService": {
                                        "coding": [
                                            {
                                                "system": "http://www.ama-assn.org/go/cpt",
                                                "code": "70551",
                                                "display": "Magnetic resonance (eg, proton) imaging, brain (including brain stem)"
                                            }
                                        ]
                                    },
                                    "quantity": {
                                        "value": 1
                                    },
                                    "unitPrice": {
                                        "value": 266,
                                        "currency": "USD"
                                    },
                                    "net": {
                                        "value": 266,
                                        "currency": "USD"
                                    }
                                }
                            ],
                            "total": {
                                "value": 266,
                                "currency": "USD"
                            }
                        }
                    },
                    {
                        "fullUrl": "http://example.org/fhir/ExplanationOfBenefit/ExplanationOfBenefit/6511",
                        "resource": {
                            "resourceType": "ExplanationOfBenefit",
                            "id": "6511",
                            "meta": {
                                "versionId": "1",
                                "lastUpdated": "2022-09-06T17:06:46.406-04:00",
                                "profile": [
                                    "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-aeob"
                                ]
                            },
                            "text": {
                                "status": "extensions",
                                "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><p><b>GFE Reference</b>: <a href=\"Claim-PCT-Good-Faith-Estimate-1.html\">Generated Summary: status: active; <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/claim-type institutional}\">Institutional</span>; use: claim; created: 2021-10-05; <span title=\"Codes: \">normal</span></a></p><p><b>Disclaimer</b>: Estimate Only ...</p><p><b>Expiration Date</b>: 2021-10-31</p><p><b>status</b>: active</p><p><b>type</b>: <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/claim-type institutional}\">Institutional</span></p><p><b>use</b>: claim</p><p><b>patient</b>: <a href=\"Patient-patient1001.html\">Generated Summary: MB: 12345; Eve Betterhalf; Phone: 781-949-4949; gender: female; birthDate: 1955-07-23; <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/v3-MaritalStatus U}\">unmarried</span></a></p><p><b>created</b>: 2021-10-12</p><p><b>insurer</b>: <a href=\"Organization-org1001.html\">Generated Summary: id: ETIN-1001001; active: true; <span title=\"Codes: \">Payer</span>; name: Umbrella Insurance Company; Phone: 860-547-5001</a></p><p><b>provider</b>: <a href=\"Organization-org1002.html\">Generated Summary: Tax ID number: TAX-1001001; active: true; <span title=\"Codes: \">Healthcare Provider</span>; name: Boston Radiology Center; Phone: 781-232-3200</a></p><p><b>priority</b>: <span title=\"Codes: \">normal</span></p><p><b>outcome</b>: complete</p><h3>Insurances</h3><table class=\"grid\"><tr><td>-</td><td><b>Focal</b></td><td><b>Coverage</b></td></tr><tr><td>*</td><td>true</td><td><a href=\"Coverage-coverage1001.html\">Generated Summary: status: active; subscriberId: PFP123450000; period: 2021-01-01 --&gt; 2022-01-01</a></td></tr></table><blockquote><p><b>item</b></p><p><b>EstimatedDateOfService</b>: 2021-10-31</p><p><b>sequence</b>: 1</p><p><b>revenue</b>: <span title=\"Codes: {https://www.nubc.org/CodeSystem/RevenueCodes 1212}\">Some revenue code description</span></p><p><b>productOrService</b>: <span title=\"Codes: {http://www.ama-assn.org/go/cpt 71010}\">Some CPT code description</span></p><p><b>modifier</b>: <span title=\"Codes: {http://www.ama-assn.org/go/cpt 71020}\">Some CPT code description</span></p><blockquote><p><b>adjudication</b></p><p><b>Subject To Medical Management</b>: <span title=\"{null concurrent-review}\">Concurrent Review</span></p><p><b>category</b>: <span title=\"Codes: \">Paid to provider</span></p></blockquote></blockquote><blockquote><p><b>total</b></p><p><b>category</b>: <span title=\"Codes: \">Submitted Amount</span></p></blockquote></div>"
                            },
                            "extension": [
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeReference",
                                    "valueReference": {
                                        "reference": "Bundle/6509"
                                    }
                                },
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/disclaimer",
                                    "valueString": "Estimate Only ..."
                                },
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/expirationDate",
                                    "valueDate": "2023-03-06"
                                },
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeProviderAssignedIdentifier",
                                    "valueIdentifier": {
                                        "value": "GFEAssignedServiceID0002"
                                    }
                                }
                            ],
                            "status": "active",
                            "type": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/claim-type",
                                        "code": "institutional",
                                        "display": "Institutional"
                                    }
                                ]
                            },
                            "use": "predetermination",
                            "patient": {
                                "reference": "https://davinci-pct-ehr.logicahealth.org/fhir/Patient/patient1001"
                            },
                            "created": "2022-09-06T17:06:46-04:00",
                            "insurer": {
                                "reference": "https://davinci-pct-ehr.logicahealth.org/fhir/Organization/org1001"
                            },
                            "provider": {
                                "reference": "https://davinci-pct-ehr.logicahealth.org/fhir/Organization/org1002"
                            },
                            "priority": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/processpriority",
                                        "code": "normal"
                                    }
                                ]
                            },
                            "outcome": "complete",
                            "insurance": [
                                {
                                    "focal": true,
                                    "coverage": {
                                        "reference": "https://davinci-pct-ehr.logicahealth.org/fhir/Coverage/coverage1001"
                                    }
                                }
                            ],
                            "item": [
                                {
                                    "extension": [
                                        {
                                            "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/estimatedDateOfService",
                                            "valueDate": "2022-08-30"
                                        }
                                    ],
                                    "sequence": 1,
                                    "revenue": {
                                        "coding": [
                                            {
                                                "system": "https://www.nubc.org/CodeSystem/RevenueCodes",
                                                "code": "0611"
                                            }
                                        ]
                                    },
                                    "productOrService": {
                                        "coding": [
                                            {
                                                "system": "http://www.ama-assn.org/go/cpt",
                                                "code": "70551",
                                                "display": "Magnetic resonance (eg, proton) imaging, brain (including brain stem)"
                                            }
                                        ]
                                    },
                                    "net": {
                                        "value": 266,
                                        "currency": "USD"
                                    },
                                    "adjudication": [
                                        {
                                            "category": {
                                                "coding": [
                                                    {
                                                        "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTAdjudicationCategoryType",
                                                        "code": "paidtoprovider",
                                                        "display": "Paid to Provider"
                                                    }
                                                ]
                                            },
                                            "amount": {
                                                "value": 266,
                                                "currency": "USD"
                                            }
                                        },
                                        {
                                            "category": {
                                                "coding": [
                                                    {
                                                        "system": "http://terminology.hl7.org/CodeSystem/adjudication",
                                                        "code": "eligible",
                                                        "display": "Eligible Amount"
                                                    }
                                                ]
                                            },
                                            "amount": {
                                                "value": 215.46
                                            }
                                        }
                                    ]
                                }
                            ],
                            "total": [
                                {
                                    "category": {
                                        "coding": [
                                            {
                                                "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTAdjudicationCategoryType",
                                                "code": "paidtoprovider",
                                                "display": "Paid to Provider"
                                            }
                                        ]
                                    },
                                    "amount": {
                                        "value": 215.46
                                    }
                                },
                                {
                                    "category": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/adjudication",
                                                "code": "submitted",
                                                "display": "Submitted Amount"
                                            }
                                        ]
                                    },
                                    "amount": {
                                        "value": 266,
                                        "currency": "USD"
                                    }
                                },
                                {
                                    "category": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/adjudication",
                                                "code": "eligible",
                                                "display": "Eligible Amount"
                                            }
                                        ]
                                    },
                                    "amount": {
                                        "value": 215.46
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "fullUrl": "http://example.org/fhir/Claim/PCT-Good-Faith-Estimate-2",
                        "resource": {
                            "resourceType": "Claim",
                            "id": "PCT-Good-Faith-Estimate-2",
                            "meta": {
                                "profile": [
                                    "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/pct-gfe-Institutional"
                                ]
                            },
                            "text": {
                                "status": "extensions",
                                "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><p><b>GFESubmitter</b>: <a href=\"Organization-Submitter-Org-1.html\">Generated Summary: Electronic Transmitter Identification Number: ETIN-10010001; active; name: GFE Service Help INC.</a></p><p><b>InterTransIdentifier</b>: id: GFEService0001</p><p><b>status</b>: active</p><p><b>type</b>: <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/claim-type institutional}\">Institutional</span></p><p><b>use</b>: predetermination</p><p><b>patient</b>: <a href=\"Patient-patientBSJ1.html\">Generated Summary: Betsy Smith-Johnson</a></p><p><b>created</b>: 2021-09-07</p><p><b>insurer</b>: <a href=\"Organization-Insurer-Org-1.html\">Generated Summary: Electronic Transmitter Identification Number: ETIN-70010001; active; name: Blue Cross Blue Shield</a></p><p><b>provider</b>: <a href=\"PractitionerRole-Provider-Role-neurologist.html\">Generated Summary: active; <span title=\"Codes: {http://nucc.org/provider-taxonomy 2084N0400X}\">Neurology</span>; <span title=\"Codes: {http://nucc.org/provider-taxonomy 2084N0400X}\">Neurology</span></a></p><p><b>priority</b>: <span title=\"Codes: \">normal</span></p><h3>Payees</h3><table class=\"grid\"><tr><td>-</td><td><b>Type</b></td></tr><tr><td>*</td><td><span title=\"Codes: \">subscriber</span></td></tr></table><h3>Insurances</h3><table class=\"grid\"><tr><td>-</td><td><b>Sequence</b></td><td><b>Focal</b></td><td><b>Coverage</b></td></tr><tr><td>*</td><td>1</td><td>true</td><td><a href=\"Coverage-BSJ-Coverage-1.html\">Generated Summary: status: active; subscriberId: 123456789; period: 2020-12-01 --&gt; 2021-11-30</a></td></tr></table></div>"
                            },
                            "extension": [
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeSubmitter",
                                    "valueReference": {
                                        "reference": "Organization/Submitter-Org-1"
                                    }
                                },
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/interTransIdentifier",
                                    "valueIdentifier": {
                                        "value": "InterTransID0002"
                                    }
                                },
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeProviderAssignedIdentifier",
                                    "valueIdentifier": {
                                        "value": "GFEAssignedServiceID0002"
                                    }
                                }
                            ],
                            "status": "active",
                            "type": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/claim-type",
                                        "code": "institutional",
                                        "display": "Institutional"
                                    }
                                ]
                            },
                            "use": "predetermination",
                            "patient": {
                                "reference": "Patient/patient1001"
                            },
                            "created": "2022-08-16T20:39:45.097Z",
                            "insurer": {
                                "reference": "Organization/org1001"
                            },
                            "provider": {
                                "reference": "Organization/org1002"
                            },
                            "priority": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/processpriority",
                                        "code": "normal"
                                    }
                                ]
                            },
                            "payee": {
                                "type": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/payeetype",
                                            "code": "subscriber"
                                        }
                                    ]
                                }
                            },
                            "careTeam": [
                                {
                                    "sequence": 1,
                                    "provider": {
                                        "reference": "http://davinci-pct-ehr.logicahealth.org/fhir/Practitioner/Submitter-Practitioner-1"
                                    },
                                    "role": {
                                        "coding": [
                                            {
                                                "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTCareTeamRole",
                                                "code": "rendering"
                                            }
                                        ]
                                    },
                                    "qualification": {
                                        "coding": [
                                            {
                                                "system": "http://nucc.org/provider-taxonomy",
                                                "code": "207T00000X",
                                                "display": "Neurological Surgery Physician"
                                            }
                                        ]
                                    }
                                }
                            ],
                            "supportingInfo": [
                                {
                                    "sequence": 1,
                                    "category": {
                                        "coding": [
                                            {
                                                "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTSupportingInfoType",
                                                "code": "typeofbill",
                                                "display": "Type of Bill"
                                            }
                                        ]
                                    },
                                    "code": {
                                        "coding": [
                                            {
                                                "system": "https://www.nubc.org/CodeSystem/TypeOfBill",
                                                "code": "112",
                                                "display": "Type of Bill"
                                            }
                                        ]
                                    }
                                }
                            ],
                            "diagnosis": [
                                {
                                    "sequence": 1,
                                    "diagnosisCodeableConcept": {
                                        "coding": [
                                            {
                                                "system": "http://hl7.org/fhir/sid/icd-10-cm",
                                                "code": "S06.3",
                                                "display": "Focal traumatic brain injury"
                                            }
                                        ]
                                    },
                                    "type": [
                                        {
                                            "coding": [
                                                {
                                                    "system": "http://terminology.hl7.org/CodeSystem/ex-diagnosistype",
                                                    "code": "principal"
                                                }
                                            ]
                                        }
                                    ],
                                    "packageCode": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/ex-diagnosisrelatedgroup",
                                                "code": "400",
                                                "display": "Head trauma - concussion"
                                            }
                                        ]
                                    }
                                }
                            ],
                            "insurance": [
                                {
                                    "sequence": 1,
                                    "focal": true,
                                    "coverage": {
                                        "reference": "Coverage/coverage1001"
                                    }
                                }
                            ],
                            "item": [
                                {
                                    "extension": [
                                        {
                                            "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/estimatedDateOfService",
                                            "valueDate": "2022-08-30"
                                        }
                                    ],
                                    "sequence": 1,
                                    "revenue": {
                                        "coding": [
                                            {
                                                "system": "https://www.nubc.org/CodeSystem/RevenueCodes",
                                                "code": "0611"
                                            }
                                        ]
                                    },
                                    "productOrService": {
                                        "coding": [
                                            {
                                                "system": "http://www.ama-assn.org/go/cpt",
                                                "code": "70551",
                                                "display": "Magnetic resonance (eg, proton) imaging, brain (including brain stem)"
                                            }
                                        ]
                                    },
                                    "quantity": {
                                        "value": 1
                                    },
                                    "unitPrice": {
                                        "value": 266,
                                        "currency": "USD"
                                    },
                                    "net": {
                                        "value": 266,
                                        "currency": "USD"
                                    }
                                }
                            ],
                            "total": {
                                "value": 266,
                                "currency": "USD"
                            }
                        }
                    },
                    {
                        "fullUrl": "https://davinci-pct-ehr.logicahealth.org/fhir/Patient/patient1001",
                        "resource": {
                            "resourceType": "Patient",
                            "id": "patient1001",
                            "meta": {
                                "versionId": "1",
                                "lastUpdated": "2022-08-16T14:00:49.823+00:00",
                                "source": "#KOFHgKif9KkgGeO9",
                                "profile": [
                                    "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-patient"
                                ]
                            },
                            "text": {
                                "status": "generated",
                                "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Eve Betterhalf</b> female, DoB: 1955-07-23 ( Member Number: 12345)</p></div>"
                            },
                            "identifier": [
                                {
                                    "type": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                                "code": "MB",
                                                "display": "Member Number"
                                            }
                                        ]
                                    },
                                    "system": "http://example.com/identifiers/member",
                                    "value": "12345"
                                },
                                {
                                    "type": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                                "code": "EI",
                                                "display": "Employee number"
                                            }
                                        ]
                                    },
                                    "system": "http://example.com/identifiers/employee",
                                    "value": "667788"
                                }
                            ],
                            "name": [
                                {
                                    "text": "Eve Betterhalf",
                                    "family": "Betterhalf",
                                    "given": [
                                        "Eve"
                                    ]
                                }
                            ],
                            "telecom": [
                                {
                                    "system": "phone",
                                    "value": "781-949-4949",
                                    "use": "mobile"
                                }
                            ],
                            "gender": "female",
                            "birthDate": "1955-07-23",
                            "address": [
                                {
                                    "text": "222 Burlington Road, Bedford MA 01730"
                                }
                            ],
                            "maritalStatus": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
                                        "code": "U",
                                        "display": "unmarried"
                                    }
                                ]
                            },
                            "communication": [
                                {
                                    "language": {
                                        "coding": [
                                            {
                                                "system": "urn:ietf:bcp:47",
                                                "code": "en-US",
                                                "display": "English (United States)"
                                            }
                                        ]
                                    },
                                    "preferred": true
                                }
                            ]
                        }
                    },
                    {
                        "fullUrl": "https://davinci-pct-ehr.logicahealth.org/fhir/Coverage/coverage1001",
                        "resource": {
                            "resourceType": "Coverage",
                            "id": "coverage1001",
                            "meta": {
                                "versionId": "1",
                                "lastUpdated": "2022-08-04T18:16:59.376+00:00",
                                "source": "#n8ecwtrcEASRF6H7",
                                "profile": [
                                    "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-coverage"
                                ]
                            },
                            "text": {
                                "status": "generated",
                                "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><div style=\"display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%\"><p style=\"margin-bottom: 0px\">Resource &quot;coverage1001&quot; </p><p style=\"margin-bottom: 0px\">Profile: <a href=\"StructureDefinition-davinci-pct-coverage.html\">PCT Coverage</a></p></div><p><b>status</b>: active</p><p><b>subscriber</b>: <a href=\"Patient-patient1001.html\">Patient/patient1001</a> &quot; BETTERHALF&quot;</p><p><b>subscriberId</b>: PFP123450000</p><p><b>beneficiary</b>: <a href=\"Patient-patient1001.html\">Patient/patient1001</a> &quot; BETTERHALF&quot;</p><p><b>relationship</b>: Self <span style=\"background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki\"> (<a href=\"http://terminology.hl7.org/3.1.0/CodeSystem-subscriber-relationship.html\">SubscriberPolicyholder Relationship Codes</a>#self)</span></p><p><b>period</b>: 2021-01-01 --&gt; 2022-01-01</p><p><b>payor</b>: <a href=\"Organization-org1001.html\">Organization/org1001</a> &quot;Umbrella Insurance Company&quot;</p><h3>Classes</h3><table class=\"grid\"><tr><td>-</td><td><b>Type</b></td><td><b>Value</b></td><td><b>Name</b></td></tr><tr><td>*</td><td>Plan <span style=\"background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki\"> (<a href=\"http://terminology.hl7.org/3.1.0/CodeSystem-coverage-class.html\">Coverage Class Codes</a>#plan)</span></td><td>Premim Family Plus</td><td>Premim Family Plus Plan</td></tr></table><h3>CostToBeneficiaries</h3><table class=\"grid\"><tr><td>-</td><td><b>Type</b></td><td><b>Value[x]</b></td></tr><tr><td>*</td><td>Copay Percentage <span style=\"background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki\"> (<a href=\"http://terminology.hl7.org/3.1.0/CodeSystem-coverage-copay-type.html\">Coverage Copay Type Codes</a>#copaypct)</span></td><td>20</td></tr></table><p><b>contract</b>: <a href=\"Contract-contract1001.html\">Contract/contract1001</a></p></div>"
                            },
                            "status": "active",
                            "subscriber": {
                                "reference": "Patient/patient1001"
                            },
                            "subscriberId": "PFP123450000",
                            "beneficiary": {
                                "reference": "Patient/patient1001"
                            },
                            "relationship": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/subscriber-relationship",
                                        "code": "self",
                                        "display": "Self"
                                    }
                                ]
                            },
                            "period": {
                                "start": "2021-01-01",
                                "end": "2022-01-01"
                            },
                            "payor": [
                                {
                                    "reference": "Organization/org1001"
                                }
                            ],
                            "class": [
                                {
                                    "type": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/coverage-class",
                                                "code": "plan",
                                                "display": "Plan"
                                            }
                                        ]
                                    },
                                    "value": "Premim Family Plus",
                                    "name": "Premim Family Plus Plan"
                                }
                            ],
                            "costToBeneficiary": [
                                {
                                    "type": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/coverage-copay-type",
                                                "code": "copaypct",
                                                "display": "Copay Percentage"
                                            }
                                        ]
                                    },
                                    "valueQuantity": {
                                        "value": 20
                                    }
                                }
                            ],
                            "contract": [
                                {
                                    "reference": "Contract/contract1001"
                                }
                            ]
                        }
                    },
                    {
                        "fullUrl": "https://davinci-pct-ehr.logicahealth.org/fhir/Organization/org1001",
                        "resource": {
                            "resourceType": "Organization",
                            "id": "org1001",
                            "meta": {
                                "versionId": "1",
                                "lastUpdated": "2022-08-04T18:16:59.019+00:00",
                                "source": "#oDJDtZxHLNP12C7I",
                                "profile": [
                                    "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization"
                                ]
                            },
                            "text": {
                                "status": "generated",
                                "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><div style=\"display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%\"><p style=\"margin-bottom: 0px\">Resource &quot;org1001&quot; </p><p style=\"margin-bottom: 0px\">Profile: <a href=\"StructureDefinition-davinci-pct-organization.html\">PCT Organization</a></p></div><p><b>identifier</b>: Electronic Transmitter Identification Number: ETIN-3200002</p><p><b>active</b>: true</p><p><b>type</b>: Payer <span style=\"background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki\"> (<a href=\"http://terminology.hl7.org/3.1.0/CodeSystem-organization-type.html\">Organization type</a>#pay)</span></p><p><b>name</b>: Umbrella Insurance Company</p><p><b>telecom</b>: ph: 860-547-5001(WORK)</p><p><b>address</b>: 680 Asylum Street Hartford CT 06155 US </p></div>"
                            },
                            "identifier": [
                                {
                                    "type": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                                "code": "NPI",
                                                "display": "National provider identifier"
                                            }
                                        ]
                                    },
                                    "system": "http://hl7.org/fhir/sid/us-npi",
                                    "value": "1234568096"
                                }
                            ],
                            "active": true,
                            "type": [
                                {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                                            "code": "pay",
                                            "display": "Payer"
                                        }
                                    ]
                                }
                            ],
                            "name": "Umbrella Insurance Company",
                            "telecom": [
                                {
                                    "system": "phone",
                                    "value": "860-547-5001",
                                    "use": "work"
                                }
                            ],
                            "address": [
                                {
                                    "extension": [
                                        {
                                            "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/countrySubdivisionCode",
                                            "valueCoding": {
                                                "system": "urn:iso:std:iso:3166:-2",
                                                "code": "US-CT"
                                            }
                                        }
                                    ],
                                    "line": [
                                        "680 Asylum Street"
                                    ],
                                    "city": "Hartford",
                                    "state": "CT",
                                    "postalCode": "06155",
                                    "country": "US"
                                }
                            ]
                        }
                    },
                    {
                        "fullUrl": "https://davinci-pct-ehr.logicahealth.org/fhir/Organization/org1002",
                        "resource": {
                            "resourceType": "Organization",
                            "id": "org1002",
                            "meta": {
                                "versionId": "1",
                                "lastUpdated": "2022-08-16T14:00:49.682+00:00",
                                "source": "#msV3BNMVX1h6YKXG",
                                "profile": [
                                    "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization"
                                ]
                            },
                            "text": {
                                "status": "extensions",
                                "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><div style=\"display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%\"><p style=\"margin-bottom: 0px\">Resource &quot;org1002&quot; </p><p style=\"margin-bottom: 0px\">Profile: <a href=\"StructureDefinition-davinci-pct-organization.html\">PCT Organization</a></p></div><p><b>ProviderTaxonomy</b>: Diagnostic Neuroimaging (Radiology) Physician <span style=\"background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki\"> (provider-taxonomy#2085D0003X)</span></p><p><b>identifier</b>: National provider identifier: 1234568095, Tax ID number: TAX-3211001</p><p><b>active</b>: true</p><p><b>type</b>: Healthcare Provider <span style=\"background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki\"> (<a href=\"http://terminology.hl7.org/3.1.0/CodeSystem-organization-type.html\">Organization type</a>#prov)</span></p><p><b>name</b>: Boston Radiology Center</p><p><b>telecom</b>: ph: 781-232-3200(WORK)</p><p><b>address</b>: 32 Fruit Street Boston MA 02114 US </p></div>"
                            },
                            "extension": [
                                {
                                    "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/providerTaxonomy",
                                    "valueCodeableConcept": {
                                        "coding": [
                                            {
                                                "system": "http://nucc.org/provider-taxonomy",
                                                "code": "2085D0003X",
                                                "display": "Diagnostic Neuroimaging (Radiology) Physician"
                                            }
                                        ]
                                    }
                                }
                            ],
                            "identifier": [
                                {
                                    "type": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                                "code": "NPI",
                                                "display": "National provider identifier"
                                            }
                                        ]
                                    },
                                    "system": "http://hl7.org/fhir/sid/us-npi",
                                    "value": "1234568095"
                                }
                            ],
                            "active": true,
                            "type": [
                                {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                                            "code": "prov",
                                            "display": "Healthcare Provider"
                                        }
                                    ]
                                }
                            ],
                            "name": "Boston Radiology Center",
                            "telecom": [
                                {
                                    "system": "phone",
                                    "value": "781-232-3200",
                                    "use": "work"
                                }
                            ],
                            "address": [
                                {
                                    "extension": [
                                        {
                                            "url": "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/countrySubdivisionCode",
                                            "valueCoding": {
                                                "system": "urn:iso:std:iso:3166:-2",
                                                "code": "US-MA"
                                            }
                                        }
                                    ],
                                    "line": [
                                        "32 Fruit Street"
                                    ],
                                    "city": "Boston",
                                    "state": "MA",
                                    "postalCode": "02114",
                                    "country": "US"
                                }
                            ]
                        }
                    },
                    {
                        "fullUrl": "https://davinci-pct-ehr.logicahealth.org/fhir/Organization/Submitter-Org-1",
                        "resource": {
                            "resourceType": "Organization",
                            "id": "Submitter-Org-1",
                            "meta": {
                                "versionId": "1",
                                "lastUpdated": "2022-08-16T14:00:49.500+00:00",
                                "source": "#w8cCaGo1jsh4fLQK",
                                "profile": [
                                    "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization"
                                ]
                            },
                            "text": {
                                "status": "generated",
                                "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><div style=\"display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%\"><p style=\"margin-bottom: 0px\">Resource &quot;Submitter-Org-1&quot; </p><p style=\"margin-bottom: 0px\">Profile: <a href=\"StructureDefinition-davinci-pct-organization.html\">PCT Organization</a></p></div><p><b>identifier</b>: Electronic Transmitter Identification Number: ETIN-10010301</p><p><b>active</b>: true</p><p><b>type</b>: Institutional GFE Submitter <span style=\"background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki\"> (<a href=\"CodeSystem-PCTOrganizationTypeCS.html\">PCT Organization Type Code System</a>#institutional-submitter)</span></p><p><b>name</b>: GFE Service Help INC.</p><h3>Contacts</h3><table class=\"grid\"><tr><td>-</td><td><b>Purpose</b></td><td><b>Name</b></td><td><b>Telecom</b></td></tr><tr><td>*</td><td>GFE-related <span style=\"background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki\"> (<a href=\"CodeSystem-PCTOrgContactPurposeType.html\">PCT Organization Contact Purpose Type Code System</a>#GFERELATED)</span></td><td>Clara Sender</td><td>ph: 781-632-3209(WORK), <a href=\"mailto:csender@GFEServiceHelp.com\">csender@GFEServiceHelp.com</a></td></tr></table></div>"
                            },
                            "identifier": [
                                {
                                    "type": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                                "code": "NPI",
                                                "display": "National provider identifier"
                                            }
                                        ]
                                    },
                                    "system": "http://hl7.org/fhir/sid/us-npi",
                                    "value": "1234568097"
                                }
                            ],
                            "active": true,
                            "type": [
                                {
                                    "coding": [
                                        {
                                            "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTOrganizationTypeCS",
                                            "code": "institutional-submitter",
                                            "display": "Institutional GFE Submitter"
                                        }
                                    ]
                                }
                            ],
                            "name": "GFE Service Help INC.",
                            "contact": [
                                {
                                    "purpose": {
                                        "coding": [
                                            {
                                                "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTOrgContactPurposeType",
                                                "code": "GFERELATED",
                                                "display": "GFE-related"
                                            }
                                        ]
                                    },
                                    "name": {
                                        "text": "Clara Sender"
                                    },
                                    "telecom": [
                                        {
                                            "system": "phone",
                                            "value": "781-632-3209",
                                            "use": "work"
                                        },
                                        {
                                            "system": "email",
                                            "value": "csender@GFEServiceHelp.com",
                                            "use": "work"
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        "fullUrl": "http://davinci-pct-ehr.logicahealth.org/fhir/Practitioner/Submitter-Practitioner-1",
                        "resource": {
                            "resourceType": "Practitioner",
                            "id": "Submitter-Practitioner-1",
                            "meta": {
                                "versionId": "1",
                                "lastUpdated": "2022-08-16T14:00:50.904+00:00",
                                "source": "#cGxIqO47wAC88l9t",
                                "profile": [
                                    "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-practitioner"
                                ]
                            },
                            "text": {
                                "status": "generated",
                                "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><div style=\"display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%\"><p style=\"margin-bottom: 0px\">Resource &quot;Submitter-Practitioner-1&quot; </p><p style=\"margin-bottom: 0px\">Profile: <a href=\"StructureDefinition-davinci-pct-practitioner.html\">PCT Practitioner</a></p></div><p><b>identifier</b>: National provider identifier: 6456789016, Electronic Transmitter Identification Number: ETIN-20020001</p><p><b>active</b>: true</p><p><b>name</b>: Nora Ologist</p><p><b>telecom</b>: ph: 860-547-3301(WORK), <a href=\"mailto:csender@GFEServiceHelp.com\">csender@GFEServiceHelp.com</a></p></div>"
                            },
                            "identifier": [
                                {
                                    "type": {
                                        "coding": [
                                            {
                                                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                                "code": "NPI",
                                                "display": "National provider identifier"
                                            }
                                        ]
                                    },
                                    "system": "http://hl7.org/fhir/sid/us-npi",
                                    "value": "6456789016"
                                },
                                {
                                    "type": {
                                        "coding": [
                                            {
                                                "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTOrgIdentifierTypeCS",
                                                "code": "ETIN",
                                                "display": "Electronic Transmitter Identification Number"
                                            }
                                        ]
                                    },
                                    "system": "http://example.com/us-etin",
                                    "value": "ETIN-20020001"
                                }
                            ],
                            "active": true,
                            "name": [
                                {
                                    "text": "Nora Ologist",
                                    "family": "Ologist",
                                    "given": [
                                        "Nora"
                                    ]
                                }
                            ],
                            "telecom": [
                                {
                                    "system": "phone",
                                    "value": "860-547-3301",
                                    "use": "work"
                                },
                                {
                                    "system": "email",
                                    "value": "csender@GFEServiceHelp.com",
                                    "use": "work"
                                }
                            ]
                        }
                    }
                ]
            },
            "search": {
                "mode": "match"
            }
        }
    ]
}