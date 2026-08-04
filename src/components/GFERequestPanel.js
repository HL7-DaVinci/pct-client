import React, { Component } from "react";
import {
  Box,
  Button,
  Card,
  Divider,
  FormLabel,
  FormControl,
  FormControlLabel,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import * as _ from "lodash";

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
import buildGFEPacketBundle from "./BuildGFEPacketBundle";
import ViewGFERequestDialog from "./ViewGFEDialog";
import { PlaceOfServiceList } from "../values/PlaceOfService";

import CareTeam from "./CareTeam";
import ClaimItem from "./ClaimItem";
import { ProcedureCodes } from "../values/ProcedureCode";
import DiagnosisItem from "./DiagnosisItem";
import ProcedureItem from "./ProcedureItem";
import SummaryItem from "./SummaryItem";
import TotalSummaryGFEs from "./TotalSummaryGFEs";
import { SupportingInfoType, TypeOfBillList } from "../values/SupportingInfo";
import { DiagnosisList, DiagnosisTypeList } from "../values/DiagnosisList";
import ViewErrorDialog from "./ViewErrorDialog";
import moment from "moment";
import WestIcon from "@mui/icons-material/West";
import EastIcon from "@mui/icons-material/East";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { styles } from "../styles/GFERequestPanelStyles";
import { TabPanel } from "./TabPanel";
import {
  ProfessionalBillingProviderSelect,
  OrganizationSelect,
  PatientSelect,
  PrioritySelect,
} from "./SelectComponents";
import { v4 } from "uuid";
import DeleteIcon from "@mui/icons-material/Delete";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import { AppContext } from "../Context";
import { getHumanDisplayName } from "../util/displayUtils";

class GFERequestBox extends Component {

  static contextType = AppContext;

  constructor(props) {
    super(props);

    this.initialState = {
      openErrorDialog: false,
      verticalTabIndex: 0,
      showDeleteConfirmation: false,
    };
    this.state = this.initialState;
    this.missingItems = [];
  }

  handleAddGFE = () => {
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    const newGFEId = v4();
    gfeInfo[newGFEId] = this.props.generateGFE();

    this.setState({ verticalTabIndex: 1 });
    this.props.updateSessionInfo({ gfeInfo, selectedGFE: newGFEId });
  };

  handleDeleteGFE = (id) => {
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    let selectedGFE = this.props.session.selectedGFE;
    let verticalTabIndex = this.state.verticalTabIndex;
    delete gfeInfo[id];
    if (id === this.props.session.selectedGFE) {
      if (Object.keys(gfeInfo).length > 0) {
        selectedGFE = Object.keys(gfeInfo)[0];
      } else {
        selectedGFE = null;
        verticalTabIndex = 0;
      }
    }
    this.setState({
      verticalTabIndex,
      gfeDeletingDisplay: null,
      gfeDeleting: null,
      showDeleteConfirmation: false,
    });
    this.props.updateSessionInfo({ gfeInfo, selectedGFE });
  };
  componentDidUpdate(prevProps, prevState) {
    if (this.props.dataServerChanged && !prevProps.dataServerChanged) {
      this.resetState();
      this.props.setDataServerChanged(false);
    }
    // If patientId changes in session, fetch new patient details
    const prevPatientId = prevProps.session?.subjectInfo?.selectedPatient;
    const currentPatientId = this.props.session?.subjectInfo?.selectedPatient;
    if (currentPatientId && currentPatientId !== prevPatientId) {
      this.fetchAndSetPatientDetails(currentPatientId);
    }
    // If submitterId changes in session, fetch new submitter details
    const prevSubmitterId = prevProps.session?.subjectInfo?.selectedSubmitter;
    const currentSubmitterId = this.props.session?.subjectInfo?.selectedSubmitter;
    if (currentSubmitterId && currentSubmitterId !== prevSubmitterId) {
      this.fetchAndSetSubmitterDetails(currentSubmitterId);
    }
  }

  componentDidMount() {
    const fetchProviders = async () => {
      try {
        const res = await Promise.all([
          getPractitionerRoles(this.context.dataServer, "ehr"),
          getPractitioners(this.context.dataServer, "ehr"),
          getOrganizations(this.context.dataServer, "ehr"),
        ]);
        await Promise.all(
          res.map((r) => {
            if (
              r.data &&
              r.data[0] &&
              r.data[0].resourceType === "PractitionerRole"
            ) {
              let references = Object.assign(
                this.props.session.resolvedReferences
              );
              for (const property in r.references) {
                if (!(property in references)) {
                  references[property] = r.references[property];
                }
              }
              this.props.updateSessionInfo({
                practitionerRoleList: r.data,
                resolvedReferences: references,
              });
              this.props.addToLog(
                "Finished getting practitionerRole.",
                "network",
                r.data
              );
            } else if (r.resourceType && r.resourceType === "Bundle") {
              // handle practitioner and organization
              if (r.link && r.link[0] && r.link[0].relation === "self") {
                const urlParts = r.link[0].url.split("/");
                const type = urlParts[urlParts.length - 1];
                switch (type) {
                  case "Practitioner":
                    this.props.updateSessionInfo({
                      practitionerList: r.entry,
                    });
                    this.props.addToLog(
                      "Finished getting practitioner.",
                      "network",
                      r.entry
                    );
                    break;
                  case "Organization":
                    this.props.updateSessionInfo({
                      organizationList: r.entry,
                    });
                    this.props.addToLog(
                      "Finished getting organization.",
                      "network",
                      r.entry
                    );
                    break;
                  default:
                    break;
                }
              }
            }
            return "";
          })
        );
      } catch (e) {
        this.props.addToLog(
          "Failed to retrieve the data from provider data store! Check the connections!",
          "error",
          e
        );
      }
    };
    // Fetch providers, then sequentially fetch patient and submitter details to autofill
    const fetchAll = async () => {
      await fetchProviders();
      const patientId = this.props.session?.subjectInfo?.selectedPatient;
      if (patientId) {
        this.fetchAndSetPatientDetails(patientId);
      }
      const submitterId = this.props.session?.subjectInfo?.selectedSubmitter;
      if (submitterId) {
        this.fetchAndSetSubmitterDetails(submitterId);
      }
    };
    fetchAll();
  }

  resetState = () => {
    this.setState({
      ...this.initialState,
    });
  };

  handleOpenPatients = () => {
    getPatients(this.context.dataServer).then((result) => {
      const patients = result.entry;
      this.props.updateSessionInfo({ patientList: patients });
    });
  };

  handleOpenPriority = () => {
    getClaims(this.context.dataServer).then((result) => {
      const priority = result.entry;

      this.props.updateSessionInfo({ priorityList: priority });
    });
  };

  // Fetch and set patient details
  fetchAndSetPatientDetails = (patientId) => {
    // retrieve coverage and payer info about patient
    //adding other patient info here too
    getCoverageByPatient(this.context.dataServer, patientId).then((result) => {

      if (result.data && result.data.length > 0) {
        const subscriberText = result.data[0].subscriberId;
        const relationshipText = result.data[0].relationship.coding[0].display;
        const planName = result.data[0].class[0].name;
        const coveragePeriodTextStart = result.data[0].period?.start || "";
        const coveragePeriodTextEnd = result.data[0].period?.end || "";

        const coveragePeriod =
            (coveragePeriodTextStart || coveragePeriodTextEnd)
                ? `${coveragePeriodTextStart || "-"} to ${coveragePeriodTextEnd || "-"}`
                : "";

        getCoverage(this.context.dataServer, result.data[0].id).then(
          (coverageResult) => {
            const reference = Object.keys(coverageResult.references)[0];
            const resource = coverageResult.references[reference];

            let subjectInfo = {
              ...this.props.session.subjectInfo,
              selectedPatient: patientId,
              selectedPayor: resource,
              selectedCoverage: coverageResult.data,
              subscriber: subscriberText,
              subscriberRelationship: relationshipText,
              coveragePlan: planName,
              coveragePeriod: coveragePeriod,
            };
            this.props.updateSessionInfo({ subjectInfo });
          }
        );
      } else {
        let subjectInfo = {
          ...this.props.session.subjectInfo,
          selectedPatient: patientId,
          selectedPayor: undefined,
          selectedCoverage: undefined,
          subscriber: undefined,
          subscriberRelationship: undefined,
          coveragePlan: undefined,
          coveragePeriod: undefined,
        };
        this.props.updateSessionInfo({ subjectInfo });
        this.props.addToLog(
          "Couldn't retrieve patient's coverage and payor info",
          "error"
        );
      }
    });

    getPatientInfo(this.context.dataServer, patientId).then((result) => {
      const addressText = result?.[0]?.address?.[0]?.text ?? null;
      const birthdateText = result?.[0]?.birthDate ?? null;
      const genderText = result?.[0]?.gender ?? null;
      const telephoneText = result?.[0]?.telecom?.[0]?.value ?? null;
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
      for (let i = 0; i < this.props.session.patientList.length; i++) {
        if (patientId === this.props.session.patientList[i].resource.id) {
          if (this.props.session.patientList[i].resource.name[0].text) {
            patientName =
              this.props.session.patientList[i].resource.name[0].text;
          } else
            patientName = `${this.props.session.patientList[i].resource.name[0].given[0]} ${this.props.session.patientList[i].resource.name[0].family}`;
        }
      }
      if (addressText && addressText.length > 0) {//TODO validate this logic
        let subjectInfo = {
          ...this.props.session.subjectInfo,
          selectedAddress: addressText,
          birthdate: birthdateText,
          gender: genderText,
          telephone: telephoneText,
          selectedPatientName: patientName,
          memberNumber,
        };
        this.props.updateSessionInfo({ subjectInfo });
      } else {
        let subjectInfo = {
          ...this.props.session.subjectInfo,
          selectedAddress: undefined,
          birthdate: undefined,
          gender: undefined,
          telephone: undefined,
          selectedPatientName: patientName,
          memberNumber,
        };
        this.props.updateSessionInfo({ subjectInfo });
        this.props.addToLog(
          "Couldn't retrieve patient's personal info",
          "error"
        );
      }
    });
    this.props.updateSessionInfo({
      patientSelected: true,
    });
  };

  //when select the patient, changes fields within the form specific
  handleSelectPatient = (e) => {
    const patientId = e.target.value;
    this.fetchAndSetPatientDetails(patientId);
  };

  handleSelectPriority = (e) => {
    const priorityLevel = e.target.value;
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    gfeInfo[this.props.session.selectedGFE].selectedPriority =
      JSON.parse(priorityLevel);
    this.props.updateSessionInfo({ gfeInfo });
  };

  handleSelectBillingProvider = (e) => {
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    gfeInfo[this.props.session.selectedGFE].selectedBillingProvider =
      e.target.value;

    const allBillingProviders = this.getProfessionalBillingProviderList();

    //set name of provider to display name instead of code in summary tab
    for (let i = 0; i < allBillingProviders.length; i++) {
      if (e.target.value === allBillingProviders[i].id) {
        gfeInfo[this.props.session.selectedGFE].selectedBillingProviderName =
          allBillingProviders[i].display;
      }
    }
    this.props.updateSessionInfo({
      gfeInfo,
    });
  };

  handleOpenOrganizationList = (e) => {
    getOrganizations(this.context.dataServer, "ehr").then((result) => {
      this.props.updateSessionInfo({
        organizationList: result.entry,
      });
    });

    getLocations(this.context.dataServer).then((result) =>
      this.props.updateSessionInfo({ locationList: result.entry })
    );
  };

  handleSelectSubmitter = (e) => {
    const submitterId = e.target.value;
    this.fetchAndSetSubmitterDetails(submitterId);
  };

  // Fetch and set submitter details
  fetchAndSetSubmitterDetails = (submitterId) => {
    if (!submitterId) return;
    const allSubmittersList = this.getProfessionalBillingProviderList();
    console.log("Professional billing providers list size:", allSubmittersList?.length ?? 0);
    let selectedSubmittingProviderName = "";
    //set name of provider to display name instead of code in summary tab
    for (let i = 0; i < allSubmittersList.length; i++) {
      if (submitterId === allSubmittersList[i].id) {
        selectedSubmittingProviderName = allSubmittersList[i].display;
        console.log("Submitting Provider Id, Name:", submitterId, selectedSubmittingProviderName);
        break;
      }
    }
    this.props.updateSessionInfo({
      subjectInfo: {
        ...this.props.session.subjectInfo,
        selectedSubmitter: submitterId,
        selectedSubmittingProviderName,
      },
    });
  };

  getClaimDetails = () => {
    return {
      coverage: this.props.session.subjectInfo.selectedCoverage,
    };
  };
  generateRequestInput = (gfeId) => {
    let input = {
      bundleResources: [],
    };

    if (this.props.session.subjectInfo.selectedPatient === undefined) {
      return input;
    }

    let orgReferenceList = [];
    input.gfeType = this.props.session.subjectInfo.gfeType;

    const fhirServerBaseUrl = this.context.dataServer;
    let claim_id = Math.floor(Math.random() * 10000); 
    input.identifier = [
      {
        type : {
          coding : [
            {
              system : "http://terminology.hl7.org/CodeSystem/v2-0203",
              code : "PLAC",
              display : "Placer Identifier"
            }
          ]
        },
        system : "https://pct-client.davinci.hl7.org",
        value : String(claim_id)
      }
    ]


    input.patient = {
      reference: `Patient/${this.props.session.subjectInfo.selectedPatient}`,
      resource: this.props.session.patientList.filter(
        (patient) =>
          patient.resource.id === this.props.session.subjectInfo.selectedPatient
      )[0].resource,
    };

    input.bundleResources.push({
      type: 'patient',
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
      type: 'coverage',
      fullUrl: `${fhirServerBaseUrl}/${input.request.coverage.reference}`,
      entry: input.request.coverage.resource,
    });

    let insurerOrgRef = `Organization/${this.props.session.subjectInfo.selectedPayor.id}`;
    input.insurer = {
      reference: insurerOrgRef,
      resource: this.props.session.subjectInfo.selectedPayor,
    };

    orgReferenceList.push(insurerOrgRef);
    input.bundleResources.push({
      type: 'payer',
      fullUrl: `${fhirServerBaseUrl}/${input.insurer.reference}`,
      entry: input.insurer.resource,
    });

    // FIND Provider Taxonomy here
    let providerReference = undefined,
      findProfessionalProvider = undefined,
      findInstitutionalProvider = undefined,
      providerTaxonomy = undefined;
    if (this.props.session.subjectInfo.gfeType === "professional") {
      const professionalProviderList =
        this.getProfessionalBillingProviderList();
      findProfessionalProvider = professionalProviderList.find(
        (provider) =>
          provider.id ===
          this.props.session.gfeInfo[gfeId].selectedBillingProvider
      );
      
      providerReference = findProfessionalProvider.reference;
      console.log('test')
      console.log(findProfessionalProvider)
      if(findProfessionalProvider.type === "Practitioner" && (findProfessionalProvider.resource.type))
      {
        findProfessionalProvider.resource.type.forEach((providerType) => {
          providerType.coding.forEach((providerTypeCoding) => {
            if (providerTypeCoding.system === "http://nucc.org/provider-taxonomy") {
              providerTaxonomy = providerType
            }
          });
        });
      }
      else if((findProfessionalProvider.type === "PractitionerRole") && (findProfessionalProvider.resource.specialty))
      {
        providerTaxonomy = findProfessionalProvider.resource.specialty[0];
      }
      else{
        providerTaxonomy = {
          coding: [
            {
              system: "http://nucc.org/provider-taxonomy",
              code: "208D00000X",
              display: "General Practice Physician"
            }
          ]
        }
      }

    

    } else {
      const professionalProviderList =
        this.getProfessionalBillingProviderList();
      
      findInstitutionalProvider = professionalProviderList.find(
        (provider) =>
          provider.reference.endsWith(this.props.session.gfeInfo[gfeId].selectedBillingProvider)
      );
      findInstitutionalProvider.resource.type.forEach((providerType) => {
        providerType.coding.forEach((providerTypeCoding) => {
          if (providerTypeCoding.system === "http://nucc.org/provider-taxonomy") {
            providerTaxonomy = providerType
          }
          else {
            providerTaxonomy = {
              coding: [
                {
                  system: "http://nucc.org/provider-taxonomy",
                  code: "208D00000X",
                  display: "General Practice Physician"
                }
              ]
            }
          }
        });
      });
      providerReference = `Organization/${this.props.session.gfeInfo[gfeId].selectedBillingProvider}`;
    }

    input.provider = {
      reference: providerReference,
      extension: [{
        url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/providerTaxonomy",
        valueCodeableConcept:  providerTaxonomy 
    }],
      resource:
        this.props.session.subjectInfo.gfeType === "professional"
          ? findProfessionalProvider.resource
          : this.props.session.organizationList.find(
              (org) =>
                org.resource.id ===
                this.props.session.gfeInfo[gfeId].selectedBillingProvider
            ).resource,
    };
    if (this.props.session.subjectInfo.gfeType === "institutional") {
      orgReferenceList.push(providerReference);
    } else if (findProfessionalProvider.type === "Organization") {
      orgReferenceList.push(providerReference);
    }

    input.bundleResources.push({
      fullUrl: `${fhirServerBaseUrl}/${input.provider.reference}`,
      entry: input.provider.resource,
    });

    input.billing = {};
    if (this.props.session.gfeInfo[gfeId].interTransIntermediary) {
      input.billing.interTransIntermediary =
        this.props.session.gfeInfo[gfeId].interTransIntermediary;
    }

    input.billing.gfeAssignedServiceId = gfeId;

    input.billing.items = [];
    let sequenceCount = 1;
    let totalAmount = 0;

    this.props.session.gfeInfo[gfeId].claimItemList.forEach((claimItem) => {
      const procedureCodingOrig = ProcedureCodes.find((code) =>
        claimItem.productOrService.startsWith(code.code)
      );
      let procedureCoding = Object.assign({}, procedureCodingOrig);
      delete procedureCoding["unitPrice"];
      delete procedureCoding["revenue"];
      delete procedureCoding["serviceDescription"];

      const normalize = (value) => (value || "").toString().trim().toLowerCase();
      const placeOfServiceValue = normalize(claimItem.placeOfService);
      const pos = PlaceOfServiceList.find(
        (candidate) =>
          normalize(candidate.display) === placeOfServiceValue ||
          normalize(candidate.code) === placeOfServiceValue
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

        if (claimItem.estimatedEndDateOfService) {
          const estimateEndDate = new Date(
            Date.parse(claimItem.estimatedEndDateOfService.toString())
          );
          const endMonth = estimateEndDate.getMonth() + 1;
          const endMonthString = endMonth < 10 ? "0" + endMonth : endMonth;
          const endDateString =
          estimateEndDate.getDate() < 10
              ? "0" + estimateEndDate.getDate()
              : estimateEndDate.getDate();
          
          newItem.servicedPeriod = {
            start: estimateDate.getFullYear() + "-" + monthString + "-" + dateString,
            end: estimateEndDate.getFullYear() + "-" + endMonthString + "-" + endDateString,
          };
        }
        else{
          newItem.servicedDate = estimateDate.getFullYear() + "-" + monthString + "-" + dateString;
        }
      }
      
      // Service Description
      newItem.extension = [];
      newItem.extension.push({
        url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/serviceDescription",
        valueString: procedureCodingOrig.serviceDescription,
      });
      
      //estimated service date extension was replaced with the item.serviced[x]
      /*
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
      */
      if (pos) {
        newItem.locationCodeableConcept = {
          coding: [pos],
        };
      } else if (claimItem.placeOfService) {
        // Keep location[x] populated even when UI value does not map to known POS coding.
        newItem.locationAddress = {
          text: claimItem.placeOfService,
        };
        console.warn(
          `No PlaceOfService coded match for value: "${claimItem.placeOfService}". Using locationAddress fallback.`
        );
      } else {
        console.warn(
          `Missing placeOfService for claim item sequence ${newItem.sequence}; location[x] not set.`
        );
      }
      input.billing.items.push(newItem);

      totalAmount += claimItem.unitPrice * claimItem.quantity;
    });
    input.billing.total = totalAmount;

    input.diagnosis = [];
    let diagnosisSequence = 1;
    this.props.session.gfeInfo[gfeId].diagnosisList.forEach((diagnosis) => {
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
                  "http://terminology.hl7.org/CodeSystem/diagnosistype",
              },
            ],
          },
        ],
        packageCode: diagnosisCode.packageCode,
      });
    });

    // supportingInfo
    if (this.props.session.gfeInfo[gfeId].supportingInfoTypeOfBill) {
      input.supportingInfo = [];
      let supportingInfoSequence = 1;

      const categoryCodeableConcept = (inputType) =>
        SupportingInfoType.find((type) => type.type === inputType);

      if (this.props.session.gfeInfo[gfeId].supportingInfoTypeOfBill) {
        const selectedTypeOfBill = TypeOfBillList.find(
          (typeOfBill) =>
            typeOfBill.code ===
            this.props.session.gfeInfo[gfeId].supportingInfoTypeOfBill
        );
        input.supportingInfo.push({
          sequence: supportingInfoSequence++,
          category: categoryCodeableConcept("typeofbill").codeableConcept,
          code: {
            coding: [
              {
                system:
                  selectedTypeOfBill?.system ||
                  "https://www.nubc.org/CodeSystem/TypeOfBill",
                code: this.props.session.gfeInfo[gfeId]
                  .supportingInfoTypeOfBill,
                display: selectedTypeOfBill?.display || "Type of Bill",
              },
            ],
          },
        });
      }
    }
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    console.log(this.props.session.subjectInfo)
    if(this.props.session.subjectInfo.selectedSubmittingProviderName.startsWith("PractitionerRole"))
    {
      let findProfessionalProviderRole = undefined;
      const professionalProviderList =
        this.getProfessionalBillingProviderList();
      console.log(professionalProviderList);
      findProfessionalProviderRole = professionalProviderList.find(
        (provider) =>
          provider.id === this.props.session.subjectInfo.selectedSubmitter
      );
      console.log(findProfessionalProviderRole);

      let submitterProviderReference = findProfessionalProviderRole.resource.practitioner.reference;
      let submitterProviderResource = undefined;
      console.log("REF!!!!");
      console.log(submitterProviderReference)
      const providerMap = this.getCareTeamProviderListOptions();
      console.log(providerMap);
      providerMap.forEach((providerItem) => {
        if (providerItem.url.endsWith(submitterProviderReference)) {
          submitterProviderResource = providerItem.resource;
        }
      });
      
      

      input.submitter = {
        reference: submitterProviderReference,
        resource: submitterProviderResource
        
      };
      
      orgReferenceList.push(submitterProviderResource);

      input.bundleResources.push({
        type: 'submitter',
        fullUrl: `${fhirServerBaseUrl}/${input.submitter.reference}`,
        entry: input.submitter.resource,
      }); 

    }
    else if (this.props.session.subjectInfo.selectedSubmittingProviderName.startsWith("Practitioner")) {
      let submitterPractitionerReference = `Practitioner/${this.props.session.subjectInfo.selectedSubmitter}`;
      let submitterPractitionerResource = this.props.session.practitionerList.find(
          (pract) => pract.resource.id === this.props.session.subjectInfo.selectedSubmitter
      )?.resource;

      input.submitter = {
        reference: submitterPractitionerReference,
        resource: submitterPractitionerResource,
      };
      orgReferenceList.push(submitterPractitionerReference);

      input.bundleResources.push({
        type: 'submitter',
        fullUrl: `${fhirServerBaseUrl}/${input.submitter.reference}`,
        entry: input.submitter.resource,
      });
    }
    else
    {

      let submitterOrgReference = `Organization/${this.props.session.subjectInfo.selectedSubmitter}`;
      input.submitter = {
        reference: submitterOrgReference,
        resource: this.props.session.organizationList.filter(
          (org) =>
            org.resource.id === this.props.session.subjectInfo.selectedSubmitter
        )[0].resource, //undefined resource?
      };
      orgReferenceList.push(submitterOrgReference);

      input.bundleResources.push({
        type: 'submitter',
        fullUrl: `${fhirServerBaseUrl}/${input.submitter.reference}`,
        entry: input.submitter.resource,
      });
    }
    

    orgReferenceList.forEach((orgRef) => {
      let foundLocation = this.props.session.locationList.find(
        (loc) => {
          if('managingOrganization' in loc.resource && 'reference' in loc.resource.managingOrganization)
          {
            return loc.resource.managingOrganization.reference === orgRef
          }
          else
          {
            return false;
          }
        }
      );
      if (foundLocation) {
        input.bundleResources.push({
          fullUrl: `${fhirServerBaseUrl}/${orgRef}`,
          entry: foundLocation.resource,
        });
      }
    });

    // add care team
    if (!this.itemListIsEmpty(this.props.session.gfeInfo[gfeId].careTeamList)) {
      input.careTeam = [];
      const providerMap = this.getCareTeamProviderListOptions();
      let sequenceNumber = 1;
      this.props.session.gfeInfo[gfeId].careTeamList.forEach((member) => {
        const providerResource = providerMap.find(
          (item) => item.display === member.provider
        );
        const careTeamProviderReference =
          providerResource?.resource?.resourceType && providerResource?.resource?.id
            ? `${providerResource.resource.resourceType}/${providerResource.resource.id}`
            : providerResource.url;
        input.careTeam.push({
          sequence: sequenceNumber++,
          role: member.role.toLowerCase().replace(/\s+/g, ""),
          providerRef: {
            reference: careTeamProviderReference,
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
      error: [],
    });
    //const { valid, error } = this.isRequestValid();
    const error = [];

    const submissionBundle = this.generateBundle();
    const { valid } = this.validateSubmissionBundle(submissionBundle, error);

    if (valid) {
      this.props.setSubmitting(true);
      this.props.setGfeSubmitted(true);
      this.props.setGfeResponse(undefined);
      this.props.setReceivedAEOBResponse(undefined);

      this.props.addToLog(
        `Submitting GFE to ${this.context.payerServer}/Claim/$gfe-submit`,
        "network",
        submissionBundle
      );

      submitGFEClaim(this.context.payerServer, submissionBundle)
        .then(async (response) => {
          this.props.setSubmitting(false);
          this.props.addToLog(
            `GFE claim submission received response with status ${response.status}`,
            "network"
          );
          console.log(response);

          // async bundling response (202)
          if (response.status === 202) {
            this.props.setGfeRequestSuccess(true);
            let responseHeaders = JSON.stringify([...response.headers], null, 2);
            console.log(`Response headers: ${responseHeaders}`);
            for(const header of response.headers){
              console.log(`Name: ${header[0]}, Value:${header[1]}`);
            }
            console.log("test-1");
            console.log(response.headers.get("content-location"));
            console.log("test0");
            const pollUrl = new URL(response.headers.get("Content-Location"));
            console.log("test1");
            this.props.setBundleId(pollUrl.searchParams.get("_bundleId"));
            console.log("test2");
            this.props.setPollUrl(pollUrl.href);
            console.log("test3");
          }
          // sync response (200)
          else if (response.status === 200) {
            this.props.setGfeResponse(await response.json());
            this.props.setGfeRequestSuccess(true);
            this.props.setBundleId(response.id);
            this.props.setBundleIdentifier(response.identifier.value);
          }
          // unexpected response
          else {
            throw new Error(
              `Received unexpected response with status of ${response.status}`
            );
          }

          this.props.setMainPanelTab("2");
        })
        .catch((error) => {
          this.props.addToLog("Error submitting GFE claim", "error", error);
          this.props.setSubmitting(false);
          this.props.setGfeRequestSuccess(false);
          if ("toJSON" in error) {
            this.props.setGfeResponse(error.toJSON());
          } else {
            this.props.setGfeResponse(error.toString());
          }
          this.props.setMainPanelTab("2");
        });
    } else {
      this.setState({
        openErrorDialog: true,
        error: error,
      });
    }
  };

  validateSubmissionBundle = (bundle, error) => {
    const claim = bundle.entry.find(e => e.resource.resourceType === "Bundle")?.resource.entry
        .find(e => e.resource.resourceType === "Claim" && !(e.resource.type?.coding?.some(coding => coding.code === "estimate-summary")))?.resource;
    const coverage = bundle.entry.find(e => e.resource.resourceType === "Coverage")?.resource;

    if (!claim) {
      error.push("No valid Claim resource found in bundle.");
      return { valid: false };
    }

    if (!claim?.identifier || claim.identifier.length === 0) {
      error.push("Claim.identifier is required.");
    }

    if (!claim?.identifier?.some(id => id.type?.coding?.some(coding => coding.code === "PLAC"))) {
      error.push("Claim.identifier must include a PLAC identifier.");
    }

    if (!claim?.diagnosis?.some(d => d.type?.some(t => t.coding?.some(c => c.code === "principal")))) {
      error.push("Claim.diagnosis must include a principal diagnosis.");
    }

    if (!claim?.provider?.extension?.length) {
      error.push("Claim.provider.extension is required.");
    }

    if (!claim?.provider?.extension?.some(ext => ext.url?.toLowerCase().includes("providertaxonomy"))) {
      error.push("Claim.provider.extension must include a providerTaxonomy extension.");
    }

    if (!claim?.item?.every(i => i.extension?.some(ext => ext.url.includes("serviceDescription")))) {
      error.push("Each Claim.item must include a serviceDescription extension.");
    }

    if (!claim?.item?.every(i => i.servicedDate || i.servicedPeriod)) {
      error.push("Each Claim.item must have a serviced[x] date.");
    }

    // Institutional requires typeOfBill supportingInfo
    const isInstitutional = claim?.type?.coding?.some(c => c.code === "institutional");
    if (isInstitutional) {
      const hasTypeOfBill = claim?.supportingInfo?.some(si =>
        si.category?.coding?.some(c =>
          c.code === "typeofbill" || c.system?.includes("typeofbill") || c.system?.includes("PCTSupportingInfoType")
        )
      );
      if (!hasTypeOfBill) {
        error.push("Institutional Claim.supportingInfo must include a typeOfBill slice.");
      }
    }

    if (coverage?.identifier?.length > 1) {
      error.push("Coverage.identifier must not have more than one value.");
    }

    if (!coverage?.relationship?.coding?.some(c => !!c.display)) {
      error.push("Coverage subscriber display is required.");
    }

    return { valid: error.length === 0 };
  };

  generateBundle = () => {
    const ri = Object.keys(this.props.session.gfeInfo).map((gfeId) =>
        this.generateRequestInput(gfeId)
    );

    // Generate a GFE Bundle per Claim (GFE)
    const bundles = ri.map((input) => buildGFEBundle(input));

    // Collapse all individual GFE bundles into a single GFE bundle with no repeating resources
    const bundleEntries = bundles.reduce((acc, e) => {
      e.entry.forEach((entry) => {
        const resource = entry.resource;
        if (resource.resourceType === "Claim" && entry.fullUrl) {
          const extractedId = entry.fullUrl.split("/").pop(); // Extracts the last part of the URL
          if (!resource.id) {
            resource.id = extractedId;
          }
        }
        acc.push(entry);
      });
      return acc;
    }, []);

    const enteredIds = new Set();
    const uniqueEntries = [];

    // don't include duplicates in accumulation of entries
    bundleEntries.forEach((e) => {
      if (e.resource.resourceType === "Claim" || !enteredIds.has(e.resource.id)) {
        uniqueEntries.push(e);
        enteredIds.add(e.resource.id);
      }
    });

    // Track missing referenced resources
    const referencedResources = new Set();

    uniqueEntries.forEach((entry) => {
      const resource = entry.resource;

      if (resource.resourceType === "Procedure" && resource.procedure?.reference) {
        referencedResources.add(resource.procedure.reference);
      }

      // Collect references from Diagnoses (Condition)
      if (resource.resourceType === "Condition" && resource.condition?.reference) {
        referencedResources.add(resource.condition.reference);
      }

      // Collect references from PractitionerRoles to Organizations
      if (resource.resourceType === "PractitionerRole" && resource.organization?.reference) {
        referencedResources.add(resource.organization.reference);
      }
    });

    // Add missing referenced resources from available lists
    const providerMap = this.getCareTeamProviderListOptions();
    const providerListOptions = providerMap.map((provider) => provider.display);
    providerListOptions.forEach(provider => {
      if (referencedResources.has(`Practitioner/${provider.id}`) && !enteredIds.has(provider.id)) {
        uniqueEntries.push({ resource: provider });
        enteredIds.add(provider.id);
      }
    });

    const billingProviderMap = this.getProfessionalBillingProviderList();
    billingProviderMap.forEach(providerRole => {
      if (referencedResources.has(`PractitionerRole/${providerRole.id}`) && !enteredIds.has(providerRole.id)) {
        uniqueEntries.push({ resource: providerRole });
        enteredIds.add(providerRole.id);
      }

      // Ensure organizations referenced by PractitionerRole are included

      if (providerRole.organization?.reference) {
        referencedResources.add(providerRole.organization.reference);
      }
    });

    this.props.session.organizationList.forEach(org => {
      if (referencedResources.has(`Organization/${org.id}`) && !enteredIds.has(org.id)) {
        uniqueEntries.push({ resource: org });
        enteredIds.add(org.id);
      }
    });

    // Now put all unique entries into a single bundle and remove the rest of the bundles
    bundles[0].entry = uniqueEntries;
    bundles.length = 1;

    // Create a GFE Packet Bundle with the single GFE Bundle and its resources
    const packet_bundle = buildGFEPacketBundle(bundles, ri[0].bundleResources);

    return packet_bundle;
  };

  generateRawGfeBundle = () => {
    const packetBundle = this.generateBundle();
    const nestedGfeBundle = packetBundle?.entry?.find(
      (entry) => entry.resource?.resourceType === "Bundle"
    )?.resource;
    return nestedGfeBundle || packetBundle;
  };

  retrieveRequestSummary = () => {
    if (Object.keys(this.props.session.gfeInfo).length === 0) {
      return {};
    }
    const displayableClaimItemList = this.props.session.gfeInfo[
      this.props.session.selectedGFE
    ].claimItemList.map((e) => {
      if (e.estimatedDateOfService) {
        e.estimatedDateOfService = e.estimatedDateOfService.toString();
      }
      return e;
    });

    return {
      patientId: this.props.session.subjectInfo.selectedPatient,
      coverageId: this.props.session.subjectInfo.selectedCoverage
        ? this.props.session.subjectInfo.selectedCoverage.id
        : undefined,
      payorId: this.props.session.subjectInfo.selectedPayor
        ? this.props.session.subjectInfo.selectedPayor.id
        : undefined,
      addressId: this.props.session.subjectInfo.selectedAddress,
      birthdate: this.props.session.subjectInfo.birthdate,
      gender: this.props.session.subjectInfo.gender,
      telephone: this.props.session.subjectInfo.telephone,
      subscriberId: this.props.session.subjectInfo.subscriber,
      memberId: this.props.session.subjectInfo.memberNumber,
      subscriberRelationship:
        this.props.session.subjectInfo.subscriberRelationship,
      coveragePlan: this.props.session.subjectInfo.coveragePlan,
      coveragePeriod: this.props.session.subjectInfo.coveragePeriod,
      gfeType: this.props.session.subjectInfo.gfeType,
      practitionerSelected:
        this.props.session.gfeInfo[this.props.session.selectedGFE].careTeamList,
      practitionerRoleSelected:
        this.props.session.gfeInfo[this.props.session.selectedGFE].careTeamList,
      diagnosisList:
        this.props.session.gfeInfo[this.props.session.selectedGFE]
          .diagnosisList,
      procedureList:
        this.props.session.gfeInfo[this.props.session.selectedGFE]
          .procedureList,
      servicesList:
        this.props.session.gfeInfo[this.props.session.selectedGFE]
          .claimItemList,
      priorityLevel:
        this.props.session.gfeInfo[this.props.session.selectedGFE]
          .selectedPriority,
      submittingProvider: this.props.session.subjectInfo.selectedSubmitter,
      billingProvider:
        this.props.session.gfeInfo[this.props.session.selectedGFE]
          .selectedBillingProvider,
      gfeServiceId: this.props.session.selectedGFE,
      billingProviderName:
        this.props.session.gfeInfo[this.props.session.selectedGFE]
          .selectedBillingProviderName,
      submittingProviderName:
        this.props.session.subjectInfo.selectedSubmittingProviderName,
      careTeamList:
        this.props.session.gfeInfo[this.props.session.selectedGFE].careTeamList,
      claimItemList: displayableClaimItemList,
    };
  };

  checkMissingItems = (summary) => {
    this.missingItems = [];
    //patient section
    if (!summary.patientId) {
      this.missingItems.push("patient details");
    }
    if (!summary.billingProvider) {
      this.missingItems.push("billing provider");
    }
    if (!summary.submittingProvider) {
      this.missingItems.push("submitting provider");
    }
    if (!summary.gfeServiceId) {
      this.missingItems.push("GFE assigned service identifier");
    }

    //care team
    for (let i = 0; i < summary.practitionerSelected.length; i++) {
      //if the provider is there, check if role is too
      if (
        summary.practitionerSelected[i].provider &&
        !summary.practitionerSelected[i].role
      ) {
        let rowNum = i + 1;
        this.missingItems.push("care team provider role (row " + rowNum + ")");
      }
      //if role is there, check if provider
      if (
        summary.practitionerSelected[i].role &&
        !summary.practitionerSelected[i].provider
      ) {
        let rowNum = i + 1;
        this.missingItems.push("care team provider (row " + rowNum + ")");
      }
      //otherwise if both undefined don't throw error bc allowed
    }

    //priority level on encounter tab
    if (!summary.priorityLevel) {
      this.missingItems.push("priority level");
    }

    //diagnosis
    //check if given, and all required fields exist
    let principalDiagnosisFound = 0;
    for (let i = 0; i < summary.diagnosisList.length; i++) {
      //if diagnosis there, but not type, throw error
      if (
        summary.diagnosisList[i].diagnosis &&
        !summary.diagnosisList[i].type
      ) {
        let rowNum = i + 1;
        this.missingItems.push("encounter diagnosis type (row " + rowNum + ")");
      }
      //if type there, but not diagnosis, throw error
      if (
        summary.diagnosisList[i].type &&
        !summary.diagnosisList[i].diagnosis
      ) {
        let rowNum = i + 1;
        this.missingItems.push("encounter diagnosis (row " + rowNum + ")");
      }
      //if both missing, throw general error
      if (
        !summary.diagnosisList[i].diagnosis &&
        !summary.diagnosisList[i].type
      ) {
        this.missingItems.push("diagnosis required");
      }

      // check if principal diagnosis
      if (summary.diagnosisList[i].diagnosis && summary.diagnosisList[i].type?.toLowerCase() === "principal") {
        principalDiagnosisFound++;
      }
    }
    // exactly one principal diagnosis is required
    if (principalDiagnosisFound === 0) {
      this.missingItems.push("diagnosis with type \"principal\" required");
    } else if (principalDiagnosisFound > 1) {
      this.missingItems.push("only one diagnosis with type \"principal\" allowed");
    }

    //procedure
    for (let i = 0; i < summary.procedureList.length; i++) {
      if (
        summary.procedureList[i].procedure &&
        !summary.procedureList[i].type
      ) {
        let rowNum = i + 1;
        this.missingItems.push("encounter procedure type (row " + rowNum + ")");
      }
      if (
        !summary.procedureList[i].procedure &&
        summary.procedureList[i].type
      ) {
        let rowNum = i + 1;
        this.missingItems.push("encounter procedure (row " + rowNum + ")");
      }
      //if both missing, not required
    }

    // institutional requires typeOfBill in supportingInfo
    if (summary.gfeType === "institutional") {
      const hasTypeOfBill = summary.servicesList.length > 0; // placeholder - actual check is via session
      // Check session directly for supportingInfoTypeOfBill
      const gfeId = Object.keys(this.props.session.gfeInfo).find(
        id => id === this.props.session.selectedGFE
      );
      if (gfeId && !this.props.session.gfeInfo[gfeId]?.supportingInfoTypeOfBill) {
        this.missingItems.push("type of bill (required for institutional)");
      }
    }

    //services
    for (let i = 0; i < summary.servicesList.length; i++) {
      if (
        i === 0 &&
        !summary.servicesList[i].productOrService &&
        !summary.servicesList[i].estimatedDateOfService
      ) {
        this.missingItems.push("services");
        break;
      }
      if (!summary.servicesList[i].productOrService) {
        let rowNum = i + 1;
        this.missingItems.push(
          "service (product or service - row " + rowNum + ")"
        );
        this.missingItems.push("service (unit price - row " + rowNum + ")");
        this.missingItems.push("service (net - row " + rowNum + ")");
      }
      if (!summary.servicesList[i].estimatedDateOfService) {
        let rowNum = i + 1;
        this.missingItems.push("service (estimate date - row " + rowNum + ")");
      }
      if (!summary.servicesList[i].placeOfService && summary.gfeType === "professional") {
        let rowNum = i + 1;
        this.missingItems.push("service (place of service - row " + rowNum + ")");
      }
    }
  };

  handleSelectInterTransId = (e) => {
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    gfeInfo[this.props.session.selectedGFE].interTransIntermediary =
      e.target.value;
    this.props.updateSessionInfo({ gfeInfo });
  };

  handleSupportingInfoTypeOfBill = (e) => {
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    gfeInfo[this.props.session.selectedGFE].supportingInfoTypeOfBill =
      e.target.value;
    this.props.updateSessionInfo({ gfeInfo });
  };

  addOneCareTeam = (props) => {
    //checks if the required fields are not given, if not adds to missingItems list
    let missingItems = [];
    for (
      let i = 0;
      i <
      this.props.session.gfeInfo[this.props.session.selectedGFE].careTeamList
        .length;
      i++
    ) {
      let currentRow =
        this.props.session.gfeInfo[this.props.session.selectedGFE].careTeamList[
          i
        ];
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
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    gfeInfo[this.props.session.selectedGFE].careTeamList = [
      ...gfeInfo[this.props.session.selectedGFE].careTeamList,
      { id: newId },
    ];
    this.props.updateSessionInfo({ gfeInfo });
  };

  deleteOneCareTeam = (id) => {
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    const newCareTeamList = gfeInfo[
      this.props.session.selectedGFE
    ].careTeamList.filter((item) => item.id !== id);
    gfeInfo[this.props.session.selectedGFE].careTeamList = newCareTeamList;
    this.props.updateSessionInfo({
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
      const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
      gfeInfo[this.props.session.selectedGFE].careTeamList = gfeInfo[
        this.props.session.selectedGFE
      ].careTeamList.map((item) => {
        if (item.id === id) {
          item[fieldName] = fieldValue;

          return item;
        } else {
          return item;
        }
      });

      this.props.updateSessionInfo({ gfeInfo });
    }
  };

  addOneClaimItem = (props) => {
    //checks if the required fields are not given, if not adds to missingItems list
    const claimItemList =
      this.props.session.gfeInfo[this.props.session.selectedGFE].claimItemList;
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
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    gfeInfo[this.props.session.selectedGFE].claimItemList = [
      ...gfeInfo[this.props.session.selectedGFE].claimItemList,
      { id: newId },
    ];
    this.props.updateSessionInfo({ gfeInfo });
  };

  deleteOneClaimItem = (id) => {
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    gfeInfo[this.props.session.selectedGFE].claimItemList = gfeInfo[
      this.props.session.selectedGFE
    ].claimItemList.filter((item) => item.id !== id);
    this.props.updateSessionInfo({ gfeInfo });
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
        const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
        gfeInfo[this.props.session.selectedGFE].claimItemList.map((item) => {
          if (item.id === id) {
            item[fieldName] = fieldValue;
            return item;
          } else {
            return item;
          }
        });
        this.props.updateSessionInfo({ gfeInfo });
      } else {
        alert("Error occurred. " + errorMsg);
      }
    }
  };

  addOneDiagnosisItem = (props) => {
    //checks if the required fields are not given, if not adds to missingItems list
    const diagnosisList =
      this.props.session.gfeInfo[this.props.session.selectedGFE];
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
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    gfeInfo[this.props.session.selectedGFE].diagnosisList = [
      ...gfeInfo[this.props.session.selectedGFE].diagnosisList,
      { id: newId },
    ];
    this.props.updateSessionInfo({ gfeInfo });
  };

  deleteOneDiagnosisItem = (id) => {
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    gfeInfo[this.props.session.selectedGFE].diagnosisList =
      this.props.session.gfeInfo[
        this.props.session.selectedGFE
      ].diagnosisList.filter((item) => item.id !== id);
    this.props.updateSessionInfo({ gfeInfo });
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
      const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
      gfeInfo[this.props.session.selectedGFE].diagnosisList =
        this.props.session.gfeInfo[
          this.props.session.selectedGFE
        ].diagnosisList.map((item) => {
          if (item.id === id) {
            item[fieldName] = fieldValue;
            return item;
          } else {
            return item;
          }
        });
      this.props.updateSessionInfo({ gfeInfo });
    }
  };

  addOneProcedureItem = (props) => {
    //checks if the required fields are not given, if not adds to missingItems list
    const procedureList =
      this.props.session.gfeInfo[this.props.session.selectedGFE].procedureList;
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
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    gfeInfo[this.props.session.selectedGFE].procedureList = [
      ...gfeInfo[this.props.session.selectedGFE].procedureList,
      { id: newId },
    ];
    this.props.updateSessionInfo({ gfeInfo });
  };

  deleteOneProcedureItem = (id) => {
    const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
    gfeInfo[this.props.session.selectedGFE].procedureList =
      this.props.session.gfeInfo[
        this.props.session.selectedGFE
      ].procedureList.filter((item) => item.id !== id);
    this.props.updateSessionInfo({ gfeInfo });
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
      const gfeInfo = _.cloneDeep(this.props.session.gfeInfo);
      gfeInfo[this.props.session.selectedGFE].procedureList =
        this.props.session.gfeInfo[
          this.props.session.selectedGFE
        ].procedureList.map((item) => {
          if (item.id === id) {
            item[fieldName] = fieldValue;
            return item;
          } else {
            return item;
          }
        });
      this.props.updateSessionInfo({
        gfeInfo,
      });
    }
  };

  getCareTeamProviderListOptions() {
    const fhirServerBaseUrl = this.context.dataServer;
    const providerMap = [];
    this.props.session.practitionerList.forEach((practitioner) => {
      const name = practitioner.resource.name[0];
      providerMap.push({
        type: "Practitioner",
        display: `Practitioner - ${name.given[0]} ${name.family}`,
        resource: practitioner.resource,
        url: practitioner.fullUrl,
      });
    });
    this.props.session.practitionerRoleList.forEach((role) => {
      if (!role.practitioner?.reference) {
        return;
      }
      const practitioner = this.props.session.resolvedReferences[role.practitioner.reference];
      const organization =
        role.organization ? this.props.session.resolvedReferences[role.organization.reference] : undefined;
      const display = practitioner
        ? `${getHumanDisplayName(practitioner)} from ${organization?.name || "Unknown Organization"}`
        : "";
      providerMap.push({
        type: "PractitionerRole",
        display: `PractitionerRole - ${display}`,
        resource: role,
        url: `${fhirServerBaseUrl}/PractitionerRole/${role.id}`,
        id: role.id,
      });
    });
    this.props.session.organizationList.forEach((org) => {
      // Skip payer organizations
      if (org.resource?.type?.some(t => t?.coding?.some(c => c?.code === 'pay'))) {
        return;
      }
      providerMap.push({
        type: "Organization",
        display: `Organization - ${org.resource.name}`,
        resource: org.resource,
        url: org.fullUrl,
        id: org.resource.id,
      });
    });
    return providerMap;
  }

  getProfessionalBillingProviderList() {
    //const fhirServerBaseUrl = this.context.dataServer;
    const providerMap = [];
    /*this.props.session.practitionerRoleList.forEach((role) => {
      if (!role.practitioner?.reference) {
        return;
      }
      const practitioner = this.props.session.resolvedReferences[role.practitioner.reference];
      const organization =
        role.organization ? this.props.session.resolvedReferences[role.organization.reference] : undefined;
      const display = practitioner
        ? `${getHumanDisplayName(practitioner)} from ${organization?.name || "Unknown Organization"}`
        : "";
      providerMap.push({
        type: "PractitionerRole",
        display: `PractitionerRole - ${display}`,
        resource: role,
        reference: `PractitionerRole/${role.id}`,
        url: `${fhirServerBaseUrl}/PractitionerRole/${role.id}`,
        id: role.id,
      });
    });*/
    this.props.session.practitionerList.forEach((practitioner) => {
      const name = practitioner.resource.name[0];
      providerMap.push({
        type: "Practitioner",
        display: `Practitioner - ${name.given[0]} ${name.family}`,
        resource: practitioner.resource,
        reference: `Practitioner/${practitioner.resource.id}`,
        url: practitioner.fullUrl,
        id: practitioner.resource.id,
      });
    });
    this.props.session.organizationList.forEach((org) => {
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
    const newTabIndex = this.state.verticalTabIndex + 1;
    this.setState({ verticalTabIndex: newTabIndex });

    // if we are on the summary tab, generate the submission bundle if we have all the required information
    if (newTabIndex === 3 && (this.missingItems || []).length < 1) {
      if (this.props.setSubmissionBundle) {
        this.props.setSubmissionBundle(this.generateBundle());
      } 
    }

  }
  handleBackward() {
    this.setState({ verticalTabIndex: this.state.verticalTabIndex - 1 });
  }

  handleVerticalChange = (event, value) => {
    this.setState({ verticalTabIndex: value });
  };

  renderSectionHeader(Icon, title, accentColor, subtitle) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: subtitle ? 0.5 : 2 }}>
          <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: `${accentColor}1A`,
                color: accentColor,
                flexShrink: 0,
              }}
          >
            <Icon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: "#1E293B" }}>
              {title}
            </Typography>
            {subtitle && (
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  {subtitle}
                </Typography>
            )}
          </Box>
        </Box>
    );
  }

  render() {
    const summary = this.retrieveRequestSummary();
    const providerMap = this.getCareTeamProviderListOptions();
    const providerListOptions = providerMap.map((provider) => provider.display);
    const professionalBillingProviderList =
      this.getProfessionalBillingProviderList();
    const { classes } = this.props;

    this.checkMissingItems(summary);

    return (
      <div>
        <Modal
          open={this.state.showDeleteConfirmation}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              height: 200,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              display: "flex",
              justifyContent: "space-evenly",
              flexDirection: "column",
            }}
          >
            <Typography align="center">
              {`Are you sure you want to delete ${this.state.gfeDeletingDisplay}?`}
            </Typography>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-evenly",
              }}
            >
              <Button
                style={{ backgroundColor: "red", color: "white" }}
                variant="contained"
                onClick={() => this.handleDeleteGFE(this.state.gfeDeleting)}
              >
                Delete
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={() =>
                  this.setState({
                    gfeDeletingDisplay: null,
                    gfeDeleting: null,
                    showDeleteConfirmation: false,
                  })
                }
              >
                Cancel
              </Button>
            </div>
          </Box>
        </Modal>
        <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
              width: "100%",
            }}
        >
          {this.state.verticalTabIndex > 0 &&
            this.state.verticalTabIndex < 4 && (
                  <Box
                      sx={{
                        width: "100%",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                      }}
                  >
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
                  </Box>
            )}
          <Box
              component="form"
              onSubmit={this.handleOnSubmit}
              sx={{ flexGrow: 1, width: "100%" }}
          >
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "flex-start",
                  width: "100%",
                  minHeight: "100%",
                }}
              >
                { !this.props.embedded &&
                    <Box
                        sx={{
                          flex: "0 0 260px",
                          width: 260,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          borderRight: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                          p: 2,
                          boxSizing: "border-box",
                          position: "sticky",
                          top: 0,
                          alignSelf: "flex-start",
                          height: "100vh",
                          overflowY: "auto",
                        }}
                    >
                  <List dense={true} sx={{ width: "100%" }}>
                    <ListSubheader
                        sx={{ fontWeight: 700, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: "#94A3B8", backgroundColor: "inherit", px: 0 }}
                    >
                      Subject
                    </ListSubheader>
                    <ListItem disableGutters>
                      <ListItemButton
                        onClick={() => this.handleVerticalChange(null, 0)}
                        selected={this.state.verticalTabIndex === 0}
                        sx={{
                          borderRadius: 1.5,
                          gap: 1,
                          "&.Mui-selected": { bgcolor: "#EFF6FF" },
                        }}
                      >
                        <PersonIcon fontSize="small" sx={{ color: "#2563EB", flexShrink: 0 }} />
                        <ListItemText
                            primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                        >
                          {this.props.session.subjectInfo.selectedPatientName ||
                            "Select Patient"}
                        </ListItemText>
                      </ListItemButton>
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                    <ListSubheader
                        sx={{ fontWeight: 700, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: "#94A3B8", backgroundColor: "inherit", px: 0 }}
                    >
                      GFEs
                    </ListSubheader>
                    {Object.keys(this.props.session.gfeInfo).map(
                      (id, index) => {
                        return (
                          <ListItem key={index} disableGutters>
                            <ListItemButton
                              onClick={() => {
                                let newVti = this.state.verticalTabIndex;
                                if (
                                  this.state.verticalTabIndex === 0 ||
                                  this.state.verticalTabIndex === 4
                                ) {
                                  newVti = 1;
                                }
                                this.props.updateSessionInfo({
                                  selectedGFE: id,
                                });
                                this.setState({
                                  verticalTabIndex: newVti,
                                });
                              }}
                              selected={
                                  this.state.verticalTabIndex > 0 &&
                                  this.state.verticalTabIndex < 4 &&
                                  this.props.session.selectedGFE === id
                              }
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                borderRadius: 1.5,
                                "&.Mui-selected": { bgcolor: "#EFF6FF" },
                              }}
                            >
                              <ListItemText
                                  primaryTypographyProps={{ fontWeight: 500, fontSize: 14 }}
                              >{`GFE ${index + 1}`}</ListItemText>

                              <ListItemIcon
                                  sx={{ minWidth: "auto", justifyContent: "flex-end" }}
                              >
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      this.setState({
                                        gfeDeletingDisplay: `GFE ${index + 1}`,
                                        gfeDeleting: id,
                                        showDeleteConfirmation: true,
                                      });
                                    }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </ListItemIcon>
                            </ListItemButton>
                          </ListItem>
                        );
                      }
                    )}
                    <ListItem disableGutters>
                      <ListItemButton
                          onClick={this.handleAddGFE}
                          sx={{ borderRadius: 1.5, color: "#2563EB", gap: 1 }}
                      >
                        <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              border: "1.5px dashed #2563EB",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              lineHeight: 1,
                              flexShrink: 0,
                            }}
                        >
                          +
                        </Box>
                        <ListItemText
                            primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                        >
                          Create New GFE
                        </ListItemText>
                      </ListItemButton>
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                  </List>
                    <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          width: "100%",
                        }}
                    >
                      <Button
                        onClick={() => this.handleVerticalChange(null, 4)}
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={
                          Object.keys(this.props.session.gfeInfo).length === 0
                        }
                      >
                        Total Summary
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={this.handleOnSubmit}
                        disabled={
                          Object.keys(this.props.session.gfeInfo).length === 0
                        }
                      >
                        Submit Request
                      </Button>
                    </Box>
                </Box>
                }
                <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      p: 3,
                      boxSizing: "border-box",
                    }}
                >
                {/* Patient tab */}
                <TabPanel value={this.state.verticalTabIndex} index={0}>
                  <Box sx={{ maxWidth: 760 }}>
                    <Card
                        variant="outlined"
                        sx={{ borderRadius: 2, borderColor: "#E2E8F0", p: 3, mb: 2.5 }}
                    >
                      {this.renderSectionHeader(PersonIcon, "Patient", "#2563EB")}
                      <FormControl fullWidth sx={{ maxWidth: 420, mt: 1 }}>
                        <FormLabel className={classes.inputBox} sx={{ fontSize: 13, fontWeight: 600, color: "#475569", mb: 0.5 }}>
                          Patient *
                        </FormLabel>
                        {PatientSelect(
                            this.props.session.patientList,
                            this.props.session.subjectInfo.selectedPatient,
                            this.handleOpenPatients,
                            this.handleSelectPatient
                        )}
                      </FormControl>
                    </Card>

                    <Card
                        variant="outlined"
                        sx={{ borderRadius: 2, borderColor: "#E2E8F0", p: 3, mb: 2.5 }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1E293B", mb: 1.5 }}>
                        GFE Type
                      </Typography>
                      <RadioGroup
                          row
                          aria-label="GFE Type"
                          name="row-radio-buttons-group"
                          value={this.props.session.subjectInfo.gfeType}
                          onChange={(e) => {
                            const subjectInfo = {
                              ...this.props.session.subjectInfo,
                            };
                            subjectInfo["gfeType"] = e.target.value;
                            this.props.updateSessionInfo({ subjectInfo });
                          }}
                          defaultValue={
                            this.props.session.subjectInfo.gfeType
                          }
                          sx={{ gap: 3 }}
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
                    </Card>

                    <Card
                        variant="outlined"
                        sx={{ borderRadius: 2, borderColor: "#E2E8F0", p: 3, mb: 2.5 }}
                    >
                      {this.renderSectionHeader(
                          AssignmentIndIcon,
                          "Submitting Provider *",
                          "#0D9488",
                          "The practitioner or organization submitting this estimate"
                      )}
                      <FormControl fullWidth sx={{ maxWidth: 420, mt: 1.5 }}>
                        {this.props.session.subjectInfo.gfeType ===
                        "professional"
                            ? ProfessionalBillingProviderSelect(
                                professionalBillingProviderList,
                                this.props.session.subjectInfo
                                    .selectedSubmitter,
                                this.handleSelectSubmitter,
                                "submittingProvider"
                            )
                            : OrganizationSelect(
                                this.props.session.organizationList,
                                this.props.session.subjectInfo
                                    .selectedSubmitter,
                                "submitting-provider-label",
                                "submittingProvider",
                                this.handleOpenOrganizationList,
                                this.handleSelectSubmitter,
                                "submitting"
                            )}
                      </FormControl>
                    </Card>

                    <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderColor: "#E2E8F0",
                          p: 3,
                          width: "75vw",
                          boxSizing: "border-box",
                          "& table": { width: "100%", borderCollapse: "collapse" },
                          "& td, & th": {
                            padding: "6px 10px",
                            fontSize: 14,
                            borderBottom: "1px solid #F1F5F9",
                            textAlign: "left",
                          },
                          "& .MuiGrid-container": { rowGap: 1 },
                          "& .MuiGrid-item": { paddingTop: "4px", paddingBottom: "4px" },
                        }}
                    >
                      {this.renderSectionHeader(
                          BusinessIcon,
                          "Demographics & Insurance",
                          "#F59E0B",
                          "Pulled automatically from the selected patient's record"
                      )}
                      <Divider sx={{ my: 2 }} />
                      <GFERequestSummary summary={summary} />
                    </Card>
                  </Box>
                  <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 3,
                      }}
                  >
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
                  </Box>
                </TabPanel>

                {/* Care Team tab */}
                {Object.keys(this.props.session.gfeInfo).length > 0 &&
                    this.props.session.selectedGFE && (
                        <>
                        <TabPanel value={this.state.verticalTabIndex} index={1}>
                          <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "stretch",
                                gap: 2.5,
                                maxWidth: 1180,
                              }}
                          >
                            <Card
                                variant="outlined"
                                sx={{
                                  borderRadius: 2,
                                  borderColor: "#E2E8F0",
                                  p: 3,
                                  width: "100%",
                                  boxSizing: "border-box",
                                }}
                            >
                              {this.renderSectionHeader(
                                  LocalHospitalIcon,
                                  "Billing Provider *",
                                  "#2563EB",
                                  "The rendering provider or facility billing for this GFE"
                              )}
                              <FormControl fullWidth sx={{ maxWidth: 420, mt: 1.5 }}>
                                {this.props.session.subjectInfo.gfeType ===
                                "professional"
                                    ? ProfessionalBillingProviderSelect(
                                        professionalBillingProviderList,
                                        this.props.session.gfeInfo[
                                            this.props.session.selectedGFE
                                            ].selectedBillingProvider,
                                        this.handleSelectBillingProvider,
                                        "billingProvider"
                                    )
                                    : OrganizationSelect(
                                        this.props.session.organizationList,
                                        this.props.session.gfeInfo[
                                            this.props.session.selectedGFE
                                            ].selectedBillingProvider,
                                        "billing-provider-label",
                                        "billingProvider",
                                        this.handleOpenOrganizationList,
                                        this.handleSelectBillingProvider,
                                        "billing"
                                    )}
                              </FormControl>
                            </Card>

                            <Card
                                variant="outlined"
                                sx={{
                                  borderRadius: 2,
                                  borderColor: "#E2E8F0",
                                  p: 3,
                                  width: "100%",
                                  boxSizing: "border-box",
                                }}
                            >
                                {this.renderSectionHeader(
                                    GroupsIcon,
                                    "Care Team",
                                    "#7C3AED",
                                    "Everyone involved in delivering this episode of care"
                                )}
                              <Box
                                  sx={{
                                    width: "100%",
                                    backgroundColor: "#FFFFFF",
                                    border: "1px solid #EEF2F6",
                                    borderRadius: 1.5,
                                    overflow: "hidden",
                                    boxSizing: "border-box",
                                  }}
                              >
                                <CareTeam
                                    rows={
                                      this.props.session.gfeInfo[
                                          this.props.session.selectedGFE
                                          ].careTeamList
                                    }
                                    providerList={providerListOptions}
                                    addOne={this.addOneCareTeam}
                                    edit={this.editCareTeam}
                                    deleteOne={this.deleteOneCareTeam}
                                />
                              </Box>
                            </Card>
                          </Box>
                          <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 3,
                              }}
                          >
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
                          </Box>
                        </TabPanel>
                        <TabPanel value={this.state.verticalTabIndex} index={2}>
                          <Box sx={{ maxWidth: 1100 }}>
                            <Box sx={{ mb: 2.5 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E293B" }}>
                                Service Details
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#64748B" }}>
                                Priority, diagnoses, procedures, and billable services for this GFE
                              </Typography>
                            </Box>
                            <Card
                                variant="outlined"
                                sx={{ borderRadius: 2, borderColor: "#E2E8F0", p: 3, mb: 2.5 }}
                            >
                              {this.renderSectionHeader(
                                  PriorityHighIcon,
                                  "Priority *",
                                  "#EA580C"
                              )}
                                  <FormControl fullWidth sx={{ maxWidth: 420 }}>
                                    <FormLabel className={classes.inputBox}>
                                      Priority:*{" "}
                                    </FormLabel>
                                    {PrioritySelect(
                                        this.props.session.priorityList,
                                        this.props.session.gfeInfo[
                                            this.props.session.selectedGFE
                                            ].selectedPriority,
                                        this.handleOpenPriority,
                                        this.handleSelectPriority
                                    )}
                                  </FormControl>
                                </Card>
                            <Card
                                variant="outlined"
                                sx={{ borderRadius: 2, borderColor: "#E2E8F0", p: 3, mb: 2.5 }}
                            >
                              {this.renderSectionHeader(
                                  MedicalInformationIcon,
                                  "Diagnosis & Billing Info",
                                  "#DB2777",
                                  "Encounter diagnoses and, for institutional GFEs, type of bill"
                              )}
                              <Grid container direction="row" spacing={4} sx={{ mt: 0.5 }}>
                                <Grid item xs={12} md={7}>
                                  <FormLabel
                                      className={classes.smallerHeader}
                                      sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}
                                  >
                                    Diagnosis *
                                        </FormLabel>
                                        <Box
                                            sx={{
                                              width: "100%",
                                              backgroundColor: "#FFFFFF",
                                              border: "1px solid #EEF2F6",
                                              borderRadius: 1.5,
                                              overflow: "hidden",
                                              mt: 1,
                                            }}
                                        >
                                          <DiagnosisItem
                                              rows={
                                                this.props.session.gfeInfo[
                                                    this.props.session.selectedGFE
                                                    ].diagnosisList
                                              }
                                              addOne={this.addOneDiagnosisItem}
                                              edit={this.editDiagnosisItem}
                                              deleteOne={
                                                this.deleteOneDiagnosisItem
                                              }
                                          />
                                        </Box>
                                </Grid>
                                <Grid item xs={12} md={5}>
                                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                    <Box>
                                      <FormLabel sx={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", mb: 1 }}>
                                        Type of Bill{this.props.session.subjectInfo.gfeType === "institutional" ? " *" : ""}
                                      </FormLabel>
                                      <Select
                                          displayEmpty
                                          id="supportingInfoTypeOfBill"
                                          onChange={this.handleSupportingInfoTypeOfBill}
                                          size="small"
                                          fullWidth
                                          sx={{ maxWidth: 280 }}
                                          value={
                                            this.props.session.gfeInfo[
                                                this.props.session.selectedGFE
                                                ].supportingInfoTypeOfBill
                                          }
                                      >
                                        <MenuItem value="">
                                          <em>Select type of bill</em>
                                        </MenuItem>
                                        {TypeOfBillList.map((typeOfBill) => (
                                          <MenuItem key={typeOfBill.code} value={typeOfBill.code}>
                                            {typeOfBill.code} - {typeOfBill.display}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </Box>

                                        <Box>
                                          <FormLabel sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                                            Inter Transaction Identifier
                                          </FormLabel>
                                          <Select
                                              displayEmpty
                                              id="select-inter-trans-id"
                                              value={
                                                this.props.session.gfeInfo[
                                                    this.props.session.selectedGFE
                                                    ].interTransIntermediary
                                              }
                                              label="Inter Trans Identifier"
                                              onChange={
                                                this.handleSelectInterTransId
                                              }
                                              size="small"
                                              fullWidth
                                              sx={{ mt: 0.5, maxWidth: 280, display: "block" }}
                                          >
                                            <MenuItem value="InterTransID0001">
                                              InterTransID0001
                                            </MenuItem>
                                          </Select>
                                      </Box>
                                    </Box>
                                  </Grid>
                                </Grid>
                          </Card>
                          <Card
                              variant="outlined"
                              sx={{ borderRadius: 2, borderColor: "#E2E8F0", p: 3 }}
                          >
                            {this.renderSectionHeader(
                                ReceiptLongIcon,
                                "Procedures & Services",
                                "#059669",
                                "Line items that make up the estimate"
                            )}
                            <Grid container direction="row" spacing={4} sx={{ mt: 0.5 }}>
                                    <Grid item xs={12}>
                                        <FormLabel
                                            className={classes.smallerHeader}
                                            sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}
                                        >
                                          Procedure:
                                        </FormLabel>
                                        <Box
                                            sx={{
                                              width: "100%",
                                              backgroundColor: "#FFFFFF",
                                              border: "1px solid #EEF2F6",
                                              borderRadius: 1.5,
                                              overflow: "hidden",
                                              mt: 1,
                                            }}
                                        >
                                          <ProcedureItem
                                              rows={
                                                this.props.session.gfeInfo[
                                                    this.props.session.selectedGFE
                                                    ].procedureList
                                              }
                                              addOne={this.addOneProcedureItem}
                                              edit={this.editProcedureItem}
                                              deleteOne={
                                                this.deleteOneProcedureItem
                                              }
                                          />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormLabel
                                            className={classes.smallerHeader}
                                            sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}
                                        >
                                          Services *
                                        </FormLabel>
                                        <Box
                                            sx={{
                                              width: "100%",
                                              backgroundColor: "#FFFFFF",
                                              border: "1px solid #EEF2F6",
                                              borderRadius: 1.5,
                                              overflow: "hidden",
                                              mt: 1,
                                              overflowX: "auto",
                                            }}
                                        >
                                          <ClaimItem
                                              rows={
                                                this.props.session.gfeInfo[
                                                    this.props.session.selectedGFE
                                                    ].claimItemList
                                              }
                                              addOne={this.addOneClaimItem}
                                              edit={this.editClaimItem}
                                              deleteOne={this.deleteOneClaimItem}
                                              posRequired={this.props.session.subjectInfo.gfeType === "professional"}
                                          />
                                        </Box>
                            </Grid>
                        </Grid>
                                </Card>
                          </Box>
                          <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 3,
                              }}
                          >
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
                          </Box>
                        </TabPanel>
                          {/* Summary tab*/}
                          <TabPanel value={this.state.verticalTabIndex} index={3}>
                            <Grid item className={classes.paper} xs={12}>
                              <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Typography variant="h6" fontWeight="bold">
                                  Summary
                                </Typography>
                                <ViewGFERequestDialog
                                    generateRequest={this.generateRawGfeBundle}
                                />
                              </Box>

                              <SummaryItem summary={summary} missingItems={this.missingItems} />
                            </Grid>
                            <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mt: 3,
                                }}
                            >
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
                              {
                                  !this.props.disableGfeSubmit &&
                                  <Button
                                      loading
                                      variant="contained"
                                      color="primary"
                                      type="submit"
                                      disabled={this.props.submittingStatus === true || (!!this.missingItems && this.missingItems.length > 0)}
                                  >
                                    Submit GFE
                                  </Button>
                              }
                            </Box>
                          </TabPanel>
                        </>
                    )}
                {/* Total Summary Tab */}
                <TabPanel value={this.state.verticalTabIndex} index={4}>
                  <Box sx={{ maxWidth: 1000 }}>
                    <Box sx={{ mb: 2 }}>
                      <ViewGFERequestDialog
                          generateRequest={this.generateRawGfeBundle}
                      />
                    </Box>
                    <TotalSummaryGFEs
                        subject={this.props.session.subjectInfo}
                        summaries={this.props.session.gfeInfo}
                    ></TotalSummaryGFEs>
                  </Box>
                </TabPanel>
              </Box>
            </Box>
          </Box>
          {this.state.openErrorDialog ? (
              <ViewErrorDialog
                  open={this.state.openErrorDialog}
                  setOpen={(open) => this.setState({ openErrorDialog: open })}
                  error={this.state.error}
              />
          ) : null}
          {this.state.submittingStatus === true ? (
              <Box sx={{ width: "100%" }}>
                <LinearProgress />
              </Box>
          ) : null}
        </Box>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(GFERequestBox);