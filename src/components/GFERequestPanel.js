import React, { Component } from 'react';
import { Box, Grid, withStyles, Input, Button, InputLabel, InputAdornment, Select, FormLabel, FormControl, MenuItem, Typography } from '@material-ui/core';

import { getPatients, getDeviceRequestsForPatient, submitGFEClaim, getCoverage, getPractitionerRoles, getOrganizations, getCoverageByPatient, getPractitioners } from '../api'

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';

import GFERequestSummary from './GFERequestSummary'
import buildGFEBundle from './BuildGFEBundle';
import ViewGFERequestDialog from './ViewGFEDialog';
import { PlaceOfServiceList } from '../values/PlaceOfService';


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
        marginLeft: 30,
        marginTop: 20,
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
        width: "100%"
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
            patients? 
            patients.map((patient) => {
                return (<MenuItem key={patient.resource.id} value={patient.resource.id}>{getPatientDisplayName(patient)}</MenuItem>);
            }) : (<MenuItem/>)
        
        }
    </Select>);
}

const RequestSelect = (requests, currentValue, handleOpenRequestList, handleSelectRequest) =>
    <Select labelId="select-request-label" id="request" value={currentValue || ''} onOpen={handleOpenRequestList} onChange={handleSelectRequest}>
        {
            requests? (requests.map((request) => {
                var requestCode = '';
                if (request.resourceType === 'DeviceRequest') {
                    const coding = request.codeCodeableConcept.coding[0];
                    requestCode = `${coding.code} ${coding.display}`;
                }
                return (<MenuItem key={request.id} value={request.id}>{requestCode}</MenuItem>)
            })): <MenuItem/>
        }
    </Select>

const PractitionerSelect = (practitioners, currentValue, handleOpenPractitionerList, handleSelectPractitioner) =>
    <Select labelId="select-practitioner-label" id="practitioner" value={currentValue || ''} multiple onOpen={handleOpenPractitionerList} onChange={handleSelectPractitioner}>
        {
            practitioners ? (practitioners.map((practitioner) => {
                const name = practitioner.resource.name[0]
                var display = `${name.given[0]} ${name.family}`;

                return (<MenuItem key={practitioner.resource.id} value={practitioner.resource.id}>{display}</MenuItem>)
            })): <MenuItem/>
        }
    </Select>

const OrganizationSelect = (organizations, label, id, handleOpen, handleSelect) =>
    <Select required labelId={label} id={id} onOpen={handleOpen} onChange={handleSelect}>
        {
            organizations ? (organizations.map((org) => {
                return (<MenuItem key={org.resource.id} value={org.resource.id}>{org.resource.name}</MenuItem>)
            })) : <MenuItem/>
        }
    </Select>

const PractitionerRoleSelect = (roles, handleOpenPractitionerRoleList, handleSelectPractitionerRole, references) =>
    <Select required labelId="select-billing-provider-label" id="request" onOpen={handleOpenPractitionerRoleList} onChange={handleSelectPractitionerRole}>
        {
            roles ? (roles.map((role) => {
                const practitioner = references[role.practitioner.reference];
                const organization = references[role.organization.reference];
                const display = practitioner ? `${practitioner.name[0].text} from ${organization.name}` : "";
                return (<MenuItem key={role.id} value={role.id}>PractitionerRole: {display}</MenuItem>)
            })) : <MenuItem/>
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
            gfeServiceId: undefined
        };
        this.state = this.initialState;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.dataServerChanged && !prevProps.dataServerChanged) {
          this.resetState();
          this.props.setDataServerChanged(false);
        }
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
            patientSelected: true,
            patientRequestList: [],
            resolvedReferences: {},
            selectedRequest: undefined,
            selectedBillingProvider: undefined,
            selectedRequestPractitioner: undefined
        });
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

    handleSelectPractitionerRole = e => {
        this.setState({
            ...this.state,
            selectedBillingProvider: e.target.value
        })

    }

    handleOpenPractitionerList = e => {
        getPractitioners(this.props.ehrUrl)
            .then(result => {
                this.setState({
                    practitionerList: result.entry
                });
            })
    }

    handleSelectPractitioner = e => {
        this.setState({
            ...this.state,
            selectedPractitioner: e.target.value
        })

    }

    handleOpenSubmitterList = e => {
        getOrganizations(this.props.ehrUrl)
            .then(result => {
                this.setState({
                    ...this.state,
                    organizationList: result.entry
                })
            })
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

        if (this.state.selectedPatient === undefined || this.state.selectedRequest === undefined) {
            return input;
        }

        const fhirServerBaseUrl = this.props.ehrUrl;

        input.patient = {
            reference: `Patient/${this.state.selectedPatient}`,
            resource: this.state.patientList.filter(patient => patient.resource.id === this.state.selectedPatient)[0]
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
            },
            /* practitioner: practitioner ? {
                 reference: `Practitioner/${practitioner.id}`,
                 resource: practitioner
             } : undefined*/
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

        input.insurer = {
            reference: `Organization/${this.state.selectedPayor.id}`,
            resource: this.state.selectedPayor
        }

        input.bundleResources.push({
            fullUrl: `${fhirServerBaseUrl}/${input.insurer.reference}`,
            entry: input.insurer.resource
        })

        input.provider = {
            reference: `PractitionerRole/${this.state.selectedBillingProvider}`,
            resource: this.state.practitionerRoleList.filter(org => org.id === this.state.selectedBillingProvider)[0]
        }

        input.bundleResources.push({
            fullUrl: `${fhirServerBaseUrl}/${input.provider.reference}`,
            entry: input.provider.resource
        })

        input.billing = {
            total: this.state.totalClaim,
            interTransIntermediary: this.state.interTransIntermediary,
            gfeAssignedServiceId: this.state.gfeServiceId,
            items: [
                {
                    sequence: 1,
                    productOrService: requestCode,
                    estimatedDateOfService: this.state.selectedDate,
                    net: {
                        value: this.state.totalClaim,
                        currency: {
                            code: "USD"
                        }
                    },
                    placeOfService: PlaceOfServiceList.filter(pos => pos.code === this.state.placeOfService)[0] 
                }
            ],
            supportingInfo: [
                {
                    sequence: 1,

                }
            ]
        }

        input.diagnosis = {
            diagnosis: this.state.selectedDiagnosis
        }

        input.submitter = {
            reference: `Organization/${this.state.selectedSubmitter}`,
            resource: this.state.organizationList.filter(org => org.resource.id === this.state.selectedSubmitter)[0]
        }

        input.bundleResources.push({
            fullUrl: `${fhirServerBaseUrl}/${input.submitter.reference}`,
            entry: input.submitter.resource
        })

        // TODO only send those needed 
        input.resourceList = this.state.resolvedReferences;

        return input;
    }

    handleOnSubmit = e => {
        e.preventDefault();

        this.props.setSubmitting(true);
        this.props.setGfeSubmitted(true);
        submitGFEClaim(this.props.payorUrl + "/Claim/$gfe-submit", buildGFEBundle(this.generateRequestInput()))
            .then(response => {
                this.props.setSubmitting(false);
                console.log("Payer server returned response: ", response);
                this.props.setGfeResponse(response);
                this.props.setGfeRequestSuccess(true);
                this.props.setBundleId(response.id);
                this.props.setBundleIdentifier(response.identifier.value);

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
            })
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
        return this.state.selectedBillingProvider !== undefined && this.state.selectedPatient !== undefined && this.state.selectedDate !== undefined
            && this.state.selectedProcedure !== undefined && this.state.selectedSubmitter !== undefined 
    }

    render() {
        const { classes } = this.props;
        const summary = this.retrieveRequestSummary();
        return (
            <div>
                <Grid container>
                    <div className={classes.title}>
                        <Typography variant="h5" color="initial">Request</Typography>
                    </div>
                    <form onSubmit={this.handleOnSubmit}>
                        <Grid item xs={12}>
                            <Grid container className={classes.root} spacing={2}>
                                <Grid container className={classes.block}>
                                    <Grid item className={classes.blockHeader}>
                                        <Typography>Patient and Insurance Information</Typography>
                                    </Grid>

                                    <Grid item className={classes.paper} xs={12}>
                                        <FormControl>
                                            <FormLabel>Patient</FormLabel>
                                            {PatientSelect(this.state.patientList, this.state.selectedPatient, this.handleOpenPatients, this.handleSelectPatient)}
                                        </FormControl>
                                    </Grid>
                                    {this.state.patientSelected ?
                                        <GFERequestSummary summary={summary} /> : null
                                    }
                                    <Grid item className={classes.paper} xs={12}>
                                        <FormControl>
                                            <FormLabel>Diagnosis</FormLabel>
                                            <Select
                                                required
                                                id="select-diagnosis"
                                                label="Diagnosis"
                                                value={this.state.selectedDiagnosis}
                                                onChange={this.handleSelectDiagnosis}
                                            >
                                                <MenuItem value="S06.3">Focal traumatic brain injury</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                </Grid>


                                <Grid container className={classes.block}>
                                    <Grid item className={classes.blockHeader}>
                                        <Typography variant="body2" color="initial">Product or Service to be Estimated</Typography>
                                    </Grid>
                                    <Grid item className={classes.paper} xs={12}>
                                        <FormControl>
                                            <FormLabel>From Draft order</FormLabel>
                                            {RequestSelect(this.state.patientRequestList, this.state.selectedRequest, this.handleOpenRequestList, this.handleSelectRequest)}
                                        </FormControl>
                                    </Grid>
                                    <Grid item className={classes.paper} xs={12}>
                                        <FormControl>
                                            <FormLabel>Service or procedure</FormLabel>
                                            <Select 
                                                required
                                                displayEmpty
                                                id="select-service-procedure"
                                                value={this.state.selectedProcedure}
                                                label="Service or Procedure"
                                                onChange={this.handleSelectProcedure}
                                            >
                                                <MenuItem value="70551">70551</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item className={classes.paper} xs={12}>
                                        <FormControl>
                                            <FormLabel>Estimated Service Date</FormLabel>
                                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                <DatePicker required variant="inline" value={this.state.selectedDate} id="estimated-date" disablePast="true" onChange={this.updateEstimatedDate} />
                                            </MuiPickersUtilsProvider>
                                        </FormControl>
                                    </Grid>
                                    {false ? (
                                        <Grid item className={classes.paper} xs={12}>
                                            <FormControl>
                                                <FormLabel>Care team practitioner</FormLabel>
                                                {PractitionerSelect(this.state.practitionerList, this.state.selectedPractitioner, this.handleOpenPractitionerList, this.handleSelectPractitioner)}
                                            </FormControl>
                                        </Grid>
                                    ) : null
                                    }
                                </Grid>
                                <Grid container className={classes.block}>
                                    <Grid item className={classes.blockHeader}>
                                        <Typography variant="body2" color="initial">Billing Details</Typography>
                                    </Grid>
                                    <Grid item className={classes.paper} xs={12}>
                                        <FormControl>
                                            <FormLabel>Billing provider</FormLabel>
                                            {PractitionerRoleSelect(this.state.practitionerRoleList, this.handleOpenPractitionerRoleList, this.handleSelectPractitionerRole, this.state.resolvedReferences)}
                                        </FormControl>
                                    </Grid>
                                    <Grid item className={classes.paper} xs={12}>
                                        <FormControl>
                                            <InputLabel htmlFor="total-claim-amount">Total Claim Amount</InputLabel>
                                            <Input
                                                id="total-claim-amount"
                                                required
                                                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                                value={this.state.totalClaim}
                                                onChange={this.updateValue}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item className={classes.paper} xs={12}>
                                        <FormControl>
                                            <FormLabel>Inter Transaction Identifier</FormLabel>
                                            <Select
                                                required
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
                                    <Grid item className={classes.paper} xs={12}>
                                        <FormControl>
                                            <FormLabel>GFE assigned service identifier</FormLabel>
                                            <Select
                                                required
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
                                <Grid container className={classes.block}>
                                    <Grid item className={classes.blockHeader}>
                                        <Typography>Submitter Details</Typography>
                                    </Grid>
                                    <Grid item className={classes.paper} xs={12}>
                                        <FormControl>
                                            <FormLabel>Submitter</FormLabel>
                                            {OrganizationSelect(this.state.organizationList, "submitter-label", "submitter", this.handleOpenSubmitterList, this.handleSelectSubmitter)}
                                        </FormControl>
                                    </Grid>

                                </Grid>
                                <Grid item className={classes.paper} xs={12}>
                                    <Box display="flex" justifyContent="space-between">
                                        <ViewGFERequestDialog generateRequest={this.generateBundle} valid={this.isRequestValid}/>
                                        <FormControl>
                                            <Button loading variant="contained" color="primary" type="submit" className={classes.rightButton} disabled={this.props.submittingStatus === true}>
                                                Submit
                                            </Button>
                                        </FormControl>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(GFERequestBox);