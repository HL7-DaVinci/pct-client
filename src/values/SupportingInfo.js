export const SupportingInfoType = [
  {
    type: "cmspos",
    display: "CMS Place Of Service",
    codeableConcept: {
      coding: [
        {
          system:
            "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTSupportingInfoType",
          code: "cmspos",
          display: "CMS Place of Service",
        },
      ],
    },
  },
  {
    type: "typeofbill",
    display: "Type of Bill",
    codeableConcept: {
      coding: [
        {
          system:
            "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTSupportingInfoType",
          code: "typeofbill",
          display: "Type of Bill",
        },
      ],
    },
  },
];
