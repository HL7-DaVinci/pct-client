export const DiagnosisList = [
    {
        "diagnosisCodeableConcept": {
            "coding": [
                {
                    "system": "http://hl7.org/fhir/sid/icd-10-cm",
                    "code": "S06.3",
                    "display": "Focal traumatic brain injury"
                }
            ]
        },
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
];

export const DiagnosisTypeList = [
    {
        "code": "principal",
        "display": "Principal"
    },
    {
        "code": "admitting",
        "display": "Admitting"
    },
    {
        "code": "patientReasonForVisit",
        "display": "Reason for visit"
    },
    {
        "code": "other",
        "display": "Other"
    }
];