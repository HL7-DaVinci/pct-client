import React, { useState, useContext, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Grid from '@mui/material/Grid2';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { AppContext } from '../../Context';
import {Editor} from "@monaco-editor/react";
import {Person} from "@mui/icons-material";
import AEOBBundle from '../../components/response/AEOBBundle';
import {searchDocumentReference} from '../../api';

const columns = [
  { field: 'dateOfRequest', headerName: 'Date of request', flex: 1 },
  { field: 'patient', headerName: 'Patient', flex: 1 },
  { field: 'encounterPeriod', headerName: 'Encounter period', flex: 1 },
  { field: 'serviceRequested', headerName: 'Service/Device requested', flex: 1 },
  { field: 'condition', headerName: 'Condition', flex: 1 },
  {
    field: 'fhirResource',
    headerName: 'FHIR Resource',
    flex: 1,
    renderCell: (params) => (
      <a
        href="#"
        style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          params.row.onFhirResourceClick();
        }}
      >
        View JSON
      </a>
    )
  }
];

const formatDate = dateStr => dateStr ? dateStr.split('T')[0] : '';

const fetchAeobPacket = async (row, payerServer) => {
  const docRef = row?.fhirJson ? row.fhirJson : row;
  const base64Binary = docRef?.content?.[0]?.attachment?.data;
  if (!base64Binary) {
    return { error: 'Attachment data not found in DocumentReference content.' };
  }
  try {
    const base64BinaryDecoded = atob(base64Binary);
    let corrected = `{
  "resourceType" : "Bundle",
  "id" : "PCT-AEOB-Packet-1",
  "meta" : {
    "profile" : [
      "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-aeob-packet"
    ]
  },
  "identifier" : {
    "system" : "http://example.com/identifiers/bundle",
    "value" : "59688475-2324-3242-1234568"
  },
  "type" : "document",
  "timestamp" : "2025-01-10T11:01:00+05:00",
  "entry" : [
    {
      "fullUrl" : "http://example.org/fhir/Composition/PCT-AEOB-Composition-1",
      "resource" : {
        "resourceType" : "Composition",
        "id" : "PCT-AEOB-Composition-1",
        "meta" : {
          "profile" : [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-aeob-composition"
          ]
        },
        "extension" : [
          {
            "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/requestInitiationTime",
            "valueInstant" : "2025-01-08T09:01:00+05:00"
          }
        ],
        "identifier" : {
          "system" : "http://www.example.org/identifiers/composition",
          "value" : "019283475"
        },
        "status" : "final",
        "type" : {
          "coding" : [
            {
              "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentTypeTemporaryTrialUse",
              "code" : "aeob-packet",
              "display" : "AEOB Packet"
            }
          ]
        },
        "category" : [
          {
            "coding" : [
              {
                "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentTypeTemporaryTrialUse",
                "code" : "estimate"
              }
            ]
          }
        ],
        "subject" : {
          "reference" : "Patient/patient1001"
        },
        "date" : "2025-01-10T11:01:00+05:00",
        "author" : [
          {
            "reference" : "Organization/org1001"
          },
          {
            "reference" : "Organization/Submitter-Org-1"
          }
        ],
        "title" : "Advanced Explanation of Benefit Packet for Eve Betterhalf - 2025-01-10",
        "section" : [
          {
            "code" : {
              "coding" : [
                {
                  "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentSection",
                  "code" : "aeob-summary-section"
                }
              ]
            },
            "entry" : [
              {
                "reference" : "ExplanationOfBenefit/PCT-AEOB-Summary-1"
              }
            ]
          },
          {
            "code" : {
              "coding" : [
                {
                  "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentSection",
                  "code" : "aeob-section"
                }
              ]
            },
            "entry" : [
              {
                "reference" : "ExplanationOfBenefit/PCT-AEOB-1"
              }
            ]
          },
          {
            "code" : {
              "coding" : [
                {
                  "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentSection",
                  "code" : "gfe-section"
                }
              ]
            },
            "author" : [
              {
                "reference" : "Organization/Submitter-Org-1"
              }
            ],
            "entry" : [
              {
                "reference" : "Bundle/PCT-GFE-Bundle-Inst-1"
              }
            ]
          },
          {
            "code" : {
              "coding" : [
                {
                  "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDocumentSection",
                  "code" : "gfe-section"
                }
              ]
            },
            "author" : [
              {
                "reference" : "Organization/Submitter-Org-1"
              }
            ],
            "entry" : [
              {
                "reference" : "Bundle/PCT-GFE-Missing-Bundle-1"
              }
            ]
          }
        ]
      }
    },
    {
      "fullUrl" : "http://example.org/fhir/ExplanationOfBenefit/PCT-AEOB-Summary-1",
      "resource" : {
        "resourceType" : "ExplanationOfBenefit",
        "id" : "PCT-AEOB-Summary-1",
        "meta" : {
          "profile" : [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-aeob-summary"
          ]
        },
        "extension" : [
          {
            "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/serviceDescription",
            "valueString" : "Example service"
          },
          {
            "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/inNetworkProviderOptionsLink",
            "valueUrl" : "http://example.org/out-of-network.html"
          }
        ],
        "status" : "active",
        "type" : {
          "coding" : [
            {
              "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTEstimateTypeSummaryCSTemporaryTrialUse",
              "code" : "estimate-summary",
              "display" : "Estimate Summary"
            }
          ]
        },
        "use" : "predetermination",
        "patient" : {
          "reference" : "Patient/patient1001"
        },
        "billablePeriod" : {
          "start" : "2022-01-01",
          "end" : "2022-01-01"
        },
        "created" : "2021-10-12",
        "insurer" : {
          "reference" : "Organization/org1001"
        },
        "provider" : {
          "extension" : [
            {
              "url" : "http://hl7.org/fhir/StructureDefinition/data-absent-reason",
              "valueCode" : "not-applicable"
            }
          ]
        },
        "outcome" : "complete",
        "insurance" : [
          {
            "focal" : true,
            "coverage" : {
              "reference" : "Coverage/coverage1001"
            }
          }
        ],
        "total" : [
          {
            "category" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/adjudication",
                  "version" : "1.0.1",
                  "code" : "submitted",
                  "display" : "Submitted Amount"
                }
              ]
            },
            "amount" : {
              "value" : 200,
              "currency" : "USD"
            }
          },
          {
            "category" : {
              "coding" : [
                {
                  "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTAdjudicationCategoryCS",
                  "code" : "memberliability",
                  "display" : "Member liability"
                }
              ]
            },
            "amount" : {
              "value" : 20,
              "currency" : "USD"
            }
          },
          {
            "category" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/adjudication",
                  "version" : "1.0.1",
                  "code" : "eligible",
                  "display" : "Eligible Amount"
                }
              ]
            },
            "amount" : {
              "value" : 190,
              "currency" : "USD"
            }
          }
        ],
        "processNote" : [
          {
            "extension" : [
              {
                "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/processNoteClass",
                "valueCodeableConcept" : {
                  "coding" : [
                    {
                      "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTAEOBProcessNoteCS",
                      "code" : "disclaimer",
                      "display" : "Disclaimer"
                    }
                  ]
                }
              }
            ],
            "text" : "processNote disclaimer text"
          }
        ],
        "benefitPeriod" : {
          "start" : "2022-01-01",
          "end" : "2022-01-01"
        },
        "benefitBalance" : [
          {
            "category" : {
              "coding" : [
                {
                  "system" : "https://x12.org/codes/service-type-codes",
                  "code" : "1",
                  "display" : "Medical Care"
                }
              ],
              "text" : "Medical Care"
            },
            "unit" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/benefit-unit",
                  "code" : "individual"
                }
              ]
            },
            "term" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/benefit-term",
                  "code" : "annual"
                }
              ]
            },
            "financial" : [
              {
                "extension" : [
                  {
                    "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/remaining-benefit",
                    "valueMoney" : {
                      "value" : 0,
                      "currency" : "USD"
                    }
                  }
                ],
                "type" : {
                  "coding" : [
                    {
                      "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTFinancialType",
                      "code" : "allowed"
                    }
                  ]
                },
                "allowedMoney" : {
                  "value" : 1,
                  "currency" : "USD"
                },
                "usedMoney" : {
                  "value" : 1,
                  "currency" : "USD"
                }
              }
            ]
          }
        ]
      }
    },
    {
      "fullUrl" : "http://example.org/fhir/ExplanationOfBenefit/PCT-AEOB-1",
      "resource" : {
        "resourceType" : "ExplanationOfBenefit",
        "id" : "PCT-AEOB-1",
        "meta" : {
          "profile" : [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-aeob"
          ]
        },
        "extension" : [
          {
            "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeReference",
            "valueReference" : {
              "reference" : "Bundle/PCT-GFE-Bundle-Inst-1"
            }
          },
          {
            "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/serviceDescription",
            "valueString" : "Example service"
          },
          {
            "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/inNetworkProviderOptionsLink",
            "valueUrl" : "http://example.org/out-of-network.html"
          }
        ],
        "identifier" : [
          {
            "type" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/v2-0203",
                  "code" : "UCID"
                }
              ]
            }
          }
        ],
        "status" : "active",
        "type" : {
          "coding" : [
            {
              "system" : "http://terminology.hl7.org/CodeSystem/claim-type",
              "code" : "institutional",
              "display" : "Institutional"
            }
          ]
        },
        "use" : "predetermination",
        "patient" : {
          "reference" : "Patient/patient1001"
        },
        "created" : "2021-10-12",
        "insurer" : {
          "reference" : "Organization/org1001"
        },
        "provider" : {
          "reference" : "Organization/org1002"
        },
        "priority" : {
          "coding" : [
            {
              "system" : "http://terminology.hl7.org/CodeSystem/processpriority",
              "code" : "normal"
            }
          ]
        },
        "claim" : {
          "identifier" : {
            "system" : "http://example.com/identifiers/bundle",
            "value" : "59688475-2324-3242-23473847"
          }
        },
        "outcome" : "complete",
        "insurance" : [
          {
            "focal" : true,
            "coverage" : {
              "reference" : "Coverage/coverage1001"
            }
          }
        ],
        "item" : [
          {
            "sequence" : 1,
            "revenue" : {
              "coding" : [
                {
                  "system" : "https://www.nubc.org/CodeSystem/RevenueCodes",
                  "code" : "0611",
                  "display" : "Magnetic Resonance Technology (MRT) - Brain/brain stem"
                }
              ]
            },
            "productOrService" : {
              "coding" : [
                {
                  "system" : "http://www.ama-assn.org/go/cpt",
                  "code" : "70551",
                  "display" : "Magnetic resonance (eg, proton) imaging, brain (including brain stem); without contrast material"
                }
              ]
            },
            "modifier" : [
              {
                "coding" : [
                  {
                    "system" : "http://www.ama-assn.org/go/cpt",
                    "code" : "70551",
                    "display" : "Magnetic resonance (eg, proton) imaging, brain (including brain stem); without contrast material"
                  }
                ]
              }
            ],
            "servicedDate" : "2022-01-01",
            "net" : {
              "value" : 200,
              "currency" : "USD"
            },
            "adjudication" : [
              {
                "extension" : [
                  {
                    "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/subjectToMedicalMgmt",
                    "valueCodeableConcept" : {
                      "coding" : [
                        {
                          "system" : "http://terminology.hl7.org/CodeSystem/medical-management-type",
                          "code" : "concurrent-review",
                          "display" : "Concurrent Review"
                        }
                      ]
                    }
                  }
                ],
                "category" : {
                  "coding" : [
                    {
                      "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTAdjudicationCategoryCS",
                      "code" : "medicalmanagement",
                      "display" : "Medical Management"
                    }
                  ]
                }
              }
            ]
          }
        ],
        "adjudication" : [
          {
            "extension" : [
              {
                "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/subjectToMedicalMgmt",
                "valueCodeableConcept" : {
                  "coding" : [
                    {
                      "system" : "http://terminology.hl7.org/CodeSystem/medical-management-type",
                      "code" : "concurrent-review",
                      "display" : "Concurrent Review"
                    }
                  ]
                }
              }
            ],
            "category" : {
              "coding" : [
                {
                  "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTAdjudicationCategoryCS",
                  "code" : "medicalmanagement",
                  "display" : "Medical Management"
                }
              ]
            }
          },
          {
            "category" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/adjudication",
                  "code" : "submitted",
                  "display" : "Submitted Amount"
                }
              ]
            }
          },
          {
            "category" : {
              "coding" : [
                {
                  "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTAdjudicationCategoryCS",
                  "code" : "memberliability",
                  "display" : "Member Liability"
                }
              ]
            }
          }
        ],
        "total" : [
          {
            "category" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/adjudication",
                  "version" : "1.0.1",
                  "code" : "submitted",
                  "display" : "Submitted Amount"
                }
              ]
            },
            "amount" : {
              "value" : 200,
              "currency" : "USD"
            }
          },
          {
            "category" : {
              "coding" : [
                {
                  "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTAdjudicationCategoryCS",
                  "code" : "memberliability",
                  "display" : "Member liability"
                }
              ]
            },
            "amount" : {
              "value" : 20,
              "currency" : "USD"
            }
          },
          {
            "category" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/adjudication",
                  "version" : "1.0.1",
                  "code" : "eligible",
                  "display" : "Eligible Amount"
                }
              ]
            },
            "amount" : {
              "value" : 190,
              "currency" : "USD"
            }
          }
        ],
        "processNote" : [
          {
            "extension" : [
              {
                "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/processNoteClass",
                "valueCodeableConcept" : {
                  "coding" : [
                    {
                      "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTAEOBProcessNoteCS",
                      "code" : "disclaimer",
                      "display" : "Disclaimer"
                    }
                  ]
                }
              }
            ],
            "text" : "processNote disclaimer text"
          }
        ],
        "benefitPeriod" : {
          "start" : "2022-01-01",
          "end" : "2023-01-01"
        },
        "benefitBalance" : [
          {
            "category" : {
              "coding" : [
                {
                  "system" : "https://x12.org/codes/service-type-codes",
                  "code" : "1",
                  "display" : "Medical Care"
                }
              ],
              "text" : "Medical Care"
            },
            "unit" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/benefit-unit",
                  "code" : "individual"
                }
              ]
            },
            "term" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/benefit-term",
                  "code" : "annual"
                }
              ]
            },
            "financial" : [
              {
                "extension" : [
                  {
                    "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/remaining-benefit",
                    "valueMoney" : {
                      "value" : 0,
                      "currency" : "USD"
                    }
                  }
                ],
                "type" : {
                  "coding" : [
                    {
                      "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTFinancialType",
                      "code" : "allowed"
                    }
                  ]
                },
                "allowedMoney" : {
                  "value" : 1,
                  "currency" : "USD"
                },
                "usedMoney" : {
                  "value" : 1,
                  "currency" : "USD"
                }
              }
            ]
          }
        ]
      }
    },
    {
      "fullUrl" : "http://example.org/fhir/Patient/patient1001",
      "resource" : {
        "resourceType" : "Patient",
        "id" : "patient1001",
        "meta" : {
          "profile" : [
            "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient|7.0.0"
          ]
        },
        "text" : {
          "status" : "additional",
          "div" : "<div xmlns=\\"http://www.w3.org/1999/xhtml\\"><a name=\\"Patient_patient1001\\"> </a><p style=\\"border: 1px #661aff solid; background-color: #e6e6ff; padding: 10px;\\"><b>Eve Betterhalf</b> female, DoB: 1955-07-23 ( <code>http://example.com/identifiers/patient</code>/1001)</p><hr/><table class=\\"grid\\"><tr><td style=\\"background-color: #f3f5da\\" title=\\"Known Marital status of Patient\\">Marital Status:</td><td colspan=\\"3\\"><span title=\\"Codes: {http://terminology.hl7.org/CodeSystem/v3-MaritalStatus U}\\">unmarried</span></td></tr><tr><td style=\\"background-color: #f3f5da\\" title=\\"Ways to contact the Patient\\">Contact Details:</td><td colspan=\\"3\\"><ul><li>ph: 781-949-4949(MOBILE)</li><li>222 Burlington Road, Bedford MA 01730</li></ul></td></tr><tr><td style=\\"background-color: #f3f5da\\" title=\\"Languages spoken\\">Language:</td><td colspan=\\"3\\"><span title=\\"Codes: {urn:ietf:bcp:47 en-US}\\">English (United States)</span> (preferred)</td></tr></table></div>"
        },
        "identifier" : [
          {
            "system" : "http://example.com/identifiers/patient",
            "value" : "1001"
          }
        ],
        "name" : [
          {
            "text" : "Eve Betterhalf",
            "family" : "Betterhalf",
            "given" : [
              "Eve"
            ]
          }
        ],
        "telecom" : [
          {
            "system" : "phone",
            "value" : "781-949-4949",
            "use" : "mobile"
          }
        ],
        "gender" : "female",
        "birthDate" : "1955-07-23",
        "address" : [
          {
            "text" : "222 Burlington Road, Bedford MA 01730"
          }
        ],
        "maritalStatus" : {
          "coding" : [
            {
              "system" : "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
              "code" : "U",
              "display" : "unmarried"
            }
          ]
        },
        "communication" : [
          {
            "language" : {
              "coding" : [
                {
                  "system" : "urn:ietf:bcp:47",
                  "code" : "en-US",
                  "display" : "English (United States)"
                }
              ]
            },
            "preferred" : true
          }
        ]
      }
    },
    {
      "fullUrl" : "http://example.org/fhir/Coverage/coverage1001",
      "resource" : {
        "resourceType" : "Coverage",
        "id" : "coverage1001",
        "meta" : {
          "profile" : [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-coverage"
          ]
        },
        "extension" : [
          {
            "url" : "http://hl7.org/fhir/5.0/StructureDefinition/extension-Coverage.kind",
            "valueCode" : "insurance"
          }
        ],
        "status" : "active",
        "subscriberId" : "PFP123450000",
        "beneficiary" : {
          "reference" : "Patient/patient1001"
        },
        "relationship" : {
          "coding" : [
            {
              "system" : "http://terminology.hl7.org/CodeSystem/subscriber-relationship",
              "code" : "self",
              "display" : "Self"
            }
          ]
        },
        "period" : {
          "start" : "2021-01-01",
          "end" : "2022-01-01"
        },
        "payor" : [
          {
            "reference" : "Organization/org1001"
          }
        ],
        "class" : [
          {
            "type" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/coverage-class",
                  "code" : "plan",
                  "display" : "Plan"
                }
              ]
            },
            "value" : "Premim Family Plus",
            "name" : "Premim Family Plus Plan"
          }
        ],
        "costToBeneficiary" : [
          {
            "type" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/coverage-copay-type",
                  "code" : "copaypct",
                  "display" : "Copay Percentage"
                }
              ]
            },
            "valueQuantity" : {
              "value" : 20
            }
          }
        ]
      }
    },
    {
      "fullUrl" : "http://example.org/fhir/Organization/org1001",
      "resource" : {
        "resourceType" : "Organization",
        "id" : "org1001",
        "meta" : {
          "profile" : [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization"
          ]
        },
        "identifier" : [
          {
            "type" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/v2-0203",
                  "code" : "ETIN"
                }
              ]
            },
            "value" : "ETIN-3200002"
          }
        ],
        "active" : true,
        "type" : [
          {
            "coding" : [
              {
                "system" : "http://terminology.hl7.org/CodeSystem/organization-type",
                "code" : "pay",
                "display" : "Payer"
              }
            ]
          }
        ],
        "name" : "Aetna",
        "telecom" : [
          {
            "system" : "phone",
            "value" : "860-547-5001",
            "use" : "work"
          }
        ],
        "address" : [
          {
            "line" : [
              "680 Asylum Street"
            ],
            "city" : "Hartford",
            "state" : "CT",
            "postalCode" : "06155",
            "country" : "US"
          }
        ]
      }
    },
    {
      "fullUrl" : "http://example.org/fhir/Organization/Submitter-Org-1",
      "resource" : {
        "resourceType" : "Organization",
        "id" : "Submitter-Org-1",
        "meta" : {
          "profile" : [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization"
          ]
        },
        "identifier" : [
          {
            "type" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/v2-0203",
                  "code" : "ETIN"
                }
              ]
            },
            "value" : "ETIN-10010301"
          }
        ],
        "active" : true,
        "type" : [
          {
            "coding" : [
              {
                "system" : "http://terminology.hl7.org/CodeSystem/organization-type",
                "code" : "bus"
              }
            ]
          }
        ],
        "name" : "GFE Service Help INC.",
        "contact" : [
          {
            "purpose" : {
              "coding" : [
                {
                  "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTOrgContactPurposeType",
                  "code" : "GFERELATED"
                }
              ]
            },
            "name" : {
              "text" : "Clara Sender"
            },
            "telecom" : [
              {
                "system" : "phone",
                "value" : "781-632-3209",
                "use" : "work"
              },
              {
                "system" : "email",
                "value" : "csender@GFEServiceHelp.com",
                "use" : "work"
              }
            ]
          }
        ]
      }
    },
    {
      "fullUrl" : "http://example.org/fhir/Organization/org1002",
      "resource" : {
        "resourceType" : "Organization",
        "id" : "org1002",
        "meta" : {
          "profile" : [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization"
          ]
        },
        "identifier" : [
          {
            "system" : "http://hl7.org/fhir/sid/us-npi",
            "value" : "9941339100"
          },
          {
            "type" : {
              "coding" : [
                {
                  "system" : "http://terminology.hl7.org/CodeSystem/v2-0203",
                  "code" : "TAX"
                }
              ]
            },
            "system" : "urn:oid:2.16.840.1.113883.4.4",
            "value" : "TAX-3211001"
          }
        ],
        "active" : true,
        "type" : [
          {
            "coding" : [
              {
                "system" : "http://terminology.hl7.org/CodeSystem/organization-type",
                "code" : "prov",
                "display" : "Healthcare Provider"
              }
            ]
          }
        ],
        "name" : "Boston Radiology Center",
        "telecom" : [
          {
            "system" : "phone",
            "value" : "781-232-3200",
            "use" : "work"
          }
        ],
        "address" : [
          {
            "line" : [
              "32 Fruit Street"
            ],
            "city" : "Boston",
            "state" : "MA",
            "postalCode" : "02114",
            "country" : "US"
          }
        ]
      }
    },
    {
      "fullUrl" : "http://example.org/fhir/Bundle/PCT-GFE-Bundle-Inst-1",
      "resource" : {
        "resourceType" : "Bundle",
        "id" : "PCT-GFE-Bundle-Inst-1",
        "meta" : {
          "profile" : [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-bundle"
          ]
        },
        "identifier" : {
          "system" : "http://example.com/identifiers/bundle",
          "value" : "59688475-2324-3242-23473847"
        },
        "type" : "collection",
        "timestamp" : "2021-11-09T11:01:00+05:00",
        "entry" : [
          {
            "fullUrl" : "http://example.org/fhir/Claim/PCT-GFE-Summary-1",
            "resource" : {
              "resourceType" : "Claim",
              "id" : "PCT-GFE-Summary-1",
              "meta" : {
                "profile" : [
                  "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-summary"
                ]
              },
              "status" : "active",
              "type" : {
                "coding" : [
                  {
                    "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTEstimateTypeSummaryCSTemporaryTrialUse",
                    "code" : "estimate-summary",
                    "display" : "Estimate Summary"
                  }
                ]
              },
              "use" : "predetermination",
              "patient" : {
                "reference" : "Patient/patient1001"
              },
              "billablePeriod" : {
                "start" : "2021-10-31",
                "end" : "2021-10-31"
              },
              "created" : "2021-10-05",
              "insurer" : {
                "reference" : "Organization/org1001"
              },
              "provider" : {
                "extension" : [
                  {
                    "url" : "http://hl7.org/fhir/StructureDefinition/data-absent-reason",
                    "valueCode" : "not-applicable"
                  }
                ]
              },
              "priority" : {
                "coding" : [
                  {
                    "system" : "http://terminology.hl7.org/CodeSystem/processpriority",
                    "code" : "normal"
                  }
                ]
              },
              "diagnosis" : [
                {
                  "sequence" : 1,
                  "diagnosisCodeableConcept" : {
                    "coding" : [
                      {
                        "system" : "http://hl7.org/fhir/sid/icd-10-cm",
                        "code" : "S06.30",
                        "display" : "Unspecified focal traumatic brain injury"
                      }
                    ]
                  },
                  "type" : [
                    {
                      "coding" : [
                        {
                          "system" : "http://terminology.hl7.org/CodeSystem/diagnosistype",
                          "code" : "principal"
                        }
                      ]
                    }
                  ],
                  "packageCode" : {
                    "coding" : [
                      {
                        "system" : "http://terminology.hl7.org/CodeSystem/ex-diagnosisrelatedgroup",
                        "code" : "400",
                        "display" : "Head trauma - concussion"
                      }
                    ]
                  }
                }
              ],
              "insurance" : [
                {
                  "sequence" : 1,
                  "focal" : true,
                  "coverage" : {
                    "reference" : "Coverage/coverage1001"
                  }
                }
              ],
              "total" : {
                "value" : 200,
                "currency" : "USD"
              }
            }
          },
          {
            "fullUrl" : "http://example.org/fhir/Claim/PCT-GFE-Institutional-1",
            "resource" : {
              "resourceType" : "Claim",
              "id" : "PCT-GFE-Institutional-1",
              "meta" : {
                "profile" : [
                  "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-institutional"
                ]
              },
              "extension" : [
                {
                  "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/providerEventMethodology",
                  "valueString" : "EEMM1021"
                },
                {
                  "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeDisclaimer",
                  "valueString" : "For estimation purposes only"
                },
                {
                  "extension" : [
                    {
                      "url" : "linkingIdentifier",
                      "valueIdentifier" : {
                        "system" : "http://example.org/Claim/identifiers",
                        "value" : "223452-2342-2435-008001"
                      }
                    },
                    {
                      "url" : "plannedPeriodOfService",
                      "valueDate" : "2021-10-31"
                    }
                  ],
                  "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeServiceLinkingInfo"
                }
              ],
              "identifier" : [
                {
                  "type" : {
                    "coding" : [
                      {
                        "system" : "http://terminology.hl7.org/CodeSystem/v2-0203",
                        "code" : "PLAC",
                        "display" : "Placer Identifier"
                      }
                    ]
                  },
                  "system" : "http://terminology.hl7.org/CodeSystem/v2-0203",
                  "value" : "GFEProviderAssignedID0001"
                }
              ],
              "status" : "active",
              "type" : {
                "coding" : [
                  {
                    "system" : "http://terminology.hl7.org/CodeSystem/claim-type",
                    "code" : "institutional",
                    "display" : "Institutional"
                  }
                ]
              },
              "use" : "predetermination",
              "patient" : {
                "reference" : "Patient/patient1001"
              },
              "created" : "2021-10-05",
              "insurer" : {
                "reference" : "Organization/org1001"
              },
              "provider" : {
                "extension" : [
                  {
                    "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/providerTaxonomy",
                    "valueCodeableConcept" : {
                      "coding" : [
                        {
                          "system" : "http://nucc.org/provider-taxonomy",
                          "code" : "2085D0003X",
                          "display" : "Diagnostic Neuroimaging (Radiology) Physician"
                        }
                      ]
                    }
                  },
                  {
                    "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeConsentForBalanceBilling",
                    "valueBoolean" : true
                  }
                ],
                "reference" : "Organization/Submitter-Org-1"
              },
              "priority" : {
                "coding" : [
                  {
                    "system" : "http://terminology.hl7.org/CodeSystem/processpriority",
                    "code" : "normal"
                  }
                ]
              },
              "payee" : {
                "type" : {
                  "coding" : [
                    {
                      "system" : "http://terminology.hl7.org/CodeSystem/payeetype",
                      "code" : "provider"
                    }
                  ]
                }
              },
              "referral" : {
                "extension" : [
                  {
                    "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/referralNumber",
                    "valueString" : "REF12022002-121"
                  }
                ],
                "display" : "Referral Number"
              },
              "supportingInfo" : [
                {
                  "sequence" : 1,
                  "category" : {
                    "coding" : [
                      {
                        "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTSupportingInfoType",
                        "code" : "typeofbill"
                      }
                    ]
                  },
                  "code" : {
                    "coding" : [
                      {
                        "system" : "https://www.nubc.org/CodeSystem/TypeOfBill",
                        "code" : "011X",
                        "display" : "Hospital Inpatient (Part A)"
                      }
                    ]
                  }
                }
              ],
              "diagnosis" : [
                {
                  "sequence" : 1,
                  "diagnosisCodeableConcept" : {
                    "coding" : [
                      {
                        "system" : "http://hl7.org/fhir/sid/icd-10-cm",
                        "code" : "S06.30",
                        "display" : "Unspecified focal traumatic brain injury"
                      }
                    ]
                  },
                  "type" : [
                    {
                      "coding" : [
                        {
                          "system" : "http://terminology.hl7.org/CodeSystem/diagnosistype",
                          "code" : "principal"
                        }
                      ]
                    }
                  ],
                  "packageCode" : {
                    "coding" : [
                      {
                        "system" : "http://terminology.hl7.org/CodeSystem/ex-diagnosisrelatedgroup",
                        "code" : "400",
                        "display" : "Head trauma - concussion"
                      }
                    ]
                  }
                }
              ],
              "insurance" : [
                {
                  "sequence" : 1,
                  "focal" : true,
                  "coverage" : {
                    "reference" : "Coverage/coverage1001"
                  }
                }
              ],
              "item" : [
                {
                  "extension" : [
                    {
                      "url" : "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/serviceDescription",
                      "valueString" : "Imaging"
                    }
                  ],
                  "sequence" : 1,
                  "revenue" : {
                    "coding" : [
                      {
                        "system" : "https://www.nubc.org/CodeSystem/RevenueCodes",
                        "code" : "0611",
                        "display" : "Magnetic Resonance Technology (MRT) - Brain/brain stem"
                      }
                    ]
                  },
                  "productOrService" : {
                    "coding" : [
                      {
                        "system" : "http://www.ama-assn.org/go/cpt",
                        "code" : "70551",
                        "display" : "Magnetic resonance (eg, proton) imaging, brain (including brain stem); without contrast material"
                      }
                    ]
                  },
                  "modifier" : [
                    {
                      "coding" : [
                        {
                          "system" : "http://www.ama-assn.org/go/cpt",
                          "code" : "70551",
                          "display" : "Magnetic resonance (eg, proton) imaging, brain (including brain stem); without contrast material"
                        }
                      ]
                    }
                  ],
                  "servicedDate" : "2021-10-31",
                  "quantity" : {
                    "value" : 1
                  },
                  "net" : {
                    "value" : 200,
                    "currency" : "USD"
                  }
                }
              ],
              "total" : {
                "value" : 200,
                "currency" : "USD"
              }
            }
          },
          {
            "fullUrl" : "http://example.org/fhir/Organization/Submitter-Org-1",
            "resource" : {
              "resourceType" : "Organization",
              "id" : "Submitter-Org-1",
              "meta" : {
                "profile" : [
                  "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization"
                ]
              },
              "identifier" : [
                {
                  "type" : {
                    "coding" : [
                      {
                        "system" : "http://terminology.hl7.org/CodeSystem/v2-0203",
                        "code" : "ETIN"
                      }
                    ]
                  },
                  "value" : "ETIN-10010301"
                }
              ],
              "active" : true,
              "type" : [
                {
                  "coding" : [
                    {
                      "system" : "http://terminology.hl7.org/CodeSystem/organization-type",
                      "code" : "bus"
                    }
                  ]
                }
              ],
              "name" : "GFE Service Help INC.",
              "contact" : [
                {
                  "purpose" : {
                    "coding" : [
                      {
                        "system" : "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTOrgContactPurposeType",
                        "code" : "GFERELATED"
                      }
                    ]
                  },
                  "name" : {
                    "text" : "Clara Sender"
                  },
                  "telecom" : [
                    {
                      "system" : "phone",
                      "value" : "781-632-3209",
                      "use" : "work"
                    },
                    {
                      "system" : "email",
                      "value" : "csender@GFEServiceHelp.com",
                      "use" : "work"
                    }
                  ]
                }
              ]
            }
          },
          {
            "fullUrl" : "http://example.org/fhir/Organization/org1001",
            "resource" : {
              "resourceType" : "Organization",
              "id" : "org1001",
              "meta" : {
                "profile" : [
                  "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization"
                ]
              },
              "identifier" : [
                {
                  "type" : {
                    "coding" : [
                      {
                        "system" : "http://terminology.hl7.org/CodeSystem/v2-0203",
                        "code" : "ETIN"
                      }
                    ]
                  },
                  "value" : "ETIN-3200002"
                }
              ],
              "active" : true,
              "type" : [
                {
                  "coding" : [
                    {
                      "system" : "http://terminology.hl7.org/CodeSystem/organization-type",
                      "code" : "pay",
                      "display" : "Payer"
                    }
                  ]
                }
              ],
              "name" : "Aetna",
              "telecom" : [
                {
                  "system" : "phone",
                  "value" : "860-547-5001",
                  "use" : "work"
                }
              ],
              "address" : [
                {
                  "line" : [
                    "680 Asylum Street"
                  ],
                  "city" : "Hartford",
                  "state" : "CT",
                  "postalCode" : "06155",
                  "country" : "US"
                }
              ]
            }
          },
          {
            "fullUrl" : "http://example.org/fhir/Patient/patient1001",
            "resource" : {
              "resourceType" : "Patient",
              "id" : "patient1001",
              "meta" : {
                "profile" : [
                  "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient|7.0.0"
                ]
              },
              "identifier" : [
                {
                  "system" : "http://example.com/identifiers/patient",
                  "value" : "1001"
                }
              ],
              "name" : [
                {
                  "text" : "Eve Betterhalf",
                  "family" : "Betterhalf",
                  "given" : [
                    "Eve"
                  ]
                }
              ],
              "telecom" : [
                {
                  "system" : "phone",
                  "value" : "781-949-4949",
                  "use" : "mobile"
                }
              ],
              "gender" : "female",
              "birthDate" : "1955-07-23",
              "address" : [
                {
                  "text" : "222 Burlington Road, Bedford MA 01730"
                }
              ],
              "maritalStatus" : {
                "coding" : [
                  {
                    "system" : "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
                    "code" : "U",
                    "display" : "unmarried"
                  }
                ]
              },
              "communication" : [
                {
                  "language" : {
                    "coding" : [
                      {
                        "system" : "urn:ietf:bcp:47",
                        "code" : "en-US",
                        "display" : "English (United States)"
                      }
                    ]
                  },
                  "preferred" : true
                }
              ]
            }
          },
          {
            "fullUrl" : "http://example.org/fhir/Coverage/coverage1001",
            "resource" : {
              "resourceType" : "Coverage",
              "id" : "coverage1001",
              "meta" : {
                "profile" : [
                  "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-coverage"
                ]
              },
              "extension" : [
                {
                  "url" : "http://hl7.org/fhir/5.0/StructureDefinition/extension-Coverage.kind",
                  "valueCode" : "insurance"
                }
              ],
              "status" : "active",
              "subscriberId" : "PFP123450000",
              "beneficiary" : {
                "reference" : "Patient/patient1001"
              },
              "relationship" : {
                "coding" : [
                  {
                    "system" : "http://terminology.hl7.org/CodeSystem/subscriber-relationship",
                    "code" : "self",
                    "display" : "Self"
                  }
                ]
              },
              "period" : {
                "start" : "2021-01-01",
                "end" : "2022-01-01"
              },
              "payor" : [
                {
                  "reference" : "Organization/org1001"
                }
              ],
              "class" : [
                {
                  "type" : {
                    "coding" : [
                      {
                        "system" : "http://terminology.hl7.org/CodeSystem/coverage-class",
                        "code" : "plan",
                        "display" : "Plan"
                      }
                    ]
                  },
                  "value" : "Premim Family Plus",
                  "name" : "Premim Family Plus Plan"
                }
              ],
              "costToBeneficiary" : [
                {
                  "type" : {
                    "coding" : [
                      {
                        "system" : "http://terminology.hl7.org/CodeSystem/coverage-copay-type",
                        "code" : "copaypct",
                        "display" : "Copay Percentage"
                      }
                    ]
                  },
                  "valueQuantity" : {
                    "value" : 20
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      "fullUrl" : "http://example.org/fhir/Bundle/PCT-GFE-Missing-Bundle-1",
      "resource" : {
        "resourceType" : "Bundle",
        "id" : "PCT-GFE-Missing-Bundle-1",
        "meta" : {
          "profile" : [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-missing-bundle"
          ]
        },
        "identifier" : {
          "system" : "http://example.com/identifiers/bundle",
          "value" : "59688475-2324-3242-2347384376"
        },
        "type" : "collection",
        "timestamp" : "2024-03-27T11:01:00+05:00",
        "entry" : [
          {
            "fullUrl" : "http://example.org/fhir/Organization/org1002",
            "resource" : {
              "resourceType" : "Organization",
              "id" : "org1002",
              "meta" : {
                "profile" : [
                  "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization"
                ]
              },
              "identifier" : [
                {
                  "system" : "http://hl7.org/fhir/sid/us-npi",
                  "value" : "9941339100"
                },
                {
                  "type" : {
                    "coding" : [
                      {
                        "system" : "http://terminology.hl7.org/CodeSystem/v2-0203",
                        "code" : "TAX"
                      }
                    ]
                  },
                  "system" : "urn:oid:2.16.840.1.113883.4.4",
                  "value" : "TAX-3211001"
                }
              ],
              "active" : true,
              "type" : [
                {
                  "coding" : [
                    {
                      "system" : "http://terminology.hl7.org/CodeSystem/organization-type",
                      "code" : "prov",
                      "display" : "Healthcare Provider"
                    }
                  ]
                }
              ],
              "name" : "Boston Radiology Center",
              "telecom" : [
                {
                  "system" : "phone",
                  "value" : "781-232-3200",
                  "use" : "work"
                }
              ],
              "address" : [
                {
                  "line" : [
                    "32 Fruit Street"
                  ],
                  "city" : "Boston",
                  "state" : "MA",
                  "postalCode" : "02114",
                  "country" : "US"
                }
              ]
            }
          },
          {
            "fullUrl" : "http://example.org/fhir/Patient/patient1001",
            "resource" : {
  "active": true,
  "address": [
    {
      "city": "Hartford",
      "country": "US",
      "extension": [
        {
          "extension": [
            {
              "url": "latitude",
              "valueDecimal": 41.836140177559656
            },
            {
              "url": "longitude",
              "valueDecimal": -72.64516676367619
            }
          ],
          "url": "http://hl7.org/fhir/StructureDefinition/geolocation"
        }
      ],
      "line": [
        "845 Bernhard Key"
      ],
      "postalCode": "06160",
      "state": "CT",
      "text": "845 Bernhard Key, Hartford, CT 06160"
    }
  ],
  "birthDate": "1984-09-18",
  "communication": [
    {
      "language": {
        "coding": [
          {
            "code": "en",
            "display": "English",
            "system": "urn:ietf:bcp:47"
          }
        ]
      }
    }
  ],
  "extension": [
    {
      "extension": [
        {
          "url": "ombCategory",
          "valueCoding": {
            "code": "2106-3",
            "display": "White",
            "system": "urn:oid:2.16.840.1.113883.6.238"
          }
        },
        {
          "url": "text",
          "valueString": "White"
        }
      ],
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"
    },
    {
      "extension": [
        {
          "url": "ombCategory",
          "valueCoding": {
            "code": "2186-5",
            "display": "Not Hispanic or Latino",
            "system": "urn:oid:2.16.840.1.113883.6.238"
          }
        },
        {
          "url": "text",
          "valueString": "Not Hispanic or Latino"
        }
      ],
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity"
    },
    {
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex",
      "valueCode": "F"
    },
    {
      "url": "http://hl7.org/fhir/StructureDefinition/patient-birthPlace",
      "valueAddress": {
        "city": "Stratford",
        "country": "US",
        "state": "Connecticut"
      }
    },
    {
      "url": "http://synthetichealth.github.io/synthea/disability-adjusted-life-years",
      "valueDecimal": 11.383877891919683
    },
    {
      "url": "http://synthetichealth.github.io/synthea/quality-adjusted-life-years",
      "valueDecimal": 25.61612210808032
    }
  ],
  "gender": "female",
  "id": "patient1001",
  "identifier": [
    {
      "system": "https://sources.aetna.com/patient/identifier/memberid/81",
      "type": {
        "coding": [
          {
            "code": "MB",
            "display": "Member Number",
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203"
          }
        ]
      },
      "value": "3200000000B8"
    },
\t{
                  "system" : "http://example.com/identifiers/patient",
                  "value" : "1001"
    }
  ],
  "language": "en",
  "maritalStatus": {
    "coding": [
      {
        "code": "S",
        "display": "S",
        "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus"
      }
    ]
  },
  "meta": {
    "lastUpdated": "2022-08-19T18:45:32.471379+00:00",
    "profile": [
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
      "http://hl7.org/fhir/us/carin-bb/StructureDefinition/C4BB-Patient"
    ],
    "source": "gs://usmedpent-eds-qastg-imi/success/data/20220422/patient_20220422031840.txt",
    "versionId": "MTY2MDkzNDczMjQ3MTM3OTAwMA"
  },
  "multipleBirthBoolean": false,
  "name": [
    {
      "family": "Reyes",
      "given": [
        "Paula"
      ],
      "text": "Paula Reyes",
      "use": "official"
    }
  ],
  "resourceType": "Patient",
  "telecom": [
    {
      "rank": 1,
      "system": "phone",
      "use": "home",
      "value": "555-338-2929"
    },
    {
      "rank": 2,
      "system": "email",
      "use": "work",
      "value": "paula_reyes@test.com"
    }
  ]
}
          },
          {
            "fullUrl" : "http://example.org/fhir/Coverage/coverage1001",
            "resource" : {
              "resourceType" : "Coverage",
              "id" : "coverage1001",
              "meta" : {
                "profile" : [
                  "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-coverage"
                ]
              },
              "extension" : [
                {
                  "url" : "http://hl7.org/fhir/5.0/StructureDefinition/extension-Coverage.kind",
                  "valueCode" : "insurance"
                }
              ],
              "status" : "active",
              "subscriberId" : "PFP123450000",
              "beneficiary" : {
                "reference" : "Patient/patient1001"
              },
              "relationship" : {
                "coding" : [
                  {
                    "system" : "http://terminology.hl7.org/CodeSystem/subscriber-relationship",
                    "code" : "self",
                    "display" : "Self"
                  }
                ]
              },
              "period" : {
                "start" : "2021-01-01",
                "end" : "2022-01-01"
              },
              "payor" : [
                {
                 "reference" : "Organization/org1001"
                }
              ],
              "class" : [
                {
                  "type" : {
                    "coding" : [
                      {
                        "system" : "http://terminology.hl7.org/CodeSystem/coverage-class",
                        "code" : "plan",
                        "display" : "Plan"
                      }
                    ]
                  },
                  "value" : "Premim Family Plus",
                  "name" : "Premim Family Plus Plan"
                }
              ],
              "costToBeneficiary" : [
                {
                  "type" : {
                    "coding" : [
                      {
                        "system" : "http://terminology.hl7.org/CodeSystem/coverage-copay-type",
                        "code" : "copaypct",
                        "display" : "Copay Percentage"
                      }
                    ]
                  },
                  "valueQuantity" : {
                    "value" : 20
                  }
                }
              ]
            }
          },
          {
            "fullUrl" : "http://example.org/fhir/Organization/org1001",
            "resource" : {
              "resourceType" : "Organization",
              "id" : "org1001",
              "meta" : {
                "profile" : [
                  "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization"
                ]
              },
              "identifier" : [
                {
                  "type" : {
                    "coding" : [
                      {
                        "system" : "http://terminology.hl7.org/CodeSystem/v2-0203",
                        "code" : "ETIN"
                      }
                    ]
                  },
                  "value" : "ETIN-3200002"
                }
              ],
              "active" : true,
              "type" : [
                {
                  "coding" : [
                    {
                      "system" : "http://terminology.hl7.org/CodeSystem/organization-type",
                      "code" : "pay",
                      "display" : "Payer"
                    }
                  ]
                }
              ],
              "name" : "Aetna",
              "telecom" : [
                {
                  "system" : "phone",
                  "value" : "860-547-5001",
                  "use" : "work"
                }
              ],
              "address" : [
                {
                  "line" : [
                    "680 Asylum Street"
                  ],
                  "city" : "Hartford",
                  "state" : "CT",
                  "postalCode" : "06155",
                  "country" : "US"
                }
              ]
            }
          },
          {
            "id" : "PCT-DeviceRequest-1",
            "fullUrl" : "http://example.org/fhir/DeviceRequest/PCT-DeviceRequest-1",
            "resource" : {
              "resourceType" : "DeviceRequest",
              "id" : "PCT-DeviceRequest-1",
              "meta" : {
                "profile" : [
                  "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-devicerequest"
                ]
              },
              "status" : "active",
              "intent" : "proposal",
              "codeCodeableConcept" : {
                "coding" : [
                  {
                    "system" : "http://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets",
                    "code" : "L1820",
                    "display" : "KNEE ORTHOSIS, ELASTIC WITH CONDYLAR PADS AND JOINTS, WITH OR WITHOUT PATELLAR CONTROL, PREFABRICATED, INCLUDES FITTING AND ADJUSTMENT"
                  }
                ]
              },
              "subject" : {
                "reference" : "Patient/patient1001"
              }
            }
          }
        ]
      }
    }
  ]
}`

    if (payerServer && (payerServer.includes('vteapif1'))) {
      return JSON.parse(corrected);
    }
    return JSON.parse(base64BinaryDecoded);
  } catch (e) {
    console.error('Failed to decode or parse AEOB packet.', e);
    return { error: 'Failed to decode or parse AEOB packet.' };
  }
};

export default function AEOBPanel({ selectedButton }) {
  const [rows, setRows] = useState(undefined);
  const [requestDate, setRequestDate] = useState('');
  const [encounterDate, setEncounterDate] = useState('');
  const { payerServer, requester } = useContext(AppContext);
  const [selectedRow, setSelectedRow] = useState(null);
  const [aeobPacket, setAeobPacket] = useState(null);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonDialogData, setJsonDialogData] = useState(null);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  useEffect(() => {
    // Search when requester changes AND user is in 'My AEOBs' panel
    if (selectedButton === 'aeobs' && requester) {
      handleClearFields();
      handleSearch(true);
    }
  }, [requester]);

  const handleFhirResourceClick = async (row) => {
    const packet = await fetchAeobPacket(row, payerServer);
    setJsonDialogData(packet);
    setJsonDialogOpen(true);
  };

  const handleSearch = async (isDefaultSearch = false) => {
    // For search, require at least one date
    if (!isDefaultSearch && !requestDate && !encounterDate) {
      alert('Please enter Request/Encounter Date to search.');
      return;
    }
    let params = {};
    params = { type: 'aeob-packet' };
    if (requestDate) params['estimate-initiation-time'] = requestDate;
    if (encounterDate) {
      // Dates within the period, including the start and end, should match.
      params['planned-period'] = [`le${encounterDate}`, `ge${encounterDate}`];
    }
    // Hack to send author param (requester) only for specific payers localhost/pct-payer, as the search param may not be supported by all servers.
    // TODO use servers capability statement to determine which search param is supported
    if (payerServer && (payerServer.includes('localhost') || payerServer.includes('pct-payer')) && requester) {
      params['author'] = requester;
    }

    try {
      const response = await searchDocumentReference(payerServer, params, "payer");
      if (response.status === 401) {
        alert('Your token is expired or invalid. Please update your auth token in Settings.');
        return;
      }
      const data = await response.json();
      // Map DocumentReference resources to table rows
      const newRows = (data.entry || [])
        .map((entry, idx) => {
          const doc = entry.resource;
          let encounterPeriod = '';
          const gfeExt = doc.extension?.find(
            ext => ext.url === 'http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeServiceLinkingInfo'
          );
          const plannedPeriodExt = gfeExt?.extension?.find(
            ext => ext.url === 'plannedPeriodOfService'
          );
          // Check for valuePeriod or valueDate
          if (plannedPeriodExt?.valuePeriod) {
            const period = plannedPeriodExt.valuePeriod;
            encounterPeriod = `${formatDate(period.start) || ''} - ${formatDate(period.end) || ''}`;
          } else if (plannedPeriodExt?.valueDate) {
            encounterPeriod = formatDate(plannedPeriodExt.valueDate);
          }
          return {
            id: doc.id || idx,
            dateOfRequest: (() => {
              const ext = doc.extension?.find(
                ext => ext.url === 'http://hl7.org/fhir/us/davinci-pct/StructureDefinition/requestInitiationTime'
              );
              const instant = ext?.valueInstant || '';
              return instant ? instant.split('T')[0] : '';
            })(),
            patient: doc?.subject?.reference || '',
            encounterPeriod,
            serviceRequested: (() => {
              const exts = doc.extension?.filter(
                ext => ext.url === 'http://hl7.org/fhir/us/davinci-pct/StructureDefinition/estimateProcedureOrService'
              ) || [];
              const displays = exts.flatMap(ext =>
                ext.valueCodeableConcept?.coding?.map(c => c.display).filter(Boolean) || []
              );
              return displays.join(', ');
            })(),
            condition: (() => {
              const ext = doc.extension?.find(
                ext => ext.url === 'http://hl7.org/fhir/us/davinci-pct/StructureDefinition/estimateCondition'
              );
              return ext?.valueCodeableConcept?.coding?.[0]?.display || '';
            })(),
            fhirJson: doc,
            onFhirResourceClick: () => handleFhirResourceClick({ fhirJson: doc })
          };
        })
      setRows(newRows);
    } catch (err) {
      setRows([]);
      alert('Error fetching AEOBs')
      console.log("Error fetching AEOBs:", err);
    }
  };

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
    fetchAeobPacket(params.row, payerServer).then(packet => setAeobPacket(packet));
  };

  const handleCloseDetailsDialog = () => {
    setSelectedRow(null);
    setAeobPacket(null);
  };

  const handleCloseJsonDialog = () => {
    setJsonDialogOpen(false);
    setJsonDialogData(null);
  };

  const handleClearFields = () => {
    setRequestDate('');
    setEncounterDate('');
    setRows([]);
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ color: '#333', fontWeight: 500, fontSize: '1.25rem', margin: 0 }}>
            My AEOBs
          </h2>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ verticalAlign: 'middle', mr: 1 }} style={{ fontSize: '1.15em' }} />
            <span style={{ fontWeight: 400, fontSize: '1rem', marginRight: 6 }}>Author:</span>
            <span style={{ fontSize: '1rem' }}>{requester || "No requester selected"}</span>
          </span>
        </div>
      </Grid>
      <Grid size={12} sx={{ marginBottom: 2 }}>
        <div className="date-filters">
          <div className="filter-row">
            <label className="filter-label" htmlFor="request-date">Request Date:</label>
            <input
              id="request-date"
              type="date"
              className="date-input"
              value={requestDate}
              onChange={e => setRequestDate(e.target.value)}
            />
          </div>
          <div className="filter-row">
            <label className="filter-label" htmlFor="encounter-date">Encounter Date:</label>
            <input
              id="encounter-date"
              type="date"
              className="date-input"
              value={encounterDate}
              onChange={e => setEncounterDate(e.target.value)}
            />
            <button
              className="search-button"
              onClick={e => { e.preventDefault(); handleSearch(); }}
            >
              Search
            </button>
            <button
              className="search-button"
              style={{ marginLeft: 8 }}
              onClick={e => { e.preventDefault(); handleClearFields(); }}
            >
              Clear
            </button>
          </div>
        </div>
      </Grid>
      <Grid size={12}>
        <DataGrid
          rows={rows}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          autoHeight={true}
          onRowClick={handleRowClick}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f7fa',
              color: '#556cd6',
              fontWeight: 700,
              fontSize: '1.08rem',
              borderBottom: '2px solid #e2e8f0',
              letterSpacing: '0.03em',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.97rem',
            },
          }}
        />
      </Grid>
      <Dialog
        open={!!selectedRow}
        onClose={handleCloseDetailsDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          AEOB Details
          <IconButton
            aria-label="close"
            onClick={handleCloseDetailsDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {aeobPacket && <AEOBBundle data={aeobPacket} showRawJsonButton={false} />}
          {aeobPacket?.error && <div>{aeobPacket.error}</div>}
        </DialogContent>
      </Dialog>
      <Dialog
        open={jsonDialogOpen}
        onClose={handleCloseJsonDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          AEOB Packet JSON
          <IconButton
            aria-label="close"
            onClick={handleCloseJsonDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {jsonDialogData?.error && <div>{jsonDialogData.error}</div>}
          {jsonDialogData && !jsonDialogData.error && (
            Array.isArray(jsonDialogData) && jsonDialogData.length === 0 ? (
              <div>AEOB packet is empty.</div>
            ) : (
              <Editor
                height="75vh"
                width="100%"
                defaultLanguage="json"
                value={JSON.stringify(jsonDialogData, null, 2)}
                options={{ readOnly: true, fontSize: 16 }}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  );
}