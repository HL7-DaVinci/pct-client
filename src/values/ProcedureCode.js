export const ProcedureCodes = [
    {
        system: "http://www.ama-assn.org/go/cpt",
        code: "70551",
        display: "Magnetic resonance (eg, proton) imaging, brain (including brain stem)", 
        serviceDescription: "Magnetic Resonance Imaging (MRI) of the brain (including brain stem)",
        unitPrice: 266.0,
        revenue: {
            code: "0611",
            display: "Magnetic Resonance Technology (MRT) - Brain/brain stem"
        }
    },
    {
        system: "http://www.ama-assn.org/go/cpt",
        code: "96413",
        display: "Injection and Intravenous Infusion Chemotherapy and Other Highly Complex Drug or Highly Complex Biologic Agent Administration",
        serviceDescription: "Chemotherapy administration, intravenous infusion technique",
        unitPrice: 181.11,
        revenue: {
            code: "0972",
            display: "Professional Fees: Radiology - diagnostic"
        }
    },
    {
        system: "http://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets",
        code: "J9312",
        display: "Injection, rituximab, 10 mg",
        serviceDescription: "Injection of 10 mg of Rituximab",
        unitPrice: 50,
        revenue: {
            code: "0260",
            display:  "IV Therapy - General"
        }
    },
    {
        system: "http://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets",
        code: "J9312",
        display: "Methotrexate sodium, 50 mg",
        serviceDescription: "Administration of 50mg of Methotrexate",
        unitPrice: 50,
        revenue: {
            code: "0261",
            display: "IV Therapy - Infusion pump"
        }
    }
];