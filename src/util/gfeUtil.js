import { v4 } from "uuid";


export const generateGFE = () => {
  return {
    careTeamList: [{ id: v4() }],
    diagnosisList: [{ id: v4() }],
    procedureList: [{ id: v4() }],
    claimItemList: [{ id: v4() }],
    selectedPriority: "",
    selectedBillingProvider: "",
    interTransIntermediary: "",
    supportingInfoTypeOfBill: "",
  };
};

export const generateNewSession = () => {
  const startingGFEId = v4();
  const initialGFEInfo = {};
  initialGFEInfo[startingGFEId] = generateGFE();
  return {
    patientList: [],
    priorityList: [],
    practitionerRoleList: [],
    practitionerList: [],
    organizationList: [],
    resolvedReferences: {},
    selectedProcedure: undefined,
    locationList: [],
    subjectInfo: {
      gfeType: "institutional",
      memberNumber: "",
      selectedAddress: "",
      birthdate: "",
      gender: "",
      telephone: "",
      selectedPatient: "",
      selectedPayor: "",
      selectedCoverage: "",
      subscriber: "",
      subscriberRelationship: "",
      coveragePlan: "",
      coveragePeriod: "",
      selectedBillingProvider: "",
    },
    gfeInfo: { ...initialGFEInfo },
    selectedGFE: startingGFEId,
  };
};