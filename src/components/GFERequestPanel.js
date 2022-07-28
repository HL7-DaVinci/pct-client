import React, { Component, useState } from 'react';
import {
    Box, Button,
    FormLabel, FormControl, FormControlLabel,
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
} from '@material-ui/core';


import {
    getPatients, getDeviceRequestsForPatient, submitGFEClaim, getCoverage,
    getPractitionerRoles, getOrganizations, getCoverageByPatient, getPractitioners,
    getLocations, getPatientInfo, getClaims
} from '../api'

import GFERequestSummary from './GFERequestSummary'
import buildGFEBundle from './BuildGFEBundle';
import ViewGFERequestDialog from './ViewGFEDialog';
import { PlaceOfServiceList } from '../values/PlaceOfService';


import CareTeam, { columns as CareTeamColumns } from './CareTeam';
import ClaimItem, { columns as ClaimItemColumns } from './ClaimItem';
import { ProcedureCodes } from '../values/ProcedureCode';
import DiagnosisItem, { columns as DiagnosisColumns } from './DiagnosisItem';
import ProcedureItem, { columns as ProcedureColumns } from './ProcedureItem';
import SummaryItem, { columns as SummaryItems } from './SummaryItem';
import { SupportingInfoType } from '../values/SupportingInfo';
import { DiagnosisList, DiagnosisTypeList } from '../values/DiagnosisList';
import ViewErrorDialog from './ViewErrorDialog';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Input, TextFieldProps } from "@material-ui/core";




const styles = theme => ({
    root: {
        flexGrow: 1,
        padding: 0,
    },
    paper: {
        textAlign: 'left',
        color: theme.palette.text.secondary,
        marginLeft: 30,
        marginRight: 20,
        paddingBottom: 30,

    },
    smallerPaddingPaper: {
        textAlign: 'left',
        color: theme.palette.text.secondary,
        marginLeft: 30,
        marginRight: 20,
        paddingBottom: 10,

    },
    block: {
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
    },
    singleSelect: {
        marginLeft: 20,
        marginRight: 3,
    },
    inputBox: {
        marginLeft: 0,
        width: 150,
        textAlign: 'left',
    },
    smallerHeader: {
        marginTop: 0,
        marginBottom: 5
    },
    tabs: {
        marginTop: 10,
        marginBottom: 10
    },
    calendar: {
        maxWidth: 140
    },
    headerSpacing: {
        marginTop: 10,
        marginBottom: 10
    },
    card: {
        minWidth: 100,
        textAlign: "left",
        color: theme.palette.text.secondary,
        backgroundColor: "#D3D3D3",
        minWidth: "70vw"
    },
    cardCareTeam: {
        marginLeft: 30,
        marginRight: 30,
        width: '75vw',
        textAlign: "left",
        color: theme.palette.text.secondary,
        backgroundColor: "#DCDCDC"
    },
    spaceAroundContainer: {
        marginTop: 30
    },
    newColor: {
        backgroundColor: "#FFC0CB"
    },
    fixedTabWidth: {
        width: "30%"
    },
    leftTabs: {
        minWidth: 170
    },
    tabBackground: {
        backgroundColor: "#FFFFFF"
    },
    patientBox: {
        marginLeft: 30,
        width: '75vw',
    },
    encounterBox: {
        textAlign: 'left',
        color: theme.palette.text.secondary,
        marginLeft: 30,
        marginRight: 20,
        paddingBottom: 30,
        width: '75vw',
    },
    inputBoxSpace: {
        marginLeft: 10
    },
    SmallTableFixed: {
        width: 400,
    },
    fullBackground: {
        backgroundColor: "3355FF",
    },
    containerColor: {
        backgroundColor: "#3355FF"
    },

    dropdownColor: {
        background: "red !important",
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


const getProviderDisplayName = provider => {
    if (provider === undefined) return null;
    const name = provider.resource.name[0];
    if (name.text != null) return name.text;
    else return `${name.given[0]} ${name.family}`;
}

const ProviderSelect = (providers, selectProvider, handleOpenProviders, handleChange) => {
    return (<Select required labelId="select-provider-label" id="provider" value={selectProvider} onOpen={handleOpenProviders} onChange={handleChange}>
        {
            providers ?
                providers.map((provider) => {
                    return (<MenuItem key={provider.resource.id} value={provider.resource.id}>{providers}</MenuItem>);
                }) : (<MenuItem />)
        }
    </Select>);
}

const getPriorityDisplayName = priority => {
    if (priority === undefined) return null;

    return priority.resource.priority.coding[0].code;
}
const PrioritySelect = (priorities, selectPriority, handleOpenPriorities, handleChange) => {

    let priorityList = [];

    return (<Select required labelId="select-priority-label" id="priority" value={selectPriority} onOpen={handleOpenPriorities} onChange={handleChange}>
        {
            priorities ?
                priorities.map((selectedPriority) => {

                    //check to see if priority type is already in the priorityList
                    if (priorityList.includes(getPriorityDisplayName(selectedPriority))) {
                        return
                    }
                    //put the priority into the list if not there yet
                    priorityList.push(getPriorityDisplayName(selectedPriority));

                    return (<MenuItem key={selectedPriority.resource.priority} value={selectedPriority.resource}>{getPriorityDisplayName(selectedPriority)}</MenuItem>);
                }) : (<MenuItem />)
        }
    </Select>);
}


const ProfessionalBillingProviderSelect = (providers, selectedProvider, handleSelect) => {

    return (<Select required labelId="select-billing-provider-label" id="billing-provider" value={selectedProvider} onChange={handleSelect} style={{ backgroundColor: "#FFFFFF" }}>
        {
            providers ?
                providers.map(provider => {
                    return (<MenuItem key={provider.id} value={provider.id} >{provider.display}</MenuItem>)
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

const OrganizationSelect = (organizations, organizationSelected, label, id, handleOpen, handleSelect) =>
    <Select required labelId={label} id={id} value={organizationSelected} onOpen={handleOpen} onChange={handleSelect} style={{ backgroundColor: "#FFFFFF" }}>
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



const PlaceOfServiceSelect = (placeOfService, handleChange) =>
    <Select required labelId="select-place-of-service" id="placeOfService" value={placeOfService} onChange={handleChange}>
        {
            PlaceOfServiceList.map((pos) => {
                return (<MenuItem key={pos.code} value={pos.code}>{pos.display}</MenuItem>);
            })
        }
    </Select>


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
        'aria-controls': `full-width-tabpanel-${index}`,
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

//vertical panel tabs
function a11yPropsVertical(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

//vertical panel tabs
function a11yPropsGFE(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}




class GFERequestBox extends Component {

    constructor(props) {
        super(props);
        this.initialState = {

            patientList: [],
            selectedPatient: undefined,
            patientRequestList: [],
            patientSelected: false,
            priorityList: [],
            selectedPriority: undefined,
            providerList: [],
            billingProviderList: [],
            practitionerRoleList: [],
            selectedBillingProvider: undefined,
            selectedSubmitter: undefined,
            selectedPractitioner: [],
            practitionerList: [],
            selectedPayor: undefined,
            organizationList: [],
            selectedRequest: undefined,
            resolvedReferences: {},
            totalClaim: 0,
            placeOfService: undefined,
            interTransIntermediary: undefined,
            selectedDate: undefined,
            selectedProcedure: undefined,
            selectedCoverage: undefined,
            selectedDiagnosis: undefined,
            gfeServiceId: undefined,
            providerList: [],
            careTeamList: [{ id: 1 }],
            claimItemList: [{ id: 1 }],
            diagnosisList: [{ id: 1 }],
            procedureList: [{ id: 1 }],
            supportingInfoType: "cmspos",
            validationErrors: undefined,
            openErrorDialog: false,
            supportingInfoPlaceOfService: undefined,
            supportingInfoTypeOfBill: undefined,
            currentTabIndex: 0,
            currentGFETabIndex: 0,
            GFEtabs: [],
            setAddTab: [],
            maxTabIndex: 0,
            setTabsContent: <TabPanel currentTabIndex={this.currentTabIndex}>Default Panel - {Math.random()}</TabPanel>,
            open: true,
            verticalTabIndex: 0,
            birthdate: undefined,
            gender: undefined,
            telephone: undefined,

            dateStart: undefined,
            dateEnd: new Date('2022-08-18T21:11:54'),
            selectedAddress: undefined,
            subscriber: undefined,
            memberNumber: undefined,
            subscriberRelationship: undefined,
            coveragePlan: undefined,
            coveragePeriod: undefined,

            selectedDate: undefined,
            setSelectedDate: undefined,

            startDate: null,
            setStartDate: null,
            endDate: null,
            locationList: []



        }
        this.state = this.initialState;
    };



    handleStartDateChange = (date) => {
        this.setState({ startDate: date });
    }


    handleDateStartUpdate = (value) => {
        return <TextField {...value} />
    };

    handleEndDateChange = (date) => {
        this.setState({ endDate: date });
    }


    handleDateEndUpdate = (value) => {
        return <TextField {...value} />
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

    handleOpenPriority = () => {
        getClaims(this.props.ehrUrl)
            .then(result => {
                const priority = result.entry;

                this.setState({ ...this.state, priorityList: priority });


            });
    }

    //when select the patient, changes fields within the form specific
    handleSelectPatient = e => {
        const patientId = e.target.value;
        this.setState({
            selectedPatient: patientId
        })

        // retrieve coverage and payer info about patient 
        //adding other patient info here too
        getCoverageByPatient(this.props.ehrUrl, patientId)
            .then(result => {
                const subscriberText = result.data[0].subscriberId;
                const relationshipText = result.data[0].relationship.coding[0].display;
                const planName = result.data[0].class[0].name;
                const coveragePeriodTextStart = result.data[0].period.start;
                const coveragePeriodTextEnd = result.data[0].period.end;

                const coveragePeriod = coveragePeriodTextStart + " to " + coveragePeriodTextEnd

                if (result.data && result.data.length > 0) {
                    getCoverage(this.props.ehrUrl, result.data[0].id)
                        .then(coverageResult => {
                            const reference = Object.keys(coverageResult.references)[0]
                            const resource = coverageResult.references[reference]

                            this.setState({
                                selectedPayor: resource,
                                selectedCoverage: coverageResult.data,
                                selectedProcedure: undefined,
                                selectedRequest: undefined,
                                subscriber: subscriberText,
                                subscriberRelationship: relationshipText,
                                coveragePlan: planName,
                                coveragePeriod: coveragePeriod
                            });
                        })
                } else {
                    console.log("couldn't retrieve patient's coverage and payor info");
                }
            })



        getPatientInfo(this.props.ehrUrl, patientId)
            .then(result => {

                const addressText = result[0].address[0].text
                const birthdateText = result[0].birthDate
                const genderText = result[0].gender
                const telephoneText = result[0].telecom[0].value


                //ensure correct id for member
                for (var i = 0; i < result[0].identifier.length; i++) {
                    for (var j = 0; j < result[0].identifier[i].type.coding.length; j++) {
                        if (result[0].identifier[i].type.coding[j].code === ("MB")) {
                            const memberNumText = result[0].identifier[0].value
                            this.setState({
                                memberNumber: memberNumText

                            })

                        }
                    }
                }


                if (addressText && addressText.length > 0) {
                    this.setState({
                        selectedAddress: addressText,
                        birthdate: birthdateText,
                        gender: genderText,
                        telephone: telephoneText,
                    });
                } else {
                    console.log("couldn't retrieve patient's personal info");
                }


            })



        this.setState({
            patientSelected: true
        })
    }


    handleSelectPriority = e => {

        const prioritylevel = e.target.value;
        this.setState({
            selectedPriority: prioritylevel
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
                    selectedProcedure: undefined,
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
        let patientAddressList = [];
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




        const { request, coverage, practitioner, requestAd, addressReq } = this.getClaimDetails();

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



        let providerReference = undefined, findProfessionalProvider = undefined;
        if (this.props.gfeType === "professional") {
            const professionalProviderList = this.getProfessionalBillingProviderList();
            findProfessionalProvider = professionalProviderList.find(provider => provider.id === this.state.selectedBillingProvider);
            providerReference = findProfessionalProvider.reference
        } else {
            providerReference = `Organization/${this.state.selectedBillingProvider}`;
        }

        //let providerReference = this.props.gfeType === "professional" ? `PractitionerRole/${this.state.selectedBillingProvider}` : `Organization/${this.state.selectedBillingProvider}`
        input.provider = {
            reference: providerReference,
            resource: this.props.gfeType === "professional" ? findProfessionalProvider.resource
                : this.state.organizationList.find(org => org.resource.id === this.state.selectedBillingProvider).resource
        }
        if (this.props.gfeType === "institutional") {
            orgReferenceList.push(providerReference)
        } else if (findProfessionalProvider.type === "Organization") {
            orgReferenceList.push(providerReference);
        }

        input.bundleResources.push({
            fullUrl: `${fhirServerBaseUrl}/${input.provider.reference}`,
            entry: input.provider.resource
        })

        input.billing = {};
        if (this.state.interTransIntermediary) {
            input.billing.interTransIntermediary = this.state.interTransIntermediary;
        }

        if (this.state.gfeServiceId) {
            input.billing.gfeAssignedServiceId = this.state.gfeServiceId
        }

        input.billing.items = [];
        let sequenceCount = 1;
        let totalAmount = 0;
        let procedureSequenceCount = 1;

        this.state.claimItemList.forEach(claimItem => {
            const procedureCodingOrig = ProcedureCodes.find(code => claimItem.productOrService.startsWith(code.code));
            let procedureCoding = Object.assign({}, procedureCodingOrig);
            delete procedureCoding["unitPrice"];
            delete procedureCoding["revenue"];

            const pos = PlaceOfServiceList.find(pos => pos.display === claimItem.placeOfService);

            let newItem = {
                sequence: sequenceCount++,
                revenue: {
                    coding: [{
                        system: "https://www.nubc.org/CodeSystem/RevenueCodes",
                        code: procedureCodingOrig.revenue.code
                    }]
                },
                productOrService: {
                    coding: [
                        procedureCoding
                    ]
                },

                unitPrice: {
                    value: claimItem.unitPrice,
                    currency: "USD"
                },
                quantity: {
                    value: claimItem.quantity
                },
                net: {
                    value: claimItem.unitPrice * claimItem.quantity,
                    currency: "USD"
                }
            };

            newItem.extension = [];
            if (claimItem.estimatedDateOfService) {
                const estimateDate = new Date(Date.parse(claimItem.estimatedDateOfService.toString()));
                const month = estimateDate.getMonth() + 1;
                const monthString = month < 10 ? '0' + month : month;
                const dateString = estimateDate.getDate() < 10 ? '0' + estimateDate.getDate() : estimateDate.getDate();
                newItem.extension.push(
                    {
                        url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/estimatedDateOfService",
                        valueDate: estimateDate.getFullYear() + "-" + monthString + "-" + dateString
                    }
                )
            }

            if (pos) {
                newItem.locationCodeableConcept = {
                    coding: [
                        pos
                    ]
                };
            };
            input.billing.items.push(newItem);

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
                            system: "http://terminology.hl7.org/CodeSystem/ex-diagnosistype"
                        }
                    ]
                }],
                packageCode: diagnosisCode.packageCode
            })
        });

        // supportingInfo
        if (this.state.supportingInfoTypeOfBill) {
            input.supportingInfo = [];
            let supportingInfoSequence = 1;

            const categoryCodeableConcept = inputType => SupportingInfoType.find(type => type.type === inputType);

            if (this.state.supportingInfoTypeOfBill) {
                input.supportingInfo.push({
                    sequence: supportingInfoSequence++,
                    category: categoryCodeableConcept("typeofbill").codeableConcept,
                    code: {
                        coding: [
                            {
                                system: "https://www.nubc.org/CodeSystem/TypeOfBill",
                                code: this.state.supportingInfoTypeOfBill,
                                display: "Type of Bill"
                            }
                        ]
                    }
                })
            }
        }

        let submitterOrgReference = `Organization/${this.state.selectedSubmitter}`
        input.submitter = {
            reference: submitterOrgReference,
            resource: this.state.organizationList.filter(org => org.resource.id === this.state.selectedSubmitter)[0].resource //undefined resource?
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
            let sequenceNumber = 1;
            this.state.careTeamList.forEach(member => {
                const providerResource = providerMap.find(item => item.display === member.provider);
                input.careTeam.push({
                    sequence: sequenceNumber++,
                    role: member.role.toLowerCase(),
                    providerRef: {
                        reference: providerResource.url
                    }
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
            payorId: this.state.selectedPayor ? this.state.selectedPayor.id : undefined,
            addressId: this.state.selectedAddress,
            birthdate: this.state.birthdate,
            gender: this.state.gender,
            telephone: this.state.telephone,
            subscriberId: this.state.subscriber,
            memberId: this.state.memberNumber,
            subscriberRelationship: this.state.subscriberRelationship,
            coveragePlan: this.state.coveragePlan,
            coveragePeriod: this.state.coveragePeriod,
            practitionerSelected: this.state.careTeamList,
            practitionerRoleSelected: this.state.careTeamList,
            gfeType: this.props.gfeType,
            diagnosisList: this.state.diagnosisList,
            procedureList: this.state.procedureList,
            servicesList: this.state.claimItemList,
            //startDateService: moment(this.state.startDate).format('L'), 
            //endDateService: moment(this.state.endDate).format('L'),
            priorityLevel: this.state.selectedPriority,
            serviceDate: this.state.selectedDate,
            submittingProvider: this.state.selectedSubmitter,
            billingProvider: this.state.selectedBillingProvider,
            submittingProvider: this.state.selectedSubmitter
        };
    }

    updateValue = e => {
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

    updateEstimatedDate = e => {
        this.setState({ selectedDate: new Date(e) })
    }

    handleSelectInterTransId = e =>
        this.setState({ interTransIntermediary: e.target.value })

    handleSelectGfeServiceId = e =>
        this.setState({ gfeServiceId: e.target.value })

    handleSelectDiagnosis = e =>
        this.setState({ selectedDiagnosis: e.target.value })

    handleSupportingInfoTypeOfBill = e => {
        this.setState({ supportingInfoTypeOfBill: e.target.value })
    }

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

    addOneCareTeam = (props) => {

        //console.log('this is our care team', props)


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

                    console.log('item', item)

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

    extractFieldNames = columns => {
        return columns.reduce((prev, current, index) => {
            return index === 0 ? current.headerName : prev.concat(', ').concat(current.headerName);
        }, '');
    }

    addOneClaimItem = () => {

        console.log('adding claim item started');

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
                    const setDate = moment(fieldValue).format('YYYY-MM-DD');
                    this.setState({
                        selectedDate: setDate
                    })
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

    addOneProcedureItem = () => {
        let valid = true, msg = undefined;
        if (this.state.careTeamList.length > 0) {
            const requiredColumns = ProcedureColumns.filter(column => column.required);
            const fields = this.extractFieldNames(requiredColumns);
            msg = `Complete adding existing diagnosis before adding a new one! ${fields} are required fields.`;
            valid = this.state.procedureList.every(item => {
                return requiredColumns.every(column => item[column.field] !== undefined);
            })
        }
        if (valid) {
            const newId = this.state.procedureList.length + 1;
            this.setState({
                procedureList: [...this.state.procedureList, { id: newId }]
            });
        } else {
            alert(msg);
        }
    }

    deleteOneProcedureItem = id => {
        this.setState({
            procedureList: this.state.procedureList.filter(item => item.id !== id)
        })
    }

    editProcedureItem = model => {
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
                procedureList: this.state.procedureList.map(item => {
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

    getProfessionalBillingProviderList() {
        const fhirServerBaseUrl = this.props.ehrUrl;
        const providerMap = [];
        this.state.practitionerRoleList.forEach(role => {
            const practitioner = this.state.resolvedReferences[role.practitioner.reference];
            const organization = this.state.resolvedReferences[role.organization.reference];
            const display = practitioner ? `${practitioner.name[0].text} from ${organization.name}` : "";
            providerMap.push({
                type: "PractitionerRole",
                display: `PractitionerRole - ${display}`,
                resource: role,
                reference: `PractitionerRole/${role.id}`,
                url: `${fhirServerBaseUrl}/PractitionerRole/${role.id}`,
                id: role.id
            })
        });
        this.state.organizationList.forEach(org => {
            providerMap.push({
                type: "Organization",
                display: `Organization - ${org.resource.name}`,
                resource: org.resource,
                reference: `Organization/${org.resource.id}`,
                url: org.fullUrl,
                id: org.resource.id
            });
        });
        return providerMap;
    }


    //sourced from: https://stackoverflow.com/questions/48031753/material-ui-tab-react-change-active-tab-onclick
    handleChange = (event, value) => {
        this.setState({ currentTabIndex: value });
    };

    handleVerticalChange = (event, value) => {
        this.setState({ verticalTabIndex: value });
    };

    handleGFEChange = (event, value) => {
        this.setState({ currentGFETabIndex: value });
    };

    handleDateStartChange = (event, value) => {
        this.setState({ dateStart: value });
    };

    handleDateEndChange = (event, value) => {
        this.setState({ dateEnd: value });
    };

    // Handle Add Tab Button
    handleAddTab = () => {
        this.state.maxTabIndex = this.state.maxTabIndex + 1;
        this.setAddTab([
            ...this.state.GFEtabs,
            <Tab label={`New Tab ${this.state.maxTabIndex}`} key={this.state.maxTabIndex} />
        ]);
        this.handleTabsContent();
    };

    handleTabsContent = () => {
        this.state.setTabsContent([
            ...this.state.tabsContent,
            <TabPanel currentTabIndex={this.state.currentTabIndex}>New Tab Panel - {Math.random()}</TabPanel>
        ]);
    };



    render() {

        const summary = this.retrieveRequestSummary();
        const providerMap = this.getCareTeamProviderListOptions();
        const providerListOptions = providerMap.map(provider => provider.display);
        const totalClaimAmount = this.state.claimItemList.reduce((previousItem, currentItem) => previousItem + currentItem.unitPrice * currentItem.quantity, 0);
        const totalClaimAmountDisplay = isNaN(totalClaimAmount) ? 'TBD' : `$ ${totalClaimAmount}`;
        const professionalBillingProviderList = this.getProfessionalBillingProviderList();
        const { classes } = this.props;
        const { currentTabIndex, currentGFETabIndex } = this.state;
        const { verticalTabIndex } = this.state;
        const { dateStart, dateEnd, GFEtabs, maxTabIndex, selectedDate } = this.state;


        return (
            <div>
                <Grid container space={0} justifyContent='center'> {/* container size is adjusted here for main screen */}
                    <AppBar position="static">
                        <Tabs
                            value={currentTabIndex}
                            //onChange={this.handleChange} //don't want the user to click aeob button before submit gfe's
                            indicatorColor="secondary"
                            textColor="inherit"
                            variant="fullWidth"
                            aria-label="full width tabs example"

                        >
                            <Tab label="Good Faith Estimate" {...a11yProps(0)} />
                            <Tab label="Advanced Explanation of Benefits" {...a11yProps(1)} />
                        </Tabs>
                    </AppBar>

                    <form onSubmit={this.handleOnSubmit} >

                        <Box
                            index={currentTabIndex}
                        //onChangeIndex={this.handleChangeIndex}
                        >

                            {/* TODO: adding additional gfe screens with dynamically changing tabs */}
                            {/* first tab at the top(GFE) */}
                            <TabPanel value={currentTabIndex} index={0} className={classes.tabBackground}>





                                {/* Second tab panel for each GFE here
                            <AppBar position="static">
                                <Tabs
                                    value={currentGFETabIndex}
                                    onChange={this.handleGFEChange}
                                    indicatorColor="secondary"
                                    textColor="inherit"
                                    variant="scrollable"
                                    aria-label="gfe tab dynamic"
                                    scrollButtons='on'
                                >
                                    <Tab label="Default" />
                                    {GFEtabs.map(child => child)}
                                    <Tab icon={<PostAdd />} value="tabProperties" />
                                    
                                </Tabs>
                            </AppBar>
                            <Box padding={2}>{this.tabsContent.map(child => child)}</Box>
                            */}

                                <Box
                                    sx={{ flexGrow: 1, display: 'flex', width: '100vw', height: '100vh' }}
                                >
                                    <Tabs
                                        TabIndicatorProps={{ style: { backgroundColor: "#3355FF" } }}
                                        orientation="vertical"
                                        variant="scrollable"
                                        value={verticalTabIndex}
                                        onChange={this.handleVerticalChange}
                                        aria-label="Vertical tabs example"
                                        sx={{ borderRight: 1, borderColor: 'divider' }}
                                        classes={{ root: classes.leftTabs }}
                                    >
                                        <Tab label="Patient" {...a11yPropsVertical(0)} className={classes.tabs} />
                                        <Tab label="Care Team" {...a11yPropsVertical(1)} className={classes.tabs} />
                                        <Tab label="Encounter" {...a11yPropsVertical(2)} className={classes.tabs} />
                                        <Tab label="Summary" {...a11yPropsVertical(3)} className={classes.tabs} />
                                    </Tabs>

                                    {/* Patient tab */}
                                    <TabPanel value={verticalTabIndex} index={0}>
                                        <Grid item >
                                            <Grid container direction="column" >
                                                <Grid item className={classes.paper}>
                                                    <FormControl>
                                                        <FormLabel className={classes.inputBox}>Patient *</FormLabel>
                                                        {PatientSelect(this.state.patientList, this.state.selectedPatient, this.handleOpenPatients, this.handleSelectPatient)}
                                                    </FormControl>
                                                </Grid>
                                                < Grid item className={classes.patientBox}><GFERequestSummary summary={summary} /></Grid>
                                            </Grid>
                                        </Grid>
                                    </TabPanel>

                                    {/* Care Team tab */}
                                    <TabPanel value={verticalTabIndex} index={1}>
                                        <Grid item >
                                            <Card variant="outlined" className={classes.cardCareTeam}>
                                                <Grid container direction="column">
                                                    <Grid item className={classes.paper}>
                                                        <FormControl>
                                                            <Box sx={{ my: 2 }}>
                                                                <Grid  >
                                                                    {/* <Box >
                                                                        <b><u>
                                                                            <Typography variant="h6" >
                                                                                Care Team Details:
                                                                            </Typography>
                                                                        </u></b>
                                                                    </Box> */}
                                                                </Grid>
                                                            </Box>
                                                            <Grid>
                                                                <Box >
                                                                    <b>
                                                                        <Typography variant="subtitle1" >
                                                                            GFE Type:
                                                                        </Typography>
                                                                    </b>
                                                                </Box>
                                                            </Grid>

                                                            <RadioGroup row aria-label="GFE Type" name="row-radio-buttons-group" value={this.props.gfeTYpe} onChange={e => this.props.setGfeType(e.target.value)} defaultValue={this.props.gfeType}>
                                                                <FormControlLabel value="institutional" control={<Radio size="small" />} label="Institutional" />
                                                                <FormControlLabel value="professional" control={<Radio size="small" />} label="Professional" />
                                                            </RadioGroup>
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item className={classes.paper}>
                                                        <FormControl>
                                                            <Grid item  >
                                                                <Box sx={{ mb: 1 }}>
                                                                    <b>
                                                                        <Typography variant="subtitle1" >
                                                                            Billing Provider*:
                                                                        </Typography>
                                                                    </b>
                                                                </Box>
                                                            </Grid>

                                                            {this.props.gfeType === "professional" ?
                                                                ProfessionalBillingProviderSelect(professionalBillingProviderList, this.state.selectedBillingProvider, this.handleSelectBillingProvider)
                                                                :
                                                                OrganizationSelect(this.state.organizationList, this.state.selectedBillingProvider, "billing-provider-label", "billingProvider", this.handleOpenOrganizationList, this.handleSelectBillingProvider)
                                                            }

                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item className={classes.paper}>
                                                        <FormControl>
                                                            <Grid item>
                                                                <Box sx={{ mb: 1 }}>
                                                                    <b>
                                                                        <Typography variant="subtitle1" >
                                                                            Submitting Provider*:
                                                                        </Typography>
                                                                    </b>
                                                                </Box>
                                                            </Grid>
                                                            {this.props.gfeType === "professional" ?
                                                                ProfessionalBillingProviderSelect(professionalBillingProviderList, this.state.selectedSubmitter, this.handleSelectSubmitter)
                                                                :
                                                                OrganizationSelect(this.state.organizationList, this.state.selectedSubmitter, "submitting-provider-label", "submittingProvider", this.handleOpenOrganizationList, this.handleSelectSubmitter)
                                                            }

                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item className={classes.smallerPaddingPaper}>
                                                        <FormControl component="fieldset">
                                                            <Box >
                                                                <Grid item  >
                                                                    <b>
                                                                        <Typography variant="subtitle1" >
                                                                            Care Team:
                                                                        </Typography>
                                                                    </b>
                                                                </Grid>
                                                            </Box>
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                                <Box sx={{ width: 500, backgroundColor: "#FFFFFF", mb: 3, ml: 3 }}>
                                                    <CareTeam rows={this.state.careTeamList} providerList={providerListOptions} addOne={this.addOneCareTeam} edit={this.editCareTeam} deleteOne={this.deleteOneCareTeam} />
                                                </Box>
                                            </Card>
                                        </Grid>
                                    </TabPanel>



                                    <TabPanel value={verticalTabIndex} index={2}>
                                        <Grid item>
                                            <Grid className={classes.cardCareTeam}>
                                                <Grid container direction="column" >
                                                    <Grid item className={classes.paper}>
                                                        <Grid item >
                                                            <Box sx={{ mt: 3 }}>
                                                                <b><u>
                                                                    <Typography variant="h6" >
                                                                        Service Details:
                                                                    </Typography>
                                                                </u></b>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>

                                                    <Grid item className={classes.paper}>
                                                        <FormControl>
                                                            <FormLabel className={classes.inputBox}>Priority:* </FormLabel>
                                                            {PrioritySelect(this.state.priorityList, this.state.selectedPriority, this.handleOpenPriority, this.handleSelectPriority)}
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item className={classes.paper}>
                                                        <Grid container direction="row" spacing={3}>
                                                            <Grid item >
                                                                <FormControl >
                                                                    <FormLabel className={classes.smallerHeader}>Diagnosis*:</FormLabel>
                                                                    <Box sx={{ width: 500, backgroundColor: "#FFFFFF", ml: 3 }}>
                                                                        <DiagnosisItem rows={this.state.diagnosisList} addOne={this.addOneDiagnosisItem} edit={this.editDiagnosisItem} deleteOne={this.deleteOneDiagnosisItem} />
                                                                    </Box>

                                                                </FormControl>
                                                            </Grid>
                                                            <Grid item>
                                                                <Grid container direction="column" spacing={3}>
                                                                    <Grid item>
                                                                        <FormLabel>Type of Bill</FormLabel>
                                                                    </Grid>
                                                                    <Grid item className={classes.inputBox}>
                                                                        <TextField id="supportingInfoTypeOfBill" variant="standard" value={this.state.supportingInfoTypeOfBill} onChange={this.handleSupportingInfoTypeOfBill} />
                                                                    </Grid>

                                                                    <Grid item>
                                                                        <FormLabel>Inter Transaction Identifier</FormLabel>
                                                                    </Grid>
                                                                    <Grid item >
                                                                        <Select
                                                                            displayEmpty
                                                                            id="select-inter-trans-id"
                                                                            value={this.state.interTransIntermediary}
                                                                            label="Inter Trans Identifier"
                                                                            onChange={this.handleSelectInterTransId}
                                                                            className={classes.inputBox}
                                                                        >
                                                                            <MenuItem value="InterTransID0001">InterTransID0001</MenuItem>
                                                                        </Select>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>

                                                    <Grid item className={classes.paper}>
                                                        <Grid container direction="row" spacing={3}>
                                                            <Grid item >
                                                                <FormControl>
                                                                    <FormLabel className={classes.smallerHeader}>Procedure: </FormLabel>
                                                                    <Box sx={{ width: 500, backgroundColor: "#FFFFFF", ml: 3 }}>
                                                                        <ProcedureItem rows={this.state.procedureList} addOne={this.addOneProcedureItem} edit={this.editProcedureItem} deleteOne={this.deleteOneProcedureItem} />
                                                                    </Box>
                                                                </FormControl>
                                                            </Grid>
                                                            <Grid item>
                                                                <Grid container direction="column" spacing={3}>

                                                                    <Grid item>
                                                                        <FormLabel>GFE assigned service identifier</FormLabel>
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <Select
                                                                            displayEmpty
                                                                            id="select-gfe-service-id"
                                                                            value={this.state.gfeServiceId}
                                                                            label="GFE assigned service identifier"
                                                                            onChange={this.handleSelectGfeServiceId}
                                                                            className={classes.inputBox}
                                                                        >
                                                                            <MenuItem value="GFEAssignedServiceID0001">GFEAssignedServiceID0001</MenuItem>
                                                                        </Select>

                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>

                                                            <Grid item>
                                                                <FormControl>
                                                                    <FormLabel className={classes.smallerHeader}>Services:* </FormLabel>
                                                                    <Box sx={{ width: '65vw', backgroundColor: "#FFFFFF", ml: 3 }}>
                                                                        <ClaimItem rows={this.state.claimItemList} addOne={this.addOneClaimItem} edit={this.editClaimItem} deleteOne={this.deleteOneClaimItem} />
                                                                    </Box>
                                                                </FormControl>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
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
                                                            <Typography variant="h6">
                                                                Summary
                                                            </Typography>
                                                        </b>
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <ViewGFERequestDialog generateRequest={this.generateBundle} valid={this.isRequestValid} error={this.state.validationErrors} />
                                                    </Grid>
                                                </Grid>

                                                <Grid item><SummaryItem summary={summary} /></Grid>
                                            </FormControl>

                                            {/* Submit button*/}
                                            <Box display="flex" justifyContent="space-evenly">
                                                <FormControl>
                                                    <Button loading variant="contained" color="primary" type="submit" disabled={this.props.submittingStatus === true}>
                                                        Submit GFE
                                                    </Button>
                                                </FormControl>
                                            </Box>
                                        </Grid>
                                    </TabPanel>
                                </Box>
                            </TabPanel>



                            {/* Second tab on the top (AEOB) */}
                            <TabPanel value={currentTabIndex} index={1} >
                                Item Two
                            </TabPanel>
                        </Box >
                    </form>

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
                </Grid >
            </div >
        );
    }
}




export default withStyles(styles, { withTheme: true })(GFERequestBox);

