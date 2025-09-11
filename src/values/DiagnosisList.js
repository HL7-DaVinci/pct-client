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
    },
    {
        "diagnosisCodeableConcept": {
            "coding": [
                {
                    "system": "http://hl7.org/fhir/sid/icd-10-cm",
                    "code": "I10",
                    "display": "Essential (primary) hypertension"
                }
            ]
        },
        "packageCode": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/ex-diagnosisrelatedgroup",
                    "code": "101",
                    "display": "Hypertension"
                }
            ]
        }
    },
    {
        "diagnosisCodeableConcept": {
            "coding": [
                {
                    "system": "http://hl7.org/fhir/sid/icd-10-cm",
                    "code": "E11.9",
                    "display": "Type 2 diabetes mellitus without complications"
                }
            ]
        },
        "packageCode": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/ex-diagnosisrelatedgroup",
                    "code": "200",
                    "display": "Diabetes"
                }
            ]
        }
    },
    {
        "diagnosisCodeableConcept": {
            "coding": [
                {
                    "system": "http://hl7.org/fhir/sid/icd-10-cm",
                    "code": "J45.909",
                    "display": "Unspecified asthma, uncomplicated"
                }
            ]
        },
        "packageCode": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/ex-diagnosisrelatedgroup",
                    "code": "300",
                    "display": "Asthma"
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
    },
    {
        "code": "secondary",
        "display": "Secondary"
    }
];