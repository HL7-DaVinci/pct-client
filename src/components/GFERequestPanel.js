import React, { Component } from 'react';
import {
    Box, Button,
    FormLabel, FormControl, FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Typography,
    withStyles,
    CircularProgress,
    LinearProgress
} from '@material-ui/core';

import {
    getPatients, getDeviceRequestsForPatient, submitGFEClaim, getCoverage,
    getPractitionerRoles, getOrganizations, getCoverageByPatient, getPractitioners,
    getLocations
} from '../api'

import GFERequestSummary from './GFERequestSummary'
import buildGFEBundle from './BuildGFEBundle';
import ViewGFERequestDialog from './ViewGFEDialog';
import { PlaceOfServiceList } from '../values/PlaceOfService';
import CareTeam, { columns as CareTeamColumns } from './CareTeam';
import ClaimItem, { columns as ClaimItemColumns } from './ClaimItem';
import { ProcedureCodes } from '../values/ProcedureCode';
import DiagnosisItem, { columns as DiagnosisColumns } from './DiagnosisItem';
import SupportingInfoItem, { columns as SupportingInfoColumns } from './SupportingInfoItem';
import { SupportingInfoType } from '../values/SupportingInfo';
import { DiagnosisList, DiagnosisTypeList } from '../values/DiagnosisList';
import { RevenueCodeList } from '../values/RevenueCodeList';
import ViewErrorDialog from './ViewErrorDialog';


const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(1),
        textAlign: 'left',
        color: theme.palette.text.secondary,
        marginLeft: 30,
        marginRight: 20
    },
    block: {
        // marginLeft: 30,
        //marginTop: 20,
        backgroundColor: "white"
    },
    rightButton: {
        marginLeft: "auto"
    },
    title: {
        textAlign: "center",
        width: "100%"
    },
    blockHeader: {
        backgroundColor: "#d7d3d3",
        //width: "100%"
    }
});

const getPatientDisplayName = patient => {
    if (patient === undefined) return null;
    const name = patient.resource.name[0];
    if (name.text != null) return name.text;
    else return `${name.given[0]} ${name.family}`;
}

const PatientSelect = (patients, selectPatient, handleOpenPatients, handleChange) => {
    return (<Select required labelId="select-patient-label" id="patient" value={selectPatient} onOpen={handleOpenPatients} onChange={handleChange}>
        {
            patients ?
                patients.map((patient) => {
                    return (<MenuItem key={patient.resource.id} value={patient.resource.id}>{getPatientDisplayName(patient)}</MenuItem>);
                }) : (<MenuItem />)

        }
    </Select>);
}

const RequestSelect = (requests, currentValue, handleOpenRequestList, handleSelectRequest) =>
    <Select labelId="select-request-label" id="request" value={currentValue || ''} onOpen={handleOpenRequestList} onChange={handleSelectRequest}>
        {
            requests ? (requests.map((request) => {
                var requestCode = '';
                if (request.resourceType === 'DeviceRequest') {
                    const coding = request.codeCodeableConcept.coding[0];
                    requestCode = `${coding.code} ${coding.display}`;
                }
                return (<MenuItem key={request.id} value={request.id}>{requestCode}</MenuItem>)
            })) : <MenuItem />
        }
    </Select>

const PractitionerSelect = (practitioners, currentValue, handleOpenPractitionerList, handleSelectPractitioner) =>
    <Select labelId="select-practitioner-label" id="practitioner" value={currentValue || ''} multiple onOpen={handleOpenPractitionerList} onChange={handleSelectPractitioner}>
        {
            practitioners ? (practitioners.map((practitioner) => {
                const name = practitioner.resource.name[0]
                var display = `${name.given[0]} ${name.family}`;

                return (<MenuItem key={practitioner.resource.id} value={practitioner.resource.id}>{display}</MenuItem>)
            })) : <MenuItem />
        }
    </Select>

const OrganizationSelect = (organizations, label, id, handleOpen, handleSelect) =>
    <Select required labelId={label} id={id} onOpen={handleOpen} onChange={handleSelect}>
        {
            organizations ? (organizations.map((org) => {
                return (<MenuItem key={org.resource.id} value={org.resource.id}>{org.resource.name}</MenuItem>)
            })) : <MenuItem />
        }
    </Select>

const PractitionerRoleSelect = (roles, handleOpenPractitionerRoleList, handleSelect, references) =>
    <Select required labelId="select-billing-provider-label" id="request" onOpen={handleOpenPractitionerRoleList} onChange={handleSelect}>
        {
            roles ? (roles.map((role) => {
                const practitioner = references[role.practitioner.reference];
                const organization = references[role.organization.reference];
                const display = practitioner ? `${practitioner.name[0].text} from ${organization.name}` : "";
                return (<MenuItem key={role.id} value={role.id}>PractitionerRole: {display}</MenuItem>)
            })) : <MenuItem />
        }
    </Select>

const PlaceOfServiceSelect = (handleChange) =>
    <Select required labelId="select-place-of-service" id="placeOfService" onChange={handleChange}>
        {
            PlaceOfServiceList.map((pos) => {
                return (<MenuItem key={pos.code} value={pos.code}>{pos.name}</MenuItem>);
            })
        }
    </Select>

class GFERequestBox extends Component {


    constructor(props) {
        super(props);
        this.initialState = {
            patientList: [],
            patientRequestList: [],
            practitionerRoleList: [],
            selectedPatient: undefined,
            selectedRequest: undefined,
            patientSelected: false,
            organizationList: [],
            selectedBillingProvider: undefined,
            selectedSubmitter: undefined,
            selectedPayor: undefined,
            resolvedReferences: {},
            totalClaim: 0,
            placeOfService: undefined,
            interTransIntermediary: undefined,
            selectedDate: undefined,
            selectedProcedure: undefined,
            selectedPractitioner: [],
            practitionerList: [],
            selectedCoverage: undefined,
            selectedDiagnosis: undefined,
            gfeServiceId: undefined,
            providerList: [],
            careTeamList: [{ id: 1 }],
            claimItemList: [{ id: 1 }],
            diagnosisList: [{ id: 1 }],
            supportingInfoList: [{ id: 1 }],
            supportingInfoType: "typeofbill",
            validationErrors: undefined,
            openErrorDialog: false
        };
        this.state = this.initialState;
    }

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
                    getOrganizations(this.props.ehrUrl)
                ]);
                const data = await Promise.all(res.map(r => {
                    console.log(r);
                    if (r.data && r.data[0] && r.data[0].resourceType === "PractitionerRole") {
                        let references = Object.assign(this.state.resolvedReferences);
                        for (const property in r.references) {
                            if (!(property in references)) {
                                references[property] = r.references[property]
                            }
                        }
                        this.setState({
                            practitionerRoleList: r.data,
                            resolvedReferences: references
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
                                        practitionerList: r.entry
                                    });
                                    console.log("----- Finished getting practitioner.");
                                    break;
                                case "Organization":
                                    this.setState({
                                        organizationList: r.entry
                                    })
                                    console.log("----- Finished getting organization.");
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }));
                console.log("");
            } catch (e) {
                console.error("Exception", e);
                throw Error("Promise failed");
            }
        };
        fetchProviders();
        console.log("--- after fetching provider ");
    }

    resetState = () => {
        this.setState({
            ...this.initialState
        });
    }

    handleOpenPatients = () => {
        getPatients(this.props.ehrUrl)
            .then(result => {
                const patients = result.entry;
                this.setState({ ...this.state, patientList: patients });
            });
    }

    handleSelectPatient = e => {
        const patientId = e.target.value;
        this.setState({
            selectedPatient: patientId
        })

        // retrieve coverage and payer info about patient 
        getCoverageByPatient(this.props.ehrUrl, patientId)
            .then(result => {
                console.log(" Coverage ", result);
                if (result.data && result.data.length > 0) {
                    getCoverage(this.props.ehrUrl, result.data[0].id)
                        .then(coverageResult => {
                            console.log(coverageResult);
                            const reference = Object.keys(coverageResult.references)[0]
                            const resource = coverageResult.references[reference]

                            this.setState({
                                selectedPayor: resource,
                                selectedCoverage: coverageResult.data,
                                selectedProcedure: undefined,
                                selectedRequest: undefined
                            });
                        })
                } else {
                    console.log("couldn't retrieve patient's coverage and payor info");
                }
            })

        this.setState({
            patientSelected: true
        })
    }

    handleOpenRequestList = e => {
        getDeviceRequestsForPatient(this.props.ehrUrl, this.state.selectedPatient)
            .then(result => {
                let newReferenceList = Object.assign(this.state.resolvedReferences);
                for (const property in result.references) {
                    if (!(property in newReferenceList)) {
                        newReferenceList[property] = result.references[property];
                    }
                }

                let newRequestList = [];
                result.data.forEach(item => {
                    if (this.state.patientRequestList.find(request => request.id === item.id) === undefined) {
                        newRequestList.push(item);
                    }
                })
                this.setState({
                    ...this.state,
                    patientRequestList: this.state.patientRequestList.concat(newRequestList),
                    resolvedReferences: newReferenceList
                })
            }).catch(e => console.log(e));
    }

    handleSelectRequest = e => {
        const requestId = e.target.value;

        const { coverage } = this.getRequestRelatedInfo(requestId);

        getCoverage(this.props.ehrUrl, coverage.id)
            .then(result => {
                const reference = Object.keys(result.references)[0]
                const resource = result.references[reference]

                this.setState({
                    ...this.state,
                    selectedPayor: resource,
                    selectedRequest: requestId,
                    selectedProcedure: undefined
                });
            }).catch(error =>
                console.log(error)
            );
    }

    handleOpenPractitionerRoleList = e => {
        getPractitionerRoles(this.props.ehrUrl)
            .then(result => {
                let references = Object.assign(this.state.resolvedReferences);
                for (const property in result.references) {
                    if (!(property in references)) {
                        references[property] = result.references[property]
                    }
                }
                this.setState({
                    ...this.state,
                    practitionerRoleList: result.data,
                    resolvedReferences: references
                });
            })
    }

    handleSelectBillingProvider = e => {
        this.setState({
            selectedBillingProvider: e.target.value
        })
    }

    handleOpenPractitionerList = e => {
        getPractitioners(this.props.ehrUrl)
            .then(result => {
                this.setState({
                    practitionerList: result.entry
                });
            });
    }

    handleSelectPractitioner = e => {
        this.setState({
            ...this.state,
            selectedPractitioner: e.target.value
        })

    }

    handleOpenOrganizationList = e => {
        getOrganizations(this.props.ehrUrl)
            .then(result => {
                this.setState({
                    ...this.state,
                    organizationList: result.entry
                })
            });

        getLocations(this.props.ehrUrl)
            .then(result => this.setState({ locationList: result.entry }));

    }

    handleSelectSubmitter = e => {
        this.setState({
            ...this.state,
            selectedSubmitter: e.target.value
        })
    }

    handleSelectProcedure = e => {
        this.setState({
            selectedProcedure: e.target.value,
            selectedRequest: null
        })
    }
    getRequestRelatedInfo = (requestId) => {
        if (!requestId) {
            return {}
        }
        if (requestId) {
            const request = this.state.patientRequestList.filter(request => request.id === requestId)[0];
            if (request === undefined) {
                return {};
            }

            let requestCode;
            if (request.resourceType === 'DeviceRequest') {
                const coding = request.codeCodeableConcept.coding[0];
                const codeSystem = coding.system.slice(coding.system.lastIndexOf('/') + 1).toUpperCase();
                requestCode = `${codeSystem} ${coding.code} ${coding.display}`;
            }

            let coverage = undefined;
            let practitioner = undefined;
            if (request.resourceType === 'DeviceRequest') {
                coverage = request.insurance !== undefined ? this.state.resolvedReferences[request.insurance[0].reference] : undefined;
                practitioner = this.state.resolvedReferences[request.performer.reference];
            }
            return {
                request,
                requestCode,
                coverage,
                practitioner,
            }
        }
    }

    getClaimDetails = () => {
        if (this.state.selectedRequest) {
            return this.getRequestRelatedInfo(this.state.selectedRequest);
        } else if (this.state.selectedProcedure) {
            let code = {
                "coding": [
                    {
                        "system": "http://www.ama-assn.org/go/cpt",
                        "code": this.state.selectedProcedure
                    }
                ]
            };
            return {
                request: this.state.selectedProcedure,
                requestCode: code,
                coverage: this.state.selectedCoverage,
                practitioner: this.state.selectedPractitioner
            }
        } else {
            return {
                coverage: this.state.selectedCoverage
            };
        }

    }


    generateRequestInput = () => {
        let input = {
            bundleResources: []
        };

        if (this.state.selectedPatient === undefined && this.state.selectedRequest === undefined) {
            return input;
        }

        let orgReferenceList = [];
        input.gfeType = this.props.gfeType;

        const fhirServerBaseUrl = this.props.ehrUrl;

        input.patient = {
            reference: `Patient/${this.state.selectedPatient}`,
            resource: this.state.patientList.filter(patient => patient.resource.id === this.state.selectedPatient)[0].resource
        }

        input.bundleResources.push({
            fullUrl: `${fhirServerBaseUrl}/${input.patient.reference}`,
            entry: input.patient.resource
        })

        const { request, coverage, practitioner, requestCode } = this.getClaimDetails();

        input.request = {
            resource: request,
            coverage: {
                reference: `Coverage/${coverage.id}`,
                resource: coverage
            }
        }

        input.bundleResources.push({
            fullUrl: `${fhirServerBaseUrl}/${input.request.coverage.reference}`,
            entry: input.request.coverage.resource
        })

        /* if (input.request.practitioner) {
             input.bundleResources.push({
                 fullUrl: `${fhirServerBaseUrl}/${input.request.practitioner.reference}`,
                 entry: input.request.practitioner.resource
             })
         }*/
        let insurerOrgRef = `Organization/${this.state.selectedPayor.id}`;
        input.insurer = {
            reference: insurerOrgRef,
            resource: this.state.selectedPayor
        }

        orgReferenceList.push(insurerOrgRef)
        input.bundleResources.push({
            fullUrl: `${fhirServerBaseUrl}/${input.insurer.reference}`,
            entry: input.insurer.resource
        })

        let providerReference = this.props.gfeType === "professional" ? `PractitionerRole/${this.state.selectedBillingProvider}` : `Organization/${this.state.selectedBillingProvider}`
        input.provider = {
            reference: providerReference,
            resource: this.props.gfeType === "professional" ? this.state.practitionerRoleList.filter(role => role.id === this.state.selectedBillingProvider)[0]
                : this.state.organizationList.filter(org => org.resource.id === this.state.selectedBillingProvider)[0].resource
        }
        if (this.props.gfeType === "institutional") {
            orgReferenceList.push(providerReference)
        }

        input.bundleResources.push({
            fullUrl: `${fhirServerBaseUrl}/${input.provider.reference}`,
            entry: input.provider.resource
        })

        input.billing = {
            interTransIntermediary: this.state.interTransIntermediary,
            gfeAssignedServiceId: this.state.gfeServiceId,
            supportingInfo: [
                {
                    sequence: 1,

                }
            ]
        }

        input.procedure = [];

        input.billing.items = [];
        let sequenceCount = 0;
        let totalAmount = 0;

        this.state.claimItemList.forEach(claimItem => {
            const procedureCoding = ProcedureCodes.find(code => claimItem.productOrService.startsWith(code.code));
            const pos = PlaceOfServiceList.find(pos => pos.name === claimItem.placeOfService);

            input.billing.items.push({
                sequence: sequenceCount++,
                productOrService: {
                    coding: [
                        procedureCoding
                    ]
                },
                estimatedDateOfService: claimItem.estimatedDateOfService ? new Date(Date.parse(claimItem.estimatedDateOfService.toString())) : undefined,
                revenue: claimItem.revenue ? {
                    coding: [{
                        system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemRevenueCS",
                        code: RevenueCodeList.find(code => code.display === claimItem.revenue).code
                    }]
                } : undefined,
                unitPrice: claimItem.unitPrice,
                quantity: claimItem.quantity,
                net: claimItem.unitPrice * claimItem.quantity,
                locationCodeableConcept: {
                    coding: [
                        pos
                    ]
                }
            });

            input.procedure.push({
                sequence: sequenceCount++,
                procedureCodableConcept: {
                    coding: [
                        procedureCoding
                    ]
                },
                type: {
                    coding: [
                        {
                            system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTProcedureType",
                            code: claimItem.procedureType
                        }
                    ]

                }
            });
            totalAmount += claimItem.unitPrice * claimItem.quantity;
        });
        input.billing.total = totalAmount;

        input.diagnosis = []
        let diagnosisSequence = 1;
        this.state.diagnosisList.forEach(diagnosis => {
            const diagnosisCode = DiagnosisList.find(code => diagnosis.diagnosis.startsWith(code.diagnosisCodeableConcept.coding[0].code));
            input.diagnosis.push({
                sequence: diagnosisSequence++,
                diagnosisCodeableConcept: diagnosisCode.diagnosisCodeableConcept,
                type: [{
                    coding: [
                        {
                            code: DiagnosisTypeList.find(type => type.display === diagnosis.type).code,
                            system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTDiagnosisType"
                        }
                    ]
                }],
                packageCode: diagnosisCode.packageCode
            })
        });

        if (!this.itemListIsEmpty(this.state.supportingInfoList)) {
            input.supportingInfo = [];
            let supportingInfoSequence = 1;
            this.state.supportingInfoList.forEach(info => {
                const categoryCodeableConcept = SupportingInfoType.find(type => type.display === info.category);
                const code = categoryCodeableConcept.type === "typeofbill" ? {
                    coding: [
                        {
                            code: info.value,
                            system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFETypeOfBillCS"
                        }
                    ]
                } : {
                    coding: [
                        {
                            code: PlaceOfServiceList.find(pos => pos.name === info.value).code,
                            system: "https://oidref.com/2.16.840.1.113883.15.5"
                        }
                    ]
                }

                input.supportingInfo.push({
                    sequence: supportingInfoSequence++,
                    category: categoryCodeableConcept.codeableConcept,
                    code
                });
            });
        }


        let submitterOrgReference = `Organization/${this.state.selectedSubmitter}`
        input.submitter = {
            reference: submitterOrgReference,
            resource: this.state.organizationList.filter(org => org.resource.id === this.state.selectedSubmitter)[0].resource
        }
        orgReferenceList.push(submitterOrgReference);

        input.bundleResources.push({
            fullUrl: `${fhirServerBaseUrl}/${input.submitter.reference}`,
            entry: input.submitter.resource
        })


        orgReferenceList.forEach(orgRef => {
            let foundLocation = this.state.locationList.find(loc =>
                loc.resource.managingOrganization.reference === orgRef
            )
            if (foundLocation) {
                input.bundleResources.push({
                    fullUrl: `${fhirServerBaseUrl}/${orgRef}`,
                    entry: foundLocation.resource
                })
            }
        });

        // add care team
        if (!this.itemListIsEmpty(this.state.careTeamList)) {
            input.careTeam = [];
            const providerMap = this.getCareTeamProviderListOptions();
            let sequenceNumber = 0;
            this.state.careTeamList.forEach(member => {
                const providerResource = providerMap.find(item => item.display === member.provider);
                input.careTeam.push({
                    sequence: sequenceNumber++,
                    role: member.role.toLowerCase(),
                    providerRef: providerResource.url
                });
                input.bundleResources.push({
                    fullUrl: providerResource.url,
                    entry: providerResource.resource
                });
            });
        }

        // remove duplicate bundle resources
        let bundleResourceList = []
        input.bundleResources.forEach(resource => {
            if (!bundleResourceList.find(target => target.fullUrl === resource.fullUrl)) {
                bundleResourceList.push(resource);
            }
        })
        input.bundleResources = bundleResourceList;

        // TODO only send those needed 
        // input.resourceList = this.state.resolvedReferences;

        return input;
    }

    itemListIsEmpty = list => list.length === 0 || (list.length > 0 && list.every(item => {
        const propsList = Object.getOwnPropertyNames(item);
        return propsList.length === 1 && propsList[0] === "id";
    }));

    handleOnSubmit = e => {
        e.preventDefault();
        this.setState({
            openErrorDialog: false,
            validationErrors: undefined
        })
        const { valid, error } = this.isRequestValid();

        if (valid) {
            this.props.setSubmitting(true);
            this.props.setGfeSubmitted(true);
            this.props.setGfeResponse(undefined);
            this.props.setReceivedAEOBResponse(undefined);

            submitGFEClaim(this.props.payorUrl, buildGFEBundle(this.generateRequestInput()))
                .then(response => {
                    this.props.setSubmitting(false);
                    console.log("Payer server returned response: ", response);
                    this.props.setGfeResponse(response);
                    this.props.setGfeRequestSuccess(true);
                    this.props.setBundleId(response.id);
                    this.props.setBundleIdentifier(response.identifier.value);
                    this.props.setShowResponse(true);
                    this.props.setShowRequest(false);

                    // TODO check the response status if(response.)
                    //this.props.setGfeRequestPending(true);
                })
                .catch(error => {
                    this.props.setSubmitting(false);
                    this.props.setGfeRequestSuccess(false);
                    if ('toJSON' in error) {
                        console.log(error.toJSON());
                        this.props.setGfeResponse(error.toJSON());
                    } else {
                        this.props.setGfeResponse(error.toString());
                    }
                    this.props.setShowResponse(true);
                    this.props.setShowRequest(false);
                })
        } else {
            this.setState({
                openErrorDialog: true,
                submissionError: error
            });
        }
    }

    generateBundle = () => buildGFEBundle(this.generateRequestInput())

    retrieveRequestSummary = () => {
        return {
            patientId: this.state.selectedPatient,
            coverageId: this.state.selectedCoverage ? this.state.selectedCoverage.id : undefined,
            payorId: this.state.selectedPayor ? this.state.selectedPayor.id : undefined
        };
    }

    updateValue = e => {
        console.log("value updated", e.target);
        switch (e.target.id) {
            case "total-claim-amount":
                this.setState({
                    ...this.state,
                    totalClaim: e.target.value
                });
                break;
            case "placeOfService":
                this.setState({
                    placeOfService: e.target.value
                });
                break;
            default:
                break;
        }
    }

    updateEstimatedDate = e =>
        this.setState({ selectedDate: new Date(e) })

    handleSelectInterTransId = e =>
        this.setState({ interTransIntermediary: e.target.value })

    handleSelectGfeServiceId = e =>
        this.setState({ gfeServiceId: e.target.value })

    handleSelectDiagnosis = e =>
        this.setState({ selectedDiagnosis: e.target.value })

    isRequestValid = () => {
        // check required 
        let errorMessage = [], valid = true;
        if (this.state.selectedPatient === undefined) {
            errorMessage.push("Patient is not selected.");
            valid = false;
        }
        if (this.state.selectedBillingProvider === undefined) {
            errorMessage.push("Billing provider is not selected.");
            valid = false;
        }
        if (this.state.selectedSubmitter === undefined) {
            errorMessage.push("Submitter is not selected.");
            valid = false;
        }

        // Diagnosis
        const diagnosisListEmpty = this.itemListIsEmpty(this.state.diagnosisList);
        if (diagnosisListEmpty) {
            errorMessage.push("At least one principal diagnosis is required.");
            valid = false;
        } else {
            const requiredFields = DiagnosisColumns.filter(column => column.required);
            const requiredFieldsFilled = this.state.diagnosisList.every(item => requiredFields.every(column => item[column.field]));

            if (!requiredFieldsFilled) {
                errorMessage.push("One or many diagnosis miss(es) the required field(s).");
                valid = false;
            } else {
                const createdPrincipalDiagnosis = this.state.diagnosisList.some(item => item.type === "Principal");
                if (!createdPrincipalDiagnosis) {
                    errorMessage.push("At least one principal diagnosis is required.");
                    valid = false;
                }
            }
        }

        // claim item
        const claimItemListEmpty = this.itemListIsEmpty(this.state.claimItemList);
        if (claimItemListEmpty) {
            errorMessage.push("At least one claim item is required.");
            valid = false;
        } else {
            const requiredFields = ClaimItemColumns.filter(column => column.required);
            const requiredFieldsFilled = this.state.claimItemList.every(item => requiredFields.every(column => item[column.field]));
            if (!requiredFieldsFilled) {
                errorMessage.push("One or more claim items miss(es) the required field(s) or is(are) invalid.");
                valid = false;
            }
        }

        // supporting info
        const supportingInfoEmpty = this.itemListIsEmpty(this.state.supportingInfoList);
        if (!supportingInfoEmpty) {
            const requiredFields = SupportingInfoColumns({ selectType: this.state.supportingInfoType }).filter(column => column.required);
            const requiredFieldsFilled = this.state.supportingInfoList.every(item => requiredFields.every(column => item[column.field]));
            if (!requiredFieldsFilled) {
                errorMessage.push("One or more supporting info item miss(es) the required fields.");
                valid = false;
            }
        }

        const careTeamEmpty = this.itemListIsEmpty(this.state.careTeamList);
        if (!careTeamEmpty) {
            const requiredFields = CareTeamColumns().filter(column => column.required);
            const requiredFieldsFilled = this.state.careTeamList.every(item => requiredFields.every(column => item[column.field]));
            if (!requiredFieldsFilled) {
                errorMessage.push("One or more care team item miss(es) the required fields.");
                valid = false;
            };
        }

        this.setState({
            validationErrors: errorMessage
        });
        return { valid, error: errorMessage };
    }

    addOneCareTeam = () => {
        let valid = true, msg = undefined;
        if (this.state.careTeamList.length > 0) {
            const requiredColumns = CareTeamColumns().filter(column => column.required);
            const fields = this.extractFieldNames(requiredColumns);
            msg = `Complete adding existing care team member before adding a new one! ${fields} are required fields`;
            valid = this.state.careTeamList.every(item => {
                return requiredColumns.every(column => item[column.field] !== undefined);
            })
        }
        if (valid) {
            const newId = this.state.careTeamList.length + 1;
            this.setState({
                careTeamList: [...this.state.careTeamList, { id: newId }]
            });
        } else {
            alert(msg);
        }
    }

    deleteOneCareTeam = id => {
        this.setState({
            careTeamList: this.state.careTeamList.filter(item => item.id !== id)
        })
    }

    editCareTeam = model => {
        console.log(model);
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
            this.setState({
                careTeamList: this.state.careTeamList.map(item => {
                    if (item.id === parseInt(id)) {
                        item[fieldName] = fieldValue;
                        return item;
                    } else {
                        return item;
                    }
                })
            });
            console.log(this.state.careTeamList);
        }
    }

    extractFieldNames = columns => {
        return columns.reduce((prev, current, index) => {
            return index === 0 ? current.headerName : prev.concat(', ').concat(current.headerName);
        }, '');
    }

    addOneClaimItem = () => {
        let valid = true, msg = undefined;
        if (this.state.claimItemList.length > 0) {
            const requiredColumns = ClaimItemColumns.filter(column => column.required);
            const fields = this.extractFieldNames(requiredColumns);
            msg = `Complete adding existing claim item before adding a new one! ${fields} are required fields`;
            valid = this.state.claimItemList.every(item => {
                return requiredColumns.every(column => item[column.field] !== undefined);
            })
        }
        if (valid) {
            const newId = this.state.claimItemList.length + 1;
            this.setState({
                claimItemList: [...this.state.claimItemList, { id: newId }]
            });
        } else {
            alert(msg);
        }
    }

    deleteOneClaimItem = id => {
        this.setState({
            claimItemList: this.state.claimItemList.filter(item => item.id !== id)
        })
    }

    editClaimItem = model => {
        console.log(model);
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
            let valid = true, errorMsg = undefined;
            switch (fieldName) {
                case "unitPrice":
                    if (fieldValue < 1) {
                        valid = false;
                        errorMsg = "Unit Price must be greater than 1."
                    }
                    break;
                case "quantity":
                    if (fieldValue < 1) {
                        valid = false;
                        errorMsg = "Quantity must be greater than 1."
                    }
                    break;
                case "estimatedDateOfService":
                    const setDate = new Date(Date.parse(fieldValue.toString()));
                    const today = new Date();
                    if (today > setDate) {
                        valid = false;
                        errorMsg = "Estimate date must be after today."
                    }
                    break;
                default:
                    break;
            }

            if (valid) {
                this.setState({
                    claimItemList: this.state.claimItemList.map(item => {
                        if (item.id === parseInt(id)) {
                            item[fieldName] = fieldValue;
                            return item;
                        } else {
                            return item;
                        }
                    })
                });
            } else {
                alert("Error occurred. " + errorMsg);
            }
        }
    }

    addOneDiagnosisItem = () => {
        let valid = true, msg = undefined;
        if (this.state.careTeamList.length > 0) {
            const requiredColumns = DiagnosisColumns.filter(column => column.required);
            const fields = this.extractFieldNames(requiredColumns);
            msg = `Complete adding existing diagnosis before adding a new one! ${fields} are required fields.`;
            valid = this.state.diagnosisList.every(item => {
                return requiredColumns.every(column => item[column.field] !== undefined);
            })
        }
        if (valid) {
            const newId = this.state.diagnosisList.length + 1;
            this.setState({
                diagnosisList: [...this.state.diagnosisList, { id: newId }]
            });
        } else {
            alert(msg);
        }
    }

    deleteOneDiagnosisItem = id => {
        this.setState({
            diagnosisList: this.state.diagnosisList.filter(item => item.id !== id)
        })
    }

    editDiagnosisItem = model => {
        console.log(model);
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
            this.setState({
                diagnosisList: this.state.diagnosisList.map(item => {
                    if (item.id === parseInt(id)) {
                        item[fieldName] = fieldValue;
                        return item;
                    } else {
                        return item;
                    }
                })
            });
        }
    }

    addSupportingInfoItem = () => {
        let valid = true, msg = undefined;
        if (this.state.supportingInfoList.length > 0) {
            const requiredColumns = SupportingInfoColumns({ selectType: this.state.supportingInfoType }).filter(column => column.required);
            const fields = this.extractFieldNames(requiredColumns);
            const typeDisplay = SupportingInfoType.find(type => type.type === this.state.supportingInfoType).display;
            msg = `Complete adding existing supporting information before adding a new one! ${fields} are required fields for \"${typeDisplay}\"`;
            valid = this.state.supportingInfoList.every(item => {
                return requiredColumns.every(column => item[column.field] !== undefined);
            })
        }
        if (valid) {
            const newId = this.state.supportingInfoList.length + 1;
            this.setState({
                supportingInfoList: [...this.state.supportingInfoList, { id: newId }]
            });
        } else {
            alert(msg);
        }
    }

    deleteSupportingInfoItem = id => {
        this.setState({
            supportingInfoList: this.state.supportingInfoList.filter(item => item.id !== id)
        })
    }

    editSupportingInfoItem = model => {
        console.log(model);
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
            if (fieldName === "category") {
                this.setState({
                    supportingInfoList: this.state.supportingInfoList.map(item => {
                        if (item.id === parseInt(id)) {
                            item[fieldName] = fieldValue;
                            return item;
                        } else {
                            return item;
                        }
                    }),
                    supportingInfoType: SupportingInfoType.find(type => type.display === fieldValue).type
                });
            } else {
                this.setState({
                    supportingInfoList: this.state.supportingInfoList.map(item => {
                        if (item.id === parseInt(id)) {
                            item[fieldName] = fieldValue;
                            return item;
                        } else {
                            return item;
                        }
                    })
                });
            }
        }
    }

    getCareTeamProviderListOptions() {
        const fhirServerBaseUrl = this.props.ehrUrl;
        const providerMap = [];
        this.state.practitionerList.forEach(practitioner => {
            const name = practitioner.resource.name[0]
            providerMap.push({
                type: "Practitioner",
                display: `Practitioner - ${name.given[0]} ${name.family}`,
                resource: practitioner.resource,
                url: practitioner.fullUrl
            });
        });
        this.state.practitionerRoleList.forEach(role => {
            const practitioner = this.state.resolvedReferences[role.practitioner.reference];
            const organization = this.state.resolvedReferences[role.organization.reference];
            const display = practitioner ? `${practitioner.name[0].text} from ${organization.name}` : "";
            providerMap.push({
                type: "PractitionerRole",
                display: `PractitionerRole - ${display}`,
                resource: role,
                url: `${fhirServerBaseUrl}/PractitionerRole/${role.id}`
            })
        });
        this.state.organizationList.forEach(org => {
            providerMap.push({
                type: "Organization",
                display: `Organization - ${org.resource.name}`,
                resource: org.resource,
                url: org.fullUrl
            });
        });
        return providerMap;
    }

    render() {
        const { classes } = this.props;
        const summary = this.retrieveRequestSummary();
        const providerMap = this.getCareTeamProviderListOptions();
        const providerListOptions = providerMap.map(provider => provider.display);
        const totalClaimAmount = this.state.claimItemList.reduce((previousItem, currentItem) => previousItem + currentItem.unitPrice * currentItem.quantity, 0);
        const totalClaimAmountDisplay = isNaN(totalClaimAmount) ? 0 : `$ ${totalClaimAmount}`;
        return (
            <div>
                <Grid container space={2} justifyContent='center'>
                    <Grid item xs={12}>
                        <Typography variant="h5" color="initial">Request</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container className={classes.root}>
                            <form onSubmit={this.handleOnSubmit}>
                                <Grid item xs={12}>
                                    <Grid container className={classes.root}>
                                        <Grid container className={classes.block}>
                                            <Grid item className={classes.blockHeader} xs={12}>
                                                <Typography>Patient and Insurance Information</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Grid container direction="row" spacing={3}>
                                                    <Grid item>
                                                        <Grid container direction="column">
                                                            <Grid item className={classes.paper}>
                                                                <FormControl>
                                                                    <FormLabel>Patient *</FormLabel>
                                                                    {PatientSelect(this.state.patientList, this.state.selectedPatient, this.handleOpenPatients, this.handleSelectPatient)}
                                                                </FormControl>
                                                            </Grid>
                                                            {this.state.patientSelected ?
                                                                <Grid item><GFERequestSummary summary={summary} /></Grid> : null
                                                            }
                                                        </Grid>
                                                    </Grid>
                                                    <Grid item className={classes.paper}>
                                                        <FormControl>
                                                            <FormLabel>Diagnosis *</FormLabel>
                                                            <DiagnosisItem rows={this.state.diagnosisList} addOne={this.addOneDiagnosisItem} edit={this.editDiagnosisItem} deleteOne={this.deleteOneDiagnosisItem} />
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid container className={classes.block}>
                                            <Grid item className={classes.blockHeader} xs={12}>
                                                <Typography variant="body2" color="initial">Product or Service to be Estimated</Typography>
                                            </Grid>
                                            <Grid item className={classes.paper} xs={12}>
                                                <Typography><InputLabel htmlFor="total-claim-amount">Total Claim Amount: {totalClaimAmountDisplay}</InputLabel></Typography>
                                            </Grid>
                                            <Grid item className={classes.paper} xs={12}>
                                                <FormControl>
                                                    <FormLabel>Claim Items *</FormLabel>
                                                    <ClaimItem rows={this.state.claimItemList} addOne={this.addOneClaimItem} edit={this.editClaimItem} deleteOne={this.deleteOneClaimItem} />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Grid container direction="row">
                                                    <Grid item className={classes.paper}>
                                                        <FormControl>
                                                            <FormLabel>Supporting Information</FormLabel>
                                                            <SupportingInfoItem rows={this.state.supportingInfoList} addOne={this.addSupportingInfoItem} edit={this.editSupportingInfoItem} deleteOne={this.deleteSupportingInfoItem} selectType={this.state.supportingInfoType} />
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item className={classes.paper}>
                                                        <FormControl>
                                                            <FormLabel>Care Team</FormLabel>
                                                            <CareTeam rows={this.state.careTeamList} providerList={providerListOptions} addOne={this.addOneCareTeam} edit={this.editCareTeam} deleteOne={this.deleteOneCareTeam} />
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid container className={classes.block}>
                                            <Grid item className={classes.blockHeader} xs={12}>
                                                <Typography variant="body2" color="initial">Billing Details</Typography>
                                            </Grid>
                                            <Grid item className={classes.paper} xs={12}>
                                                <FormControl component="fieldset">
                                                    <FormLabel>GFE Type</FormLabel>
                                                    <RadioGroup row aria-label="GFE Type" name="row-radio-buttons-group" value={this.props.gfeTYpe} onChange={e => this.props.setGfeType(e.target.value)} defaultValue={this.props.gfeType}>
                                                        <FormControlLabel value="institutional" control={<Radio size="small" />} label="Institutional" />
                                                        <FormControlLabel value="professional" control={<Radio size="small" />} label="Professional" />
                                                    </RadioGroup>
                                                </FormControl>
                                            </Grid>
                                            <Grid item className={classes.paper} xs={12}>
                                                <FormControl>
                                                    <FormLabel>Billing provider *</FormLabel>
                                                    {this.props.gfeType === "professional" ?
                                                        PractitionerRoleSelect(this.state.practitionerRoleList, this.handleOpenPractitionerRoleList, this.handleSelectBillingProvider, this.state.resolvedReferences)
                                                        :
                                                        OrganizationSelect(this.state.organizationList, "billing-provider-label", "billingProvider", this.handleOpenOrganizationList, this.handleSelectBillingProvider)
                                                    }
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Grid container direction="row">
                                                    <Grid item className={classes.paper}>
                                                        <FormControl>
                                                            <FormLabel>Inter Transaction Identifier</FormLabel>
                                                            <Select
                                                                displayEmpty
                                                                id="select-inter-trans-id"
                                                                value={this.state.interTransIntermediary}
                                                                label="Inter Trans Identifier"
                                                                onChange={this.handleSelectInterTransId}
                                                            >
                                                                <MenuItem value="InterTransID0001">InterTransID0001</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item className={classes.paper} >
                                                        <FormControl>
                                                            <FormLabel>GFE assigned service identifier</FormLabel>
                                                            <Select
                                                                displayEmpty
                                                                id="select-gfe-service-id"
                                                                value={this.state.gfeServiceId}
                                                                label="GFE assigned service identifier"
                                                                onChange={this.handleSelectGfeServiceId}
                                                            >
                                                                <MenuItem value="GFEAssignedServiceID0001">GFEAssignedServiceID0001</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid container className={classes.block}>
                                            <Grid item className={classes.blockHeader} xs={12}>
                                                <Typography>Submitter Details</Typography>
                                            </Grid>
                                            <Grid item className={classes.paper} xs={12}>
                                                <FormControl>
                                                    <FormLabel>Submitter *</FormLabel>
                                                    {OrganizationSelect(this.state.organizationList, "submitter-label", "submitter", this.handleOpenOrganizationList, this.handleSelectSubmitter)}
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                        <Grid item className={classes.paper} xs={12}>
                                            <Box display="flex" justifyContent="space-evenly">
                                                <ViewGFERequestDialog generateRequest={this.generateBundle} valid={this.isRequestValid} error={this.state.validationErrors} />
                                                <FormControl>
                                                    <Button loading variant="contained" color="primary" type="submit" disabled={this.props.submittingStatus === true}>
                                                        Submit
                                                    </Button>
                                                </FormControl>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </form>
                        </Grid>
                    </Grid>
                    {
                        this.state.openErrorDialog ? (
                            <ViewErrorDialog error={this.state.validationErrors} open={this.state.openErrorDialog} setOpen={open => this.setState({ openErrorDialog: open })} />
                        ) : null
                    }
                    {
                        this.state.submittingStatus === true ?
                            <Box sx={{ width: '100%' }}>
                                <LinearProgress />
                            </Box>
                            : null
                    }
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(GFERequestBox);