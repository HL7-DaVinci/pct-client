export const ProcedureList = [
    {
        "diagnosisCodeableConcept": {
            "coding": [
                {
                    "system": "https://terminology.hl7.org/3.1.0/ValueSet-ex-procedure-type",
                    "code": "S06.3",
                    "display": "diagnosis 2"
                }
            ]
        },
        "packageCode": {
            "coding": [
                {
                    "system": "https://terminology.hl7.org/3.1.0/ValueSet-ex-procedure-type",
                    "code": "400",
                    "display": "diagnosis 1"
                }
            ]
        }
    }
];

export const ProcedureTypeList = [
    {
        "code": "primary",
        "display": "Primary procedure"
    },
    {
        "code": "secondary",
        "display": "Secondary procedure"
    }
];