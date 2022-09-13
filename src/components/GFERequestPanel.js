import React, { Component } from "react";
import {
  Box,
  Button,
  FormLabel,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  Card,
  RadioGroup,
  Select,
  Typography,
  withStyles,
  LinearProgress,
  TextField,
  Tabs,
  Tab,
  AppBar,
} from "@material-ui/core";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import { exampleState } from "../exampleState";
import { getPatientDisplayName } from "./SelectComponents";

import {
  getPatients,
  submitGFEClaim,
  getCoverage,
  getPractitionerRoles,
  getOrganizations,
  getCoverageByPatient,
  getPractitioners,
  getLocations,
  getPatientInfo,
  getClaims,
} from "../api";

import GFERequestSummary from "./GFERequestSummary";
import buildGFEBundle from "./BuildGFEBundle";
import ViewGFERequestDialog from "./ViewGFEDialog";
import { PlaceOfServiceList } from "../values/PlaceOfService";

import CareTeam from "./CareTeam";
import ClaimItem from "./ClaimItem";
import { ProcedureCodes } from "../values/ProcedureCode";
import DiagnosisItem from "./DiagnosisItem";
import ProcedureItem from "./ProcedureItem";
import SummaryItem from "./SummaryItem";
import TotalSummaryGFEs from "./TotalSummaryGFEs";
import { SupportingInfoType } from "../values/SupportingInfo";
import { DiagnosisList, DiagnosisTypeList } from "../values/DiagnosisList";
import ViewErrorDialog from "./ViewErrorDialog";
import PropTypes from "prop-types";
import moment from "moment";
import WestIcon from "@mui/icons-material/West";
import EastIcon from "@mui/icons-material/East";
import { styles } from "../styles/GFERequestPanelStyles";
import {
  ProfessionalBillingProviderSelect,
  OrganizationSelect,
  PatientSelect,
  PrioritySelect,
} from "./SelectComponents";

import { v4 } from "uuid";
//GFE and AEOB tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

//GFE and AEOB tabs
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

//GFE and AEOB tabs
//sourced from: https://stackoverflow.com/questions/48031753/material-ui-tab-react-change-active-tab-onclick
function TabContainer(props) {
  return (
    <Typography {...props} component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

//GFE and AEOB tabs
//sourced from: https://stackoverflow.com/questions/48031753/material-ui-tab-react-change-active-tab-onclick
TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

//vertical panel tabs
function VerticalTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 6 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

//vertical panel tabs
VerticalTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const generateGFE = () => {
  return {
    careTeamList: [{ id: v4() }],
    diagnosisList: [{ id: v4() }],
    procedureList: [{ id: v4() }],
    claimItemList: [{ id: v4() }],
    selectedPriority: null,
    selectedBillingProvider: null,
    interTransIntermediary: null,
    supportingInfoTypeOfBill: "",
  };
};

class GFERequestBox extends Component {
  constructor(props) {
    super(props);
    const startingGFEId = v4();
    const initialGFEInfo = {};

    initialGFEInfo[startingGFEId] = generateGFE();
    this.initialState = {
      patientList: [],
      patientRequestList: [],
      priorityList: [],
      practitionerRoleList: [],
      selectedPractitioner: [],
      practitionerList: [],
      organizationList: [],
      selectedRequest: undefined,
      resolvedReferences: {},
      selectedProcedure: undefined,
      validationErrors: undefined,
      openErrorDialog: false,
      verticalTabIndex: 0,
      currentTabIndex: 0,
      locationList: [],
      subjectInfo: {
        gfeType: "institutional",
        memberNumber: null,
        selectedAddress: null,
        birthdate: null,
        gender: null,
        telephone: null,
        selectedPatient: null,
        selectedPayor: null,
        selectedCoverage: null,
        subscriber: null,
        subscriberRelationship: null,
        coveragePlan: null,
        coveragePeriod: null,
        selectedBillingProvider: null,
      },
      gfeInfo: { ...initialGFEInfo },
      selectedGFE: startingGFEId,
    };
    this.state = this.initialState;
    //this.state = exampleState;
  }

  handleStartDateChange = (date) => {
    this.setState({ startDate: date });
  };

  handleEndDateChange = (date) => {
    this.setState({ endDate: date });
  };

  handleAddGFE = () => {
    const gfeInfo = { ...this.state.gfeInfo };
    gfeInfo[v4()] = generateGFE();
    this.setState({ gfeInfo });
  };

  handleDeleteGFE = (id) => {
    const gfeInfo = { ...this.state.gfeInfo };
    delete gfeInfo[id];
    this.setState({ ...gfeInfo });
  };
  componentDidUpdate(prevProps, prevState) {
    if (this.props.dataServerChanged && !prevProps.dataServerChanged) {
      this.resetState();
      this.props.setDataServerChanged(false);
    }
  }

  componentDidMount() {
    const fetchProviders = async () => {
      try {
        const res = await Promise.all([
          getPractitionerRoles(this.props.ehrUrl),
          getPractitioners(this.props.ehrUrl),
          getOrganizations(this.props.ehrUrl),
        ]);
        await Promise.all(
          res.map((r) => {
            if (
              r.data &&
              r.data[0] &&
              r.data[0].resourceType === "PractitionerRole"
            ) {
              let references = Object.assign(this.state.resolvedReferences);
              for (const property in r.references) {
                if (!(property in references)) {
                  references[property] = r.references[property];
                }
              }
              this.setState({
                practitionerRoleList: r.data,
                resolvedReferences: references,
              });
              console.log("----- Finished getting practitionerRole.");
            } else if (r.resourceType && r.resourceType === "Bundle") {
              // handle practitioner and organization
              if (r.link && r.link[0] && r.link[0].relation === "self") {
                const urlParts = r.link[0].url.split("/");
                const type = urlParts[urlParts.length - 1];
                switch (type) {
                  case "Practitioner":
                    this.setState({
                      practitionerList: r.entry,
                    });
                    console.log("----- Finished getting practitioner.");
                    break;
                  case "Organization":
                    this.setState({
                      organizationList: r.entry,
                    });
                    console.log("----- Finished getting organization.");
                    break;
                  default:
                    break;
                }
              }
            }
          })
        );
      } catch (e) {
        console.error(
          "Failed to retrieve the data from provider data store! Check the connections! Exception",
          e
        );
      }
    };
    fetchProviders();
    console.log("--- after fetching provider ");
  }

  resetState = () => {
    this.setState({
      ...this.initialState,
    });
  };

  handleOpenPatients = () => {
    getPatients(this.props.ehrUrl).then((result) => {
      const patients = result.entry;
      this.setState({ ...this.state, patientList: patients });
    });
  };

  handleOpenPriority = () => {
    getClaims(this.props.ehrUrl).then((result) => {
      const priority = result.entry;

      this.setState({ ...this.state, priorityList: priority });
    });
  };

  //when select the patient, changes fields within the form specific
  handleSelectPatient = (e) => {
    const patientId = e.target.value;

    // retrieve coverage and payer info about patient
    //adding other patient info here too
    getCoverageByPatient(this.props.ehrUrl, patientId).then((result) => {
      const subscriberText = result.data[0].subscriberId;
      const relationshipText = result.data[0].relationship.coding[0].display;
      const planName = result.data[0].class[0].name;
      const coveragePeriodTextStart = result.data[0].period.start;
      const coveragePeriodTextEnd = result.data[0].period.end;

      const coveragePeriod =
        coveragePeriodTextStart + " to " + coveragePeriodTextEnd;
      if (result.data && result.data.length > 0) {
        getCoverage(this.props.ehrUrl, result.data[0].id).then(
          (coverageResult) => {
            const reference = Object.keys(coverageResult.references)[0];
            const resource = coverageResult.references[reference];

            let subjectInfo = {
              ...this.state.subjectInfo,
              selectedPatient: patientId,
              selectedPayor: resource,
              selectedCoverage: coverageResult.data,
              subscriber: subscriberText,
              subscriberRelationship: relationshipText,
              coveragePlan: planName,
              coveragePeriod: coveragePeriod,
            };
            this.setState({ subjectInfo });
          }
        );
      } else {
        let subjectInfo = {
          ...this.state.subjectInfo,
          selectedPatient: patientId,
          selectedPayor: undefined,
          selectedCoverage: undefined,
          subscriber: undefined,
          subscriberRelationship: undefined,
          coveragePlan: undefined,
          coveragePeriod: undefined,
        };
        this.setState({ subjectInfo });
        console.log("couldn't retrieve patient's coverage and payor info");
      }
    });

    getPatientInfo(this.props.ehrUrl, patientId).then((result) => {
      const addressText = result[0].address[0].text;
      const birthdateText = result[0].birthDate;
      const genderText = result[0].gender;
      const telephoneText =
        result[0].telecom !== undefined ? result[0].telecom[0].value : null;
      let memberNumber;
      //ensure correct id for member
      if (
        result[0].identifier !== undefined &&
        result[0].identifier.length > 0 &&
        result[0].identifier[0].type !== undefined
      ) {
        for (var i = 0; i < result[0].identifier.length; i++) {
          for (var j = 0; j < result[0].identifier[i].type.coding.length; j++) {
            if (result[0].identifier[i].type.coding[j].code === "MB") {
              memberNumber = result[0].identifier[0].value;
            }
          }
        }
      }
      let patientName = "";
      for (let i = 0; i < this.state.patientList.length; i++) {
        if (patientId === this.state.patientList[i].resource.id) {
          if (this.state.patientList[i].resource.name[0].text) {
            patientName = this.state.patientList[i].resource.name[0].text;
          } else
            patientName = `${this.state.patientList[i].resource.name[0].given[0]} ${this.state.patientList[i].resource.name[0].family}`;
        }
      }
      if (addressText && addressText.length > 0) {
        let subjectInfo = {
          ...this.state.subjectInfo,
          selectedAddress: addressText,
          birthdate: birthdateText,
          gender: genderText,
          telephone: telephoneText,
          selectedPatientName: patientName,
          memberNumber,
        };
        this.setState({ subjectInfo });
      } else {
        let subjectInfo = {
          ...this.state.subjectInfo,
          selectedAddress: undefined,
          birthdate: undefined,
          gender: undefined,
          telephone: undefined,
          selectedPatientName: undefined,
          memberNumber,
        };
        this.setState({ subjectInfo });
        console.log("couldn't retrieve patient's personal info");
      }
    });
    this.setState({
      selectedProcedure: undefined,
      selectedRequest: undefined,
      patientSelected: true,
    });
  };

  handleSelectPriority = (e) => {
    const priorityLevel = e.target.value;
    const gfeInfo = { ...this.state.gfeInfo };
    gfeInfo[this.state.selectedGFE].selectedPriority =
      JSON.parse(priorityLevel);
    this.setState({ gfeInfo });
  };

  handleSelectBillingProvider = (e) => {
    const gfeInfo = { ...this.state.gfeInfo };
    gfeInfo[this.state.selectedGFE].selectedBillingProvider = e.target.value;

    const allBillingProviders = this.getProfessionalBillingProviderList();

    //set name of provider to display name instead of code in summary tab
    for (let i = 0; i < allBillingProviders.length; i++) {
      if (e.target.value === allBillingProviders[i].id) {
        gfeInfo[this.state.selectedGFE].selectedBillingProviderName =
          allBillingProviders[i].display;
      }
    }
    this.setState({
      gfeInfo,
    });
  };

  handleSelectPractitioner = (e) => {
    this.setState({
      selectedPractitioner: e.target.value,
    });
  };

  handleOpenOrganizationList = (e) => {
    getOrganizations(this.props.ehrUrl).then((result) => {
      this.setState({
        ...this.state,
        organizationList: result.entry,
      });
    });

    getLocations(this.props.ehrUrl).then((result) =>
      this.setState({ locationList: result.entry })
    );
  };

  handleSelectSubmitter = (e) => {
    const allSubmittersList = this.getProfessionalBillingProviderList();
    let selectedSubmittingProviderName = "";
    //set name of provider to display name instead of code in summary tab
    for (let i = 0; i < allSubmittersList.length; i++) {
      if (e.target.value === allSubmittersList[i].resource.id) {
        selectedSubmittingProviderName = allSubmittersList[i].display;
      }
    }
    this.setState({
      subjectInfo: {
        ...this.state.subjectInfo,
        selectedSubmitter: e.target.value,
        selectedSubmittingProviderName,
      },
    });
  };

  getRequestRelatedInfo = (requestId) => {
    if (!requestId) {
      return {};
    }
    if (requestId) {
      const request = this.state.patientRequestList.filter(
        (request) => request.id === requestId
      )[0];
      if (request === undefined) {
        return {};
      }

      let requestCode;
      if (request.resourceType === "DeviceRequest") {
        const coding = request.codeCodeableConcept.coding[0];
        const codeSystem = coding.system
          .slice(coding.system.lastIndexOf("/") + 1)
          .toUpperCase();
        requestCode = `${codeSystem} ${coding.code} ${coding.display}`;
      }

      let coverage = undefined;
      let practitioner = undefined;
      if (request.resourceType === "DeviceRequest") {
        coverage =
          request.insurance !== undefined
            ? this.state.resolvedReferences[request.insurance[0].reference]
            : undefined;
        practitioner =
          this.state.resolvedReferences[request.performer.reference];
      }
      return {
        request,
        requestCode,
        coverage,
        practitioner,
      };
    }
  };

  getClaimDetails = () => {
    //Currently, selectedRequest will always be undefined
    if (this.state.selectedRequest) {
      return this.getRequestRelatedInfo(this.state.selectedRequest);
      //Currently, selectedProcedure will always be undefined
    } else if (this.state.selectedProcedure) {
      let code = {
        coding: [
          {
            system: "http://www.ama-assn.org/go/cpt",
            code: this.state.selectedProcedure,
          },
        ],
      };
      return {
        request: this.state.selectedProcedure,
        requestCode: code,
        coverage: this.state.subjectInfo.selectedCoverage,
        practitioner: this.state.selectedPractitioner,
      };
      //Only valid branch right now
    } else {
      return {
        coverage: this.state.subjectInfo.selectedCoverage,
      };
    }
  };
  generateRequestInput = (gfeId) => {
    let input = {
      bundleResources: [],
    };

    if (
      this.state.subjectInfo.selectedPatient === undefined &&
      this.state.selectedRequest === undefined
    ) {
      return input;
    }

    let orgReferenceList = [];
    input.gfeType = this.state.subjectInfo.gfeType;

    const fhirServerBaseUrl = this.props.ehrUrl;

    input.patient = {
      reference: `Patient/${this.state.subjectInfo.selectedPatient}`,
      resource: this.state.patientList.filter(
        (patient) =>
          patient.resource.id === this.state.subjectInfo.selectedPatient
      )[0].resource,
    };

    input.bundleResources.push({
      fullUrl: `${fhirServerBaseUrl}/${input.patient.reference}`,
      entry: input.patient.resource,
    });

    const { request, coverage } = this.getClaimDetails();

    input.request = {
      //request will always be undefined
      resource: request,
      coverage: {
        reference: `Coverage/${coverage.id}`,
        resource: coverage,
      },
    };

    input.bundleResources.push({
      fullUrl: `${fhirServerBaseUrl}/${input.request.coverage.reference}`,
      entry: input.request.coverage.resource,
    });

    let insurerOrgRef = `Organization/${this.state.subjectInfo.selectedPayor.id}`;
    input.insurer = {
      reference: insurerOrgRef,
      resource: this.state.subjectInfo.selectedPayor,
    };

    orgReferenceList.push(insurerOrgRef);
    input.bundleResources.push({
      fullUrl: `${fhirServerBaseUrl}/${input.insurer.reference}`,
      entry: input.insurer.resource,
    });

    let providerReference = undefined,
      findProfessionalProvider = undefined;
    if (this.state.subjectInfo.gfeType === "professional") {
      const professionalProviderList =
        this.getProfessionalBillingProviderList();
      findProfessionalProvider = professionalProviderList.find(
        (provider) =>
          provider.id === this.state.gfeInfo[gfeId].selectedBillingProvider
      );
      providerReference = findProfessionalProvider.reference;
    } else {
      providerReference = `Organization/${this.state.gfeInfo[gfeId].selectedBillingProvider}`;
    }

    input.provider = {
      reference: providerReference,
      resource:
        this.state.subjectInfo.gfeType === "professional"
          ? findProfessionalProvider.resource
          : this.state.organizationList.find(
              (org) =>
                org.resource.id ===
                this.state.gfeInfo[gfeId].selectedBillingProvider
            ).resource,
    };
    if (this.state.subjectInfo.gfeType === "institutional") {
      orgReferenceList.push(providerReference);
    } else if (findProfessionalProvider.type === "Organization") {
      orgReferenceList.push(providerReference);
    }

    input.bundleResources.push({
      fullUrl: `${fhirServerBaseUrl}/${input.provider.reference}`,
      entry: input.provider.resource,
    });

    input.billing = {};
    if (this.state.gfeInfo[gfeId].interTransIntermediary) {
      input.billing.interTransIntermediary =
        this.state.gfeInfo[gfeId].interTransIntermediary;
    }

    input.billing.gfeAssignedServiceId = gfeId;

    input.billing.items = [];
    let sequenceCount = 1;
    let totalAmount = 0;

    this.state.gfeInfo[gfeId].claimItemList.forEach((claimItem) => {
      const procedureCodingOrig = ProcedureCodes.find((code) =>
        claimItem.productOrService.startsWith(code.code)
      );
      let procedureCoding = Object.assign({}, procedureCodingOrig);
      delete procedureCoding["unitPrice"];
      delete procedureCoding["revenue"];

      const pos = PlaceOfServiceList.find(
        (pos) => pos.display === claimItem.placeOfService
      );

      let newItem = {
        sequence: sequenceCount++,
        revenue: {
          coding: [
            {
              system: "https://www.nubc.org/CodeSystem/RevenueCodes",
              code: procedureCodingOrig.revenue.code,
            },
          ],
        },
        productOrService: {
          coding: [procedureCoding],
        },

        unitPrice: {
          value: claimItem.unitPrice,
          currency: "USD",
        },
        quantity: {
          value: claimItem.quantity,
        },
        net: {
          value: claimItem.unitPrice * claimItem.quantity,
          currency: "USD",
        },
      };

      newItem.extension = [];
      if (claimItem.estimatedDateOfService) {
        const estimateDate = new Date(
          Date.parse(claimItem.estimatedDateOfService.toString())
        );
        const month = estimateDate.getMonth() + 1;
        const monthString = month < 10 ? "0" + month : month;
        const dateString =
          estimateDate.getDate() < 10
            ? "0" + estimateDate.getDate()
            : estimateDate.getDate();
        newItem.extension.push({
          url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/estimatedDateOfService",
          valueDate:
            estimateDate.getFullYear() + "-" + monthString + "-" + dateString,
        });
      }

      if (pos) {
        newItem.locationCodeableConcept = {
          coding: [pos],
        };
      }
      input.billing.items.push(newItem);

      totalAmount += claimItem.unitPrice * claimItem.quantity;
    });
    input.billing.total = totalAmount;

    input.diagnosis = [];
    let diagnosisSequence = 1;
    this.state.gfeInfo[gfeId].diagnosisList.forEach((diagnosis) => {
      const diagnosisCode = DiagnosisList.find((code) =>
        diagnosis.diagnosis.startsWith(
          code.diagnosisCodeableConcept.coding[0].code
        )
      );
      input.diagnosis.push({
        sequence: diagnosisSequence++,
        diagnosisCodeableConcept: diagnosisCode.diagnosisCodeableConcept,
        type: [
          {
            coding: [
              {
                code: DiagnosisTypeList.find(
                  (type) => type.display === diagnosis.type
                ).code,
                system:
                  "http://terminology.hl7.org/CodeSystem/ex-diagnosistype",
              },
            ],
          },
        ],
        packageCode: diagnosisCode.packageCode,
      });
    });

    // supportingInfo
    if (this.state.gfeInfo[gfeId].supportingInfoTypeOfBill) {
      input.supportingInfo = [];
      let supportingInfoSequence = 1;

      const categoryCodeableConcept = (inputType) =>
        SupportingInfoType.find((type) => type.type === inputType);

      if (this.state.gfeInfo[gfeId].supportingInfoTypeOfBill) {
        input.supportingInfo.push({
          sequence: supportingInfoSequence++,
          category: categoryCodeableConcept("typeofbill").codeableConcept,
          code: {
            coding: [
              {
                system: "https://www.nubc.org/CodeSystem/TypeOfBill",
                code: this.state.gfeInfo[gfeId].supportingInfoTypeOfBill,
                display: "Type of Bill",
              },
            ],
          },
        });
      }
    }

    let submitterOrgReference = `Organization/${this.state.subjectInfo.selectedSubmitter}`;
    input.submitter = {
      reference: submitterOrgReference,
      resource: this.state.organizationList.filter(
        (org) => org.resource.id === this.state.subjectInfo.selectedSubmitter
      )[0].resource, //undefined resource?
    };
    orgReferenceList.push(submitterOrgReference);

    input.bundleResources.push({
      fullUrl: `${fhirServerBaseUrl}/${input.submitter.reference}`,
      entry: input.submitter.resource,
    });

    orgReferenceList.forEach((orgRef) => {
      let foundLocation = this.state.locationList.find(
        (loc) => loc.resource.managingOrganization.reference === orgRef
      );
      if (foundLocation) {
        input.bundleResources.push({
          fullUrl: `${fhirServerBaseUrl}/${orgRef}`,
          entry: foundLocation.resource,
        });
      }
    });

    // add care team
    if (!this.itemListIsEmpty(this.state.gfeInfo[gfeId].careTeamList)) {
      input.careTeam = [];
      const providerMap = this.getCareTeamProviderListOptions();
      let sequenceNumber = 1;
      this.state.gfeInfo[gfeId].careTeamList.forEach((member) => {
        const providerResource = providerMap.find(
          (item) => item.display === member.provider
        );
        input.careTeam.push({
          sequence: sequenceNumber++,
          role: member.role.toLowerCase(),
          providerRef: {
            reference: providerResource.url,
          },
        });
        input.bundleResources.push({
          fullUrl: providerResource.url,
          entry: providerResource.resource,
        });
      });
    }

    // remove duplicate bundle resources
    let bundleResourceList = [];
    input.bundleResources.forEach((resource) => {
      if (
        !bundleResourceList.find(
          (target) => target.fullUrl === resource.fullUrl
        )
      ) {
        bundleResourceList.push(resource);
      }
    });
    input.bundleResources = bundleResourceList;

    return input;
  };

  itemListIsEmpty = (list) =>
    list.length === 0 ||
    (list.length > 0 &&
      list.every((item) => {
        const propsList = Object.getOwnPropertyNames(item);
        return propsList.length === 1 && propsList[0] === "id";
      }));

  handleOnSubmit = (e) => {
    e.preventDefault();
    this.setState({
      openErrorDialog: false,
      validationErrors: undefined,
    });
    //const { valid, error } = this.isRequestValid();
    const error = [];
    const valid = true;

    if (valid) {
      this.props.setSubmitting(true);
      this.props.setGfeSubmitted(true);
      this.props.setGfeResponse(undefined);
      this.props.setReceivedAEOBResponse(undefined);

      submitGFEClaim(this.props.payorUrl, this.generateBundle())
        .then((response) => {
          this.props.setSubmitting(false);
          console.log("Payer server returned response: ", response);
          this.props.setGfeResponse(response);
          this.props.setGfeRequestSuccess(true);
          this.props.setBundleId(response.id);
          this.props.setBundleIdentifier(response.identifier.value);
          this.props.setShowResponse(true);
          this.props.setShowRequest(false);
        })
        .catch((error) => {
          this.props.setSubmitting(false);
          this.props.setGfeRequestSuccess(false);
          if ("toJSON" in error) {
            console.log(error.toJSON());
            this.props.setGfeResponse(error.toJSON());
          } else {
            this.props.setGfeResponse(error.toString());
          }
          this.props.setShowResponse(true);
          this.props.setShowRequest(false);
        });
    } else {
      this.setState({
        openErrorDialog: true,
        submissionError: error,
      });
    }
  };

  generateBundle = () => {
    const ri = Object.keys(this.state.gfeInfo).map((gfeId) =>
      this.generateRequestInput(gfeId)
    );
    const bundles = ri.map((input) => buildGFEBundle(input));
    const bundleEntries = bundles.reduce((acc, e) => {
      acc.push(...e.entry);
      return acc;
    }, []);
    const enteredIds = new Set();
    const uniqueEntries = [];
    bundleEntries.forEach((e) => {
      if (
        e.resource.resourceType === "Claim" ||
        !enteredIds.has(e.resource.id)
      ) {
        uniqueEntries.push(e);
        enteredIds.add(e.resource.id);
      }
    });
    bundles[0].entry = uniqueEntries;
    return bundles[0];
  };

  retrieveRequestSummary = () => {
    return {
      patientId: this.state.subjectInfo.selectedPatient,
      coverageId: this.state.subjectInfo.selectedCoverage
        ? this.state.subjectInfo.selectedCoverage.id
        : undefined,
      payorId: this.state.subjectInfo.selectedPayor
        ? this.state.subjectInfo.selectedPayor.id
        : undefined,
      addressId: this.state.subjectInfo.selectedAddress,
      birthdate: this.state.subjectInfo.birthdate,
      gender: this.state.subjectInfo.gender,
      telephone: this.state.subjectInfo.telephone,
      subscriberId: this.state.subjectInfo.subscriber,
      memberId: this.state.subjectInfo.memberNumber,
      subscriberRelationship: this.state.subjectInfo.subscriberRelationship,
      coveragePlan: this.state.subjectInfo.coveragePlan,
      coveragePeriod: this.state.subjectInfo.coveragePeriod,
      practitionerSelected:
        this.state.gfeInfo[this.state.selectedGFE].careTeamList,
      practitionerRoleSelected:
        this.state.gfeInfo[this.state.selectedGFE].careTeamList,
      gfeType: this.state.subjectInfo.gfeType,
      diagnosisList: this.state.gfeInfo[this.state.selectedGFE].diagnosisList,
      procedureList: this.state.gfeInfo[this.state.selectedGFE].procedureList,
      servicesList: this.state.gfeInfo[this.state.selectedGFE].claimItemList,
      priorityLevel:
        this.state.gfeInfo[this.state.selectedGFE].selectedPriority,
      submittingProvider: this.state.subjectInfo.selectedSubmitter,
      billingProvider:
        this.state.gfeInfo[this.state.selectedGFE].selectedBillingProvider,
      gfeServiceId: this.state.selectedGFE,
      billingProviderName:
        this.state.gfeInfo[this.state.selectedGFE].selectedBillingProviderName,
      submittingProviderName:
        this.state.subjectInfo.selectedSubmittingProviderName,
    };
  };

  handleSelectInterTransId = (e) => {
    const gfeInfo = { ...this.state.gfeInfo };
    gfeInfo[this.state.selectedGFE].interTransIntermediary = e.target.value;
    this.setState({ gfeInfo });
  };

  handleSupportingInfoTypeOfBill = (e) => {
    const gfeInfo = { ...this.state.gfeInfo };
    gfeInfo[this.state.selectedGFE].supportingInfoTypeOfBill = e.target.value;
    this.setState({ gfeInfo });
  };

  addOneCareTeam = (props) => {
    //checks if the required fields are not given, if not adds to missingItems list
    let missingItems = [];
    for (
      let i = 0;
      i < this.state.gfeInfo[this.state.selectedGFE].careTeamList.length;
      i++
    ) {
      let currentRow =
        this.state.gfeInfo[this.state.selectedGFE].careTeamList[i];
      for (let j = 0; j < props.length; j++) {
        if (props[j].required === true) {
          let columnName = props[j].field;
          if (currentRow[columnName] === undefined) {
            missingItems.push(columnName);
          }
        }
      }
    }

    if (missingItems.length > 0) {
      const msg = `Complete adding existing care team member before adding a new one! ${missingItems} are required fields`;
      alert(msg);
      return;
    }

    const newId = v4();
    const gfeInfo = { ...this.state.gfeInfo };
    gfeInfo[this.state.selectedGFE].careTeamList = [
      ...gfeInfo[this.state.selectedGFE].careTeamList,
      { id: newId },
    ];
    this.setState({ gfeInfo });
  };

  deleteOneCareTeam = (id) => {
    const gfeInfo = { ...this.state.gfeInfo };
    const newCareTeamList = gfeInfo[this.state.selectedGFE].careTeamList.filter(
      (item) => item.id !== id
    );
    gfeInfo[this.state.selectedGFE].careTeamList = newCareTeamList;
    this.setState({
      gfeInfo,
    });
  };

  editCareTeam = (model) => {
    let id, fieldObject, fieldName, fieldValueObject, fieldValue;
    for (let prop in model) {
      id = prop;
      fieldObject = model[id];
    }
    if (fieldObject) {
      for (let name in fieldObject) {
        fieldName = name;
      }
      fieldValueObject = fieldObject[fieldName];
    }
    if (fieldValueObject) {
      fieldValue = fieldValueObject.value;
    }
    if (id && fieldName && fieldValue) {
      const gfeInfo = { ...this.state.gfeInfo };
      gfeInfo[this.state.selectedGFE].careTeamList = gfeInfo[
        this.state.selectedGFE
      ].careTeamList.map((item) => {
        if (item.id === id) {
          item[fieldName] = fieldValue;

          return item;
        } else {
          return item;
        }
      });

      this.setState({ gfeInfo });
    }
  };

  addOneClaimItem = (props) => {
    //checks if the required fields are not given, if not adds to missingItems list
    const claimItemList =
      this.state.gfeInfo[this.state.selectedGFE].claimItemList;
    let missingItems = [];
    for (let i = 0; i < claimItemList.length; i++) {
      let currentRow = claimItemList[i];
      for (let j = 0; j < props.length; j++) {
        if (props[j].required === true) {
          let columnName = props[j].field;
          if (currentRow[columnName] === undefined) {
            missingItems.push(columnName);
          }
        }
      }
    }

    if (missingItems.length > 0) {
      const msg = `Complete adding existing claim item before adding a new one! ${missingItems} are required fields`;
      alert(msg);
      return;
    }

    const newId = v4();
    const gfeInfo = { ...this.state.gfeInfo };
    gfeInfo[this.state.selectedGFE].claimItemList = [
      ...gfeInfo[this.state.selectedGFE].claimItemList,
      { id: newId },
    ];
    this.setState({ gfeInfo });
  };

  deleteOneClaimItem = (id) => {
    const gfeInfo = { ...this.state.gfeInfo };
    gfeInfo[this.state.selectedGFE].claimItemList = gfeInfo[
      this.state.selectedGFE
    ].claimItemList.filter((item) => item.id !== id);
    this.setState({ gfeInfo });
  };

  editClaimItem = (model) => {
    let id, fieldObject, fieldName, fieldValueObject, fieldValue;
    for (let prop in model) {
      id = prop;
      fieldObject = model[id];
    }
    if (fieldObject) {
      for (let name in fieldObject) {
        fieldName = name;
      }
      fieldValueObject = fieldObject[fieldName];
    }
    if (fieldValueObject) {
      fieldValue = fieldValueObject.value;
    }
    if (id && fieldName && fieldValue) {
      let valid = true,
        errorMsg = undefined;
      switch (fieldName) {
        case "unitPrice":
          if (fieldValue < 1) {
            valid = false;
            errorMsg = "Unit Price must be greater than 1.";
          }
          break;
        case "quantity":
          if (fieldValue < 1) {
            valid = false;
            errorMsg = "Quantity must be greater than 1.";
          }
          break;
        case "estimatedDateOfService":
          const setDate = moment(fieldValue).format("YYYY-MM-DD");
          const today = new Date();
          if (today > setDate) {
            valid = false;
            errorMsg = "Estimate date must be after today.";
          }

          break;
        default:
          break;
      }

      if (valid) {
        const gfeInfo = { ...this.state.gfeInfo };
        gfeInfo[this.state.selectedGFE].claimItemList.map((item) => {
          if (item.id === id) {
            item[fieldName] = fieldValue;
            return item;
          } else {
            return item;
          }
        });
        this.setState({ gfeInfo });
      } else {
        alert("Error occurred. " + errorMsg);
      }
    }
  };

  addOneDiagnosisItem = (props) => {
    //checks if the required fields are not given, if not adds to missingItems list
    const diagnosisList = this.state.gfeInfo[this.state.selectedGFE];
    let missingItems = [];
    for (let i = 0; i < diagnosisList.length; i++) {
      let currentRow = diagnosisList[i];
      for (let j = 0; j < props.length; j++) {
        if (props[j].required === true) {
          let columnName = props[j].field;
          if (currentRow[columnName] === undefined) {
            missingItems.push(columnName);
          }
        }
      }
    }

    if (missingItems.length > 0) {
      const msg = `Complete adding existing diagnosis before adding a new one! ${missingItems} are required fields`;
      alert(msg);
      return;
    }

    const newId = v4();
    const gfeInfo = { ...this.state.gfeInfo };
    gfeInfo[this.state.selectedGFE].diagnosisList = [
      ...gfeInfo[this.state.selectedGFE].diagnosisList,
      { id: newId },
    ];
    this.setState({ gfeInfo });
  };

  deleteOneDiagnosisItem = (id) => {
    const gfeInfo = { ...this.state.gfeInfo };
    gfeInfo[this.state.selectedGFE].diagnosisList =
      this.state.diagnosisList.filter((item) => item.id !== id);
    this.setState({ gfeInfo });
  };

  editDiagnosisItem = (model) => {
    let id, fieldObject, fieldName, fieldValueObject, fieldValue;
    for (let prop in model) {
      id = prop;
      fieldObject = model[id];
    }

    if (fieldObject) {
      for (let name in fieldObject) {
        fieldName = name;
      }
      fieldValueObject = fieldObject[fieldName];
    }
    if (fieldValueObject) {
      fieldValue = fieldValueObject.value;
    }
    if (id && fieldName && fieldValue) {
      const gfeInfo = { ...this.state.gfeInfo };
      gfeInfo[this.state.selectedGFE].diagnosisList = this.state.gfeInfo[
        this.state.selectedGFE
      ].diagnosisList.map((item) => {
        if (item.id === id) {
          item[fieldName] = fieldValue;
          return item;
        } else {
          return item;
        }
      });
      this.setState({ gfeInfo });
    }
  };

  addOneProcedureItem = (props) => {
    //checks if the required fields are not given, if not adds to missingItems list
    const procedureList =
      this.state.gfeInfo[this.state.selectedGFE].procedureList;
    let missingItems = [];
    for (let i = 0; i < procedureList.length; i++) {
      let currentRow = procedureList[i];
      for (let j = 0; j < props.length; j++) {
        if (props[j].required === true) {
          let columnName = props[j].field;
          if (currentRow[columnName] === undefined) {
            missingItems.push(columnName);
          }
        }
      }
    }

    if (missingItems.length > 0) {
      const msg = `Complete adding existing procedure before adding a new one! ${missingItems} are required fields`;
      alert(msg);
      return;
    }

    const newId = v4();
    const gfeInfo = { ...this.state.gfeInfo };
    gfeInfo[this.state.selectedGFE].procedureList = [
      ...gfeInfo[this.state.selectedGFE].procedureList,
      { id: newId },
    ];
    this.setState({ gfeInfo });
  };

  deleteOneProcedureItem = (id) => {
    const gfeInfo = { ...this.state.gfeInfo };
    gfeInfo[this.state.selectedGFE].procedureList = this.state.gfeInfo[
      this.state.selectedGFE
    ].procedureList.filter((item) => item.id !== id);
    this.setState({ gfeInfo });
  };

  editProcedureItem = (model) => {
    let id, fieldObject, fieldName, fieldValueObject, fieldValue;
    for (let prop in model) {
      id = prop;
      fieldObject = model[id];
    }
    if (fieldObject) {
      for (let name in fieldObject) {
        fieldName = name;
      }
      fieldValueObject = fieldObject[fieldName];
    }
    if (fieldValueObject) {
      fieldValue = fieldValueObject.value;
    }
    if (id && fieldName && fieldValue) {
      const gfeInfo = { ...this.state.gfeInfo };
      gfeInfo[this.state.selectedGFE].procedureList = this.state.gfeInfo[
        this.state.selectedGFE
      ].procedureList.map((item) => {
        if (item.id === id) {
          item[fieldName] = fieldValue;
          return item;
        } else {
          return item;
        }
      });
      this.setState({
        gfeInfo,
      });
    }
  };

  getCareTeamProviderListOptions() {
    const fhirServerBaseUrl = this.props.ehrUrl;
    const providerMap = [];
    this.state.practitionerList.forEach((practitioner) => {
      const name = practitioner.resource.name[0];
      providerMap.push({
        type: "Practitioner",
        display: `Practitioner - ${name.given[0]} ${name.family}`,
        resource: practitioner.resource,
        url: practitioner.fullUrl,
      });
    });
    this.state.practitionerRoleList.forEach((role) => {
      const practitioner =
        this.state.resolvedReferences[role.practitioner.reference];
      const organization =
        this.state.resolvedReferences[role.organization.reference];
      const display = practitioner
        ? `${practitioner.name[0].text} from ${organization.name}`
        : "";
      providerMap.push({
        type: "PractitionerRole",
        display: `PractitionerRole - ${display}`,
        resource: role,
        url: `${fhirServerBaseUrl}/PractitionerRole/${role.id}`,
      });
    });
    this.state.organizationList.forEach((org) => {
      providerMap.push({
        type: "Organization",
        display: `Organization - ${org.resource.name}`,
        resource: org.resource,
        url: org.fullUrl,
      });
    });
    return providerMap;
  }

  getProfessionalBillingProviderList() {
    const fhirServerBaseUrl = this.props.ehrUrl;
    const providerMap = [];
    this.state.practitionerRoleList.forEach((role) => {
      const practitioner =
        this.state.resolvedReferences[role.practitioner.reference];
      const organization =
        this.state.resolvedReferences[role.organization.reference];
      const display = practitioner
        ? `${practitioner.name[0].text} from ${organization.name}`
        : "";
      providerMap.push({
        type: "PractitionerRole",
        display: `PractitionerRole - ${display}`,
        resource: role,
        reference: `PractitionerRole/${role.id}`,
        url: `${fhirServerBaseUrl}/PractitionerRole/${role.id}`,
        id: role.id,
      });
    });
    this.state.organizationList.forEach((org) => {
      providerMap.push({
        type: "Organization",
        display: `Organization - ${org.resource.name}`,
        resource: org.resource,
        reference: `Organization/${org.resource.id}`,
        url: org.fullUrl,
        id: org.resource.id,
      });
    });
    return providerMap;
  }

  handleForward() {
    this.setState({ verticalTabIndex: this.state.verticalTabIndex + 1 });
  }
  handleBackward() {
    this.setState({ verticalTabIndex: this.state.verticalTabIndex - 1 });
  }

  handleVerticalChange = (event, value) => {
    this.setState({ verticalTabIndex: value });
  };

  render() {
    const summary = this.retrieveRequestSummary();
    const providerMap = this.getCareTeamProviderListOptions();
    const providerListOptions = providerMap.map((provider) => provider.display);
    const professionalBillingProviderList =
      this.getProfessionalBillingProviderList();
    const { classes } = this.props;
    const { currentTabIndex, verticalTabIndex } = this.state;
    return (
      <div>
        <Grid container space={0} justifyContent="center">
          {" "}
          {/* container size is adjusted here for main screen */}
          <AppBar position="static">
            <Tabs
              value={currentTabIndex}
              indicatorColor="secondary"
              textColor="inherit"
              variant="fullWidth"
            >
              <Tab label="Good Faith Estimate" {...a11yProps(0)} />
              <Tab label="Advanced Explanation of Benefits" {...a11yProps(1)} />
            </Tabs>
            {this.state.verticalTabIndex > 0 && (
              <Tabs
                value={this.state.verticalTabIndex - 1}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
              >
                <Tab
                  label="Care Team"
                  onClick={() => this.handleVerticalChange(null, 1)}
                />
                <Tab
                  label="Encounter"
                  onClick={() => this.handleVerticalChange(null, 2)}
                />
                <Tab
                  label="Summary"
                  onClick={() => this.handleVerticalChange(null, 3)}
                />
              </Tabs>
            )}
          </AppBar>
          <form onSubmit={this.handleOnSubmit}>
            <Box index={currentTabIndex}>
              {/* TODO: adding additional gfe screens with dynamically changing tabs */}
              {/* first tab at the top(GFE) */}
              <TabPanel
                value={currentTabIndex}
                index={0}
                className={classes.tabBackground}
              >
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    width: "100vw",
                    height: "100vh",
                  }}
                >
                  <Box
                    sx={{
                      flexDirection: "column",
                      justifyContent: "spaceBetween",
                    }}
                  >
                    <List dense={true}>
                      <ListSubheader>Subject</ListSubheader>
                      <ListItem>
                        <ListItemButton
                          onClick={() => this.handleVerticalChange(null, 0)}
                          selected={this.state.verticalTabIndex === 0}
                        >
                          <ListItemText>
                            {this.state.subjectInfo.selectedPatientName ||
                              "Select Patient"}
                          </ListItemText>
                        </ListItemButton>
                      </ListItem>
                      <ListSubheader>GFEs</ListSubheader>
                      {Object.keys(this.state.gfeInfo).map((id, index) => {
                        return (
                          <>
                            <ListItem>
                              <ListItemButton
                                onClick={() => {
                                  let newVti = this.state.verticalTabIndex;
                                  if (this.state.verticalTabIndex === 0) {
                                    newVti = 1;
                                  }
                                  this.setState({
                                    selectedGFE: id,
                                    verticalTabIndex: newVti,
                                  });
                                }}
                                selected={
                                  this.state.verticalTabIndex > 0 &&
                                  this.state.selectedGFE === id
                                }
                              >
                                <ListItemText>{`GFE ${
                                  index + 1
                                }`}</ListItemText>
                              </ListItemButton>
                            </ListItem>
                          </>
                        );
                      })}
                      <ListItem>
                        <ListItemButton onClick={this.handleAddGFE}>
                          <ListItemText>Create New GFE</ListItemText>
                        </ListItemButton>
                      </ListItem>
                    </List>
                    <List>
                      <ListItem
                        onClick={() => this.handleVerticalChange(null, 4)}
                      >
                        <Button variant="contained">Total Summary</Button>
                      </ListItem>
                      <ListItem>
                        <Button onClick={this.handleOnSubmit}>
                          Submit Request
                        </Button>
                      </ListItem>
                    </List>
                  </Box>

                  {/* Patient tab */}
                  <TabPanel value={verticalTabIndex} index={0}>
                    <Grid item>
                      <Grid container direction="column">
                        <Grid item className={classes.paper}>
                          <FormControl>
                            <FormLabel className={classes.inputBox}>
                              Patient *
                            </FormLabel>
                            {PatientSelect(
                              this.state.patientList,
                              this.state.subjectInfo.selectedPatient,
                              this.handleOpenPatients,
                              this.handleSelectPatient
                            )}
                          </FormControl>
                        </Grid>
                        <Grid item className={classes.paper}>
                          <FormControl>
                            <Grid>
                              <Box>
                                <b>
                                  <Typography variant="subtitle1">
                                    GFE Type:
                                  </Typography>
                                </b>
                              </Box>
                            </Grid>

                            <RadioGroup
                              row
                              aria-label="GFE Type"
                              name="row-radio-buttons-group"
                              value={this.state.subjectInfo.gfeType}
                              onChange={(e) => {
                                const subjectInfo = {
                                  ...this.state.subjectInfo,
                                };
                                subjectInfo["gfeType"] = e.target.value;
                                this.setState({ subjectInfo });
                              }}
                              defaultValue={this.state.subjectInfo.gfeType}
                            >
                              <FormControlLabel
                                value="institutional"
                                control={<Radio size="small" />}
                                label="Institutional"
                              />
                              <FormControlLabel
                                value="professional"
                                control={<Radio size="small" />}
                                label="Professional"
                              />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                        <Grid item className={classes.paper}>
                          <FormControl>
                            <Grid item>
                              <Box sx={{ mb: 1 }}>
                                <b>
                                  <Typography variant="subtitle1">
                                    Submitting Provider*:
                                  </Typography>
                                </b>
                              </Box>
                            </Grid>
                            {this.state.subjectInfo.gfeType === "professional"
                              ? ProfessionalBillingProviderSelect(
                                  professionalBillingProviderList,
                                  this.state.subjectInfo.selectedSubmitter,
                                  this.handleSelectSubmitter,
                                  "submittingProvider"
                                )
                              : OrganizationSelect(
                                  this.state.organizationList,
                                  this.state.subjectInfo.selectedSubmitter,
                                  "submitting-provider-label",
                                  "submittingProvider",
                                  this.handleOpenOrganizationList,
                                  this.handleSelectSubmitter,
                                  "submitting"
                                )}
                          </FormControl>
                        </Grid>
                        <Grid item className={classes.patientBox}>
                          <GFERequestSummary summary={summary} />
                        </Grid>
                      </Grid>
                    </Grid>
                    <br></br>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={4}></Grid>
                      <Grid item xs={4}>
                        <Button
                          variant="contained"
                          endIcon={<EastIcon />}
                          color="primary"
                          onClick={() => {
                            this.handleForward();
                          }}
                        >
                          Next
                        </Button>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* Care Team tab */}
                  <TabPanel value={verticalTabIndex} index={1}>
                    <Grid item>
                      <Card variant="outlined" className={classes.cardCareTeam}>
                        <Grid container direction="column">
                          <Grid item className={classes.paper}>
                            <FormControl>
                              <Grid item>
                                <Box sx={{ mb: 1 }}>
                                  <b>
                                    <Typography variant="subtitle1">
                                      Billing Provider*:
                                    </Typography>
                                  </b>
                                </Box>
                              </Grid>

                              {this.state.subjectInfo.gfeType === "professional"
                                ? ProfessionalBillingProviderSelect(
                                    professionalBillingProviderList,
                                    this.state.gfeInfo[this.state.selectedGFE]
                                      .selectedBillingProvider,
                                    this.handleSelectBillingProvider,
                                    "billingProvider"
                                  )
                                : OrganizationSelect(
                                    this.state.organizationList,
                                    this.state.gfeInfo[this.state.selectedGFE]
                                      .selectedBillingProvider,
                                    "billing-provider-label",
                                    "billingProvider",
                                    this.handleOpenOrganizationList,
                                    this.handleSelectBillingProvider,
                                    "billing"
                                  )}
                            </FormControl>
                          </Grid>

                          <Grid item className={classes.smallerPaddingPaper}>
                            <FormControl component="fieldset">
                              <Box>
                                <Grid item>
                                  <b>
                                    <Typography variant="subtitle1">
                                      Care Team:
                                    </Typography>
                                  </b>
                                </Grid>
                              </Box>
                            </FormControl>
                          </Grid>
                        </Grid>
                        <Box
                          sx={{
                            width: 500,
                            backgroundColor: "#FFFFFF",
                            mb: 3,
                            ml: 3,
                          }}
                        >
                          <CareTeam
                            rows={
                              this.state.gfeInfo[this.state.selectedGFE]
                                .careTeamList
                            }
                            providerList={providerListOptions}
                            addOne={this.addOneCareTeam}
                            edit={this.editCareTeam}
                            deleteOne={this.deleteOneCareTeam}
                          />
                        </Box>
                      </Card>
                    </Grid>
                    <br></br>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={4}>
                        <Button
                          variant="contained"
                          startIcon={<WestIcon />}
                          color="primary"
                          onClick={() => {
                            this.handleBackward();
                          }}
                        >
                          Previous
                        </Button>
                      </Grid>
                      <Grid item xs={4}>
                        <Button
                          variant="contained"
                          endIcon={<EastIcon />}
                          color="primary"
                          onClick={() => {
                            this.handleForward();
                          }}
                        >
                          Next
                        </Button>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  <TabPanel value={verticalTabIndex} index={2}>
                    <Grid item>
                      <Grid className={classes.cardCareTeam}>
                        <Grid container direction="column">
                          <Grid item className={classes.paper}>
                            <Grid item>
                              <Box sx={{ mt: 3 }}>
                                <b>
                                  <u>
                                    <Typography variant="h6">
                                      Service Details:
                                    </Typography>
                                  </u>
                                </b>
                              </Box>
                            </Grid>
                          </Grid>

                          <Grid item className={classes.paper}>
                            <FormControl>
                              <FormLabel className={classes.inputBox}>
                                Priority:*{" "}
                              </FormLabel>
                              {PrioritySelect(
                                this.state.priorityList,
                                this.state.gfeInfo[this.state.selectedGFE]
                                  .selectedPriority,
                                this.handleOpenPriority,
                                this.handleSelectPriority
                              )}
                            </FormControl>
                          </Grid>
                          <Grid item className={classes.paper}>
                            <Grid container direction="row" spacing={3}>
                              <Grid item>
                                <FormControl>
                                  <FormLabel className={classes.smallerHeader}>
                                    Diagnosis*:
                                  </FormLabel>
                                  <Box
                                    sx={{
                                      width: 500,
                                      backgroundColor: "#FFFFFF",
                                      ml: 3,
                                    }}
                                  >
                                    <DiagnosisItem
                                      rows={
                                        this.state.gfeInfo[
                                          this.state.selectedGFE
                                        ].diagnosisList
                                      }
                                      addOne={this.addOneDiagnosisItem}
                                      edit={this.editDiagnosisItem}
                                      deleteOne={this.deleteOneDiagnosisItem}
                                    />
                                  </Box>
                                </FormControl>
                              </Grid>
                              <Grid item>
                                <Grid container direction="column" spacing={3}>
                                  <Grid item>
                                    <FormLabel>Type of Bill</FormLabel>
                                  </Grid>
                                  <Grid item className={classes.inputBox}>
                                    <TextField
                                      id="supportingInfoTypeOfBill"
                                      variant="standard"
                                      value={
                                        this.state.gfeInfo[
                                          this.state.selectedGFE
                                        ].supportingInfoTypeOfBill
                                      }
                                      onChange={
                                        this.handleSupportingInfoTypeOfBill
                                      }
                                    />
                                  </Grid>

                                  <Grid item>
                                    <FormLabel>
                                      Inter Transaction Identifier
                                    </FormLabel>
                                  </Grid>
                                  <Grid item>
                                    <Select
                                      displayEmpty
                                      id="select-inter-trans-id"
                                      value={
                                        this.state.gfeInfo[
                                          this.state.selectedGFE
                                        ].interTransIntermediary
                                      }
                                      label="Inter Trans Identifier"
                                      onChange={this.handleSelectInterTransId}
                                      className={classes.inputBox}
                                    >
                                      <MenuItem value="InterTransID0001">
                                        InterTransID0001
                                      </MenuItem>
                                    </Select>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>

                          <Grid item className={classes.paper}>
                            <Grid container direction="row" spacing={3}>
                              <Grid item>
                                <FormControl>
                                  <FormLabel className={classes.smallerHeader}>
                                    Procedure:{" "}
                                  </FormLabel>
                                  <Box
                                    sx={{
                                      width: 500,
                                      backgroundColor: "#FFFFFF",
                                      ml: 3,
                                    }}
                                  >
                                    <ProcedureItem
                                      rows={
                                        this.state.gfeInfo[
                                          this.state.selectedGFE
                                        ].procedureList
                                      }
                                      addOne={this.addOneProcedureItem}
                                      edit={this.editProcedureItem}
                                      deleteOne={this.deleteOneProcedureItem}
                                    />
                                  </Box>
                                </FormControl>
                              </Grid>
                              <Grid item>
                                <FormControl>
                                  <FormLabel className={classes.smallerHeader}>
                                    Services:*{" "}
                                  </FormLabel>
                                  <Box
                                    sx={{
                                      width: "65vw",
                                      backgroundColor: "#FFFFFF",
                                      ml: 3,
                                    }}
                                  >
                                    <ClaimItem
                                      rows={
                                        this.state.gfeInfo[
                                          this.state.selectedGFE
                                        ].claimItemList
                                      }
                                      addOne={this.addOneClaimItem}
                                      edit={this.editClaimItem}
                                      deleteOne={this.deleteOneClaimItem}
                                    />
                                  </Box>
                                </FormControl>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <br></br>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={4}>
                        <Button
                          variant="contained"
                          startIcon={<WestIcon />}
                          color="primary"
                          onClick={() => {
                            this.handleBackward();
                          }}
                        >
                          Previous
                        </Button>
                      </Grid>
                      <Grid item xs={4}>
                        <Button
                          variant="contained"
                          endIcon={<EastIcon />}
                          color="primary"
                          onClick={() => {
                            this.handleForward();
                          }}
                        >
                          Next
                        </Button>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* Summary tab*/}
                  <TabPanel value={verticalTabIndex} index={3}>
                    <Grid item className={classes.paper} xs={12}>
                      <FormControl component="fieldset">
                        <Grid container direction="row">
                          <Grid item xs={10}>
                            <b>
                              <Typography variant="h6">Summary</Typography>
                            </b>
                          </Grid>
                        </Grid>

                        <Grid item>
                          <SummaryItem summary={summary} />
                        </Grid>
                      </FormControl>
                    </Grid>
                    <br></br>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={4}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<WestIcon />}
                          onClick={() => {
                            this.handleBackward();
                          }}
                        >
                          Previous
                        </Button>
                      </Grid>
                      <Grid item xs={4}>
                        <Button
                          loading
                          variant="contained"
                          color="primary"
                          type="submit"
                          disabled={this.props.submittingStatus === true}
                        >
                          Submit GFE
                        </Button>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* Total Summary Tab */}
                  <TabPanel value={verticalTabIndex} index={4}>
                    <Grid item className={classes.paper} xs={12}>
                      <FormControl component="fieldset">
                        <Grid container direction="row">
                          <Grid item>
                            <Grid item xs={2}>
                              <ViewGFERequestDialog
                                generateRequest={this.generateBundle}
                                error={this.state.validationErrors}
                              />
                            </Grid>
                            <TotalSummaryGFEs
                              subject={this.state.subjectInfo}
                              summaries={this.state.gfeInfo}
                            ></TotalSummaryGFEs>
                          </Grid>
                        </Grid>
                      </FormControl>
                    </Grid>
                  </TabPanel>
                </Box>
              </TabPanel>

              {/* Second tab on the top (AEOB) */}
              <TabPanel value={currentTabIndex} index={1}>
                Item Two
              </TabPanel>
            </Box>
          </form>
          {this.state.openErrorDialog ? (
            <ViewErrorDialog
              error={this.state.validationErrors}
              open={this.state.openErrorDialog}
              setOpen={(open) => this.setState({ openErrorDialog: open })}
            />
          ) : null}
          {this.state.submittingStatus === true ? (
            <Box sx={{ width: "100%" }}>
              <LinearProgress />
            </Box>
          ) : null}
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(GFERequestBox);
