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
  TextField,
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
import moment from "moment";
import WestIcon from "@mui/icons-material/West";
import EastIcon from "@mui/icons-material/East";
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

class GFERequestBox extends Component {
  constructor(props) {
    super(props);

    this.initialState = {
      temporaryBillTypeInfo: "",
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
    fetchProviders();
  }

  resetState = () => {
    this.setState({
      ...this.initialState,
    });
  };

  handleOpenPatients = () => {
    getPatients(this.props.ehrUrl).then((result) => {
      const patients = result.entry;
      this.props.updateSessionInfo({ patientList: patients });
    });
  };

  handleOpenPriority = () => {
    getClaims(this.props.ehrUrl).then((result) => {
      const priority = result.entry;

      this.props.updateSessionInfo({ priorityList: priority });
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
      for (let i = 0; i < this.props.session.patientList.length; i++) {
        if (patientId === this.props.session.patientList[i].resource.id) {
          if (this.props.session.patientList[i].resource.name[0].text) {
            patientName =
              this.props.session.patientList[i].resource.name[0].text;
          } else
            patientName = `${this.props.session.patientList[i].resource.name[0].given[0]} ${this.props.session.patientList[i].resource.name[0].family}`;
        }
      }
      if (addressText && addressText.length > 0) {
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
    getOrganizations(this.props.ehrUrl).then((result) => {
      this.props.updateSessionInfo({
        organizationList: result.entry,
      });
    });

    getLocations(this.props.ehrUrl).then((result) =>
      this.props.updateSessionInfo({ locationList: result.entry })
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
    this.props.updateSessionInfo({
      subjectInfo: {
        ...this.props.session.subjectInfo,
        selectedSubmitter: e.target.value,
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

    const fhirServerBaseUrl = this.props.ehrUrl;
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

    let insurerOrgRef = `Organization/${this.props.session.subjectInfo.selectedPayor.id}`;
    input.insurer = {
      reference: insurerOrgRef,
      resource: this.props.session.subjectInfo.selectedPayor,
    };

    orgReferenceList.push(insurerOrgRef);
    input.bundleResources.push({
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
      if(findProfessionalProvider.type === "Practitioner")
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
              display: "General Practice"
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
                  "http://terminology.hl7.org/CodeSystem/ex-diagnosistype",
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
        input.supportingInfo.push({
          sequence: supportingInfoSequence++,
          category: categoryCodeableConcept("typeofbill").codeableConcept,
          code: {
            coding: [
              {
                system: "https://www.nubc.org/CodeSystem/TypeOfBill",
                code: this.props.session.gfeInfo[gfeId]
                  .supportingInfoTypeOfBill,
                display: "Type of Bill",
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
    });
    //const { valid, error } = this.isRequestValid();
    const error = [];
    const valid = true;

    if (valid) {
      this.props.setSubmitting(true);
      this.props.setGfeSubmitted(true);
      this.props.setGfeResponse(undefined);
      this.props.setReceivedAEOBResponse(undefined);

      const submissionBundle = this.generateBundle();
      this.props.addToLog(
        `Submitting GFE to ${this.props.payorUrl}/Claim/$gfe-submit`,
        "network",
        submissionBundle
      );

      submitGFEClaim(this.props.payorUrl, submissionBundle)
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
        submissionError: error,
      });
    }
  };

  generateBundle = () => {
    const ri = Object.keys(this.props.session.gfeInfo).map((gfeId) =>
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
        this.missingItems.push("diagnosis");
      }
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
      this.props.session.diagnosisList.filter((item) => item.id !== id);
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
    const fhirServerBaseUrl = this.props.ehrUrl;
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
      const practitioner =
        this.props.session.resolvedReferences[role.practitioner.reference];
      const organization =
        this.props.session.resolvedReferences[role.organization.reference];
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
    this.props.session.organizationList.forEach((org) => {
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
    this.props.session.practitionerRoleList.forEach((role) => {
      const practitioner =
        this.props.session.resolvedReferences[role.practitioner.reference];
      const organization =
        this.props.session.resolvedReferences[role.organization.reference];
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
        <Grid container space={0} justifyContent="center">
          {this.state.verticalTabIndex > 0 &&
            this.state.verticalTabIndex < 4 && (
              <Tabs
                value={this.state.verticalTabIndex - 1}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
                sx={{ width: "100vw" }}
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
          <form onSubmit={this.handleOnSubmit}>
            <Box>
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
                    padding: "10px",
                  }}
                >
                  <List dense={true}>
                    <ListSubheader
                      sx={{ fontWeight: "bold", backgroundColor: "inherit" }}
                    >
                      Subject
                    </ListSubheader>
                    <ListItem>
                      <ListItemButton
                        onClick={() => this.handleVerticalChange(null, 0)}
                        selected={this.state.verticalTabIndex === 0}
                      >
                        <ListItemText>
                          {this.props.session.subjectInfo.selectedPatientName ||
                            "Select Patient"}
                        </ListItemText>
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListSubheader
                      sx={{ fontWeight: "bold", backgroundColor: "inherit" }}
                    >
                      GFEs
                    </ListSubheader>
                    {Object.keys(this.props.session.gfeInfo).map(
                      (id, index) => {
                        return (
                          <ListItem key={index}>
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
                              sx={{ justifyContent: "space-between" }}
                            >
                              <ListItemText>{`GFE ${index + 1}`}</ListItemText>

                              <ListItemIcon sx={{ justifyContent: "flex-end" }}>
                                <IconButton
                                  onClick={() =>
                                    this.setState({
                                      gfeDeletingDisplay: `GFE ${index + 1}`,
                                      gfeDeleting: id,
                                      showDeleteConfirmation: true,
                                    })
                                  }
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemIcon>
                            </ListItemButton>
                          </ListItem>
                        );
                      }
                    )}
                    <ListItem>
                      <ListItemButton onClick={this.handleAddGFE}>
                        <ListItemText>Create New GFE</ListItemText>
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                  </List>
                  <List>
                    <ListItem>
                      <Button
                        onClick={() => this.handleVerticalChange(null, 4)}
                        variant="contained"
                        color="primary"
                        disabled={
                          Object.keys(this.props.session.gfeInfo).length === 0
                        }
                      >
                        Total Summary
                      </Button>
                    </ListItem>
                    <ListItem>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleOnSubmit}
                        disabled={
                          Object.keys(this.props.session.gfeInfo).length === 0
                        }
                      >
                        Submit Request
                      </Button>
                    </ListItem>
                  </List>
                </Box>
                <Divider orientation="vertical" />
                {/* Patient tab */}
                <TabPanel value={this.state.verticalTabIndex} index={0}>
                  <Grid item>
                    <Grid container direction="column">
                      <Grid item className={classes.paper}>
                        <FormControl>
                          <FormLabel className={classes.inputBox}>
                            Patient *
                          </FormLabel>
                          {PatientSelect(
                            this.props.session.patientList,
                            this.props.session.subjectInfo.selectedPatient,
                            this.handleOpenPatients,
                            this.handleSelectPatient
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item className={classes.paper}>
                        <FormControl>
                          <Grid color="primary">
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
                {Object.keys(this.props.session.gfeInfo).length > 0 &&
                  this.props.session.selectedGFE && (
                    <>
                      <TabPanel value={this.state.verticalTabIndex} index={1}>
                        <Grid item>
                          <Card
                            variant="outlined"
                            className={classes.cardCareTeam}
                          >
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
                              </Grid>

                              <Grid
                                item
                                className={classes.smallerPaddingPaper}
                              >
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

                      <TabPanel value={this.state.verticalTabIndex} index={2}>
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
                                    this.props.session.priorityList,
                                    this.props.session.gfeInfo[
                                      this.props.session.selectedGFE
                                    ].selectedPriority,
                                    this.handleOpenPriority,
                                    this.handleSelectPriority
                                  )}
                                </FormControl>
                              </Grid>
                              <Grid item className={classes.paper}>
                                <Grid container direction="row" spacing={3}>
                                  <Grid item>
                                    <FormControl>
                                      <FormLabel
                                        className={classes.smallerHeader}
                                      >
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
                                    </FormControl>
                                  </Grid>
                                  <Grid item>
                                    <Grid
                                      container
                                      direction="column"
                                      spacing={3}
                                    >
                                      <Grid item>
                                        <FormLabel>Type of Bill</FormLabel>
                                      </Grid>
                                      <Grid item className={classes.inputBox}>
                                        <TextField
                                          id="supportingInfoTypeOfBill"
                                          variant="standard"
                                          value={
                                            this.props.session.gfeInfo[
                                              this.props.session.selectedGFE
                                            ].temporaryBillTypeInfo
                                          }
                                          onChange={(e) => {
                                            this.setState({
                                              temporaryBillTypeInfo:
                                                e.target.value,
                                            });
                                          }}
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
                                            this.props.session.gfeInfo[
                                              this.props.session.selectedGFE
                                            ].interTransIntermediary
                                          }
                                          label="Inter Trans Identifier"
                                          onChange={
                                            this.handleSelectInterTransId
                                          }
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
                                      <FormLabel
                                        className={classes.smallerHeader}
                                      >
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
                                    </FormControl>
                                  </Grid>
                                  <Grid item>
                                    <FormControl>
                                      <FormLabel
                                        className={classes.smallerHeader}
                                      >
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
                                            this.props.session.gfeInfo[
                                              this.props.session.selectedGFE
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
                      <TabPanel value={this.state.verticalTabIndex} index={3}>
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
                              <SummaryItem summary={summary} missingItems={this.missingItems} />
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
                              disabled={this.props.submittingStatus === true || (!!this.missingItems && this.missingItems.length > 0)}
                            >
                              Submit GFE
                            </Button>
                          </Grid>
                        </Grid>
                      </TabPanel>
                    </>
                  )}
                {/* Total Summary Tab */}
                <TabPanel value={this.state.verticalTabIndex} index={4}>
                  <Grid item className={classes.paper} xs={12}>
                    <FormControl component="fieldset">
                      <Grid container direction="row">
                        <Grid item>
                          <Grid item xs={2}>
                            <ViewGFERequestDialog
                              generateRequest={this.generateBundle}
                            />
                          </Grid>
                          <TotalSummaryGFEs
                            subject={this.props.session.subjectInfo}
                            summaries={this.props.session.gfeInfo}
                          ></TotalSummaryGFEs>
                        </Grid>
                      </Grid>
                    </FormControl>
                  </Grid>
                </TabPanel>
              </Box>
            </Box>
          </form>
          {this.state.openErrorDialog ? (
            <ViewErrorDialog
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
