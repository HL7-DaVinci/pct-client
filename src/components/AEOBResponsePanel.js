import React, { useEffect, useState } from 'react';
import {
    Box, Typography, makeStyles, FormControl, Grid, Button, Tabs,
    Tab, AppBar
} from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { sendAEOInquiry } from '../api';
import PropTypes from 'prop-types';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Modal from '@mui/material/Modal';
import Divider from '@mui/material/Divider';
import jp from "jsonpath";
import moment from 'moment';
import AEOBItemsTable from "./AEOBItemsTable";



const useStyles = makeStyles({
    root: {
        backgroundColor: "#dadacc"
    },
    title: {
        fontSize: 14,
        fontWeight: "bold"
    },
    response: {
        textAlign: "left",
        fontSize: 14
    },
    content: {
        flexGrow: 1,
        overflow: 'auto',
        maxWidth: 1200,
        maxHeight: 400,
        marginLeft: 50
    },
    body: {
        marginTop: "12px"
    },
    blockHeader: {
        backgroundColor: "#d7d3d3",
        width: "100%"
    },
    header: {
        textAlign: "center",
        width: "100%"
    },
    error: {
        color: "red",
        textAlign: "center"
    },
    aeobResponse: {
        minWidth: "500px"
    },
    responseBody: {
        minHeight: "800px"
    },
    aeobInitialResponseText: {
        textAlign: "left",
        justifyContent: "space-between"
    },
    aeobInitialResponseButtonRawJSON: {
        alignContent: "right"
    },
    style: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    },
    aeobQueryButton: {
        marginTop: 20,
        alignItems: "right"
    },
    spaceTop: {
        marginTop: 40
    },
    spaceBelow: {
        marginBottom: 20
    },
    card: {
        minWidth: "70vw",
        textAlign: "left",
        marginLeft: 0,
        backgroundColor: "#D3D3D3"
    },
    info: {
        backgroundColor: "#EEEEEE"
    }
});


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


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




export default function AEOBResponsePanel(props) {
    const [openAEOBContent, setOpenAEOBContent] = React.useState(false);
    const handleCloseAEOBContent = () => {
        setOpenAEOBContent(false);
    };


    const [openGFEResponse, setOpenGFEResponse] = React.useState(false);
    const handleOpenGFEResponse = () => setOpenGFEResponse(true);
    const handleCloseGFEResponse = () => setOpenGFEResponse(false);

    const [openAEOB, setOpenAEOB] = React.useState(false);
    const handleOpenAEOB = () => setOpenAEOB(true);
    const handleCloseAEOB = () => setOpenAEOB(false);

    const classes = useStyles();

    const [aeobInquirySubmitted, setAeobInquirySubmitted] = useState(false);
    const [aeobInquirySuccess, setAeobInquirySuccess] = useState(false);
    const [aeobInquiryPending, setAeobInquiryPending] = useState(false);
    const [aeobInquiryError, setAeobInquiryError] = useState(false);
    const [aeobError, setAeobError] = useState(undefined)
    const [aeobInquiryOutcome, setAeobInquiryOutcome] = useState(undefined);
    const [currentTabIndex, setCurrentTabIndex] = useState(1);

    useEffect(() => {
        if (props.dataServerChanged || props.payerServerChanged || props.receivedAEOBResponse === undefined) {
            setAeobInquirySubmitted(false);
            setAeobInquirySuccess(false);
            setAeobInquiryPending(false);
            setAeobInquiryError(false);
            setAeobError(undefined);
        }
    }, [props.dataServerChanged, props.payerServerChanged]);

    function handleSendInquiry() {
        setAeobInquirySubmitted(true);
        setAeobInquiryPending(true);
        sendAEOInquiry(props.payorUrl, props.bundleIdentifier)
            .then(response => {
                console.log("received response: ", response);
                props.setReceivedAEOBResponse(response);
                const foundAeob = response.entry && response.entry.length >= 0 ? response.entry[0].resource.entry.find(item => item.resource.resourceType === "ExplanationOfBenefit") : undefined;
                const outCome = foundAeob ? foundAeob.resource.outcome : "unknown";
                setAeobInquiryOutcome(outCome);
                setAeobInquirySuccess(true);
                setAeobInquiryPending(false);
                setAeobInquirySubmitted(false);
            })
            .catch(error => {
                console.log("got error", error);
                setAeobInquiryPending(false);
                setAeobInquirySuccess(false);
                setAeobInquirySubmitted(false);
                setAeobInquiryError(true);
                setAeobError(error.toJSON());
            });
    }

    function handleNewRequest() {
        props.setShowResponse(false)
        props.setShowRequest(true);
    }

    function handleRequestTime() {
        return new Date().toLocaleString();
    }


    function getNameDisplay(resource) {

        var returnString = "";

        if (resource.constructor.name === 'Object' && resource !== null) {
            if (resource.resourceType === 'Organization')
                returnString = resource.name;
            else if (resource.resourceType === 'Patient' || resource.resourceType === 'Practitioner' || resource.resourceType === 'relatedPerson') {
                returnString = getHumanNameDisplay(resource.name[0]);
            }
            else {
                returnString = "Name for resource of type " & resource.resourceType & " is not supported.";
            }
        }

        return returnString;
    }

    function getHumanNameDisplay(humanName) {

        var returnString = "";

        if (humanName.constructor.name === 'Object' && humanName !== null) {
            if ('text' in humanName)
                returnString = humanName.text;
            else if ('family' in humanName) {
                returnString = humanName.family;
                if ('given' in humanName)
                    returnString += ", " + humanName.given[0];
                if (humanName.given.length > 1)
                    returnString += " " + humanName.given[1];
            }
        }
        else
            returnString = "Human Name for object of type " & typeof humanName & " is not supported.";
        return returnString;
    }


    function getPatientResource() {
        return jp.query(props, "$..[?(@.fullUrl ==" + "'" + jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].patient.reference')[0] + "')].resource")[0];
    }

    function getPayorResource() {
        return jp.query(props, "$..[?(@.fullUrl ==" + "'" + jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].insurer.reference')[0] + "')].resource")[0];
    }

    function getCoverageResource() {
        return jp.query(props, "$..[?(@.fullUrl ==" + "'" + jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].insurance[0].coverage.reference')[0] + "')].resource")[0];
    }

    // The subscriber URL can be retrieved from Coverage.subscriber.reference, however unlike some references it is not the full url in the reference. 
    // Tried to use a partial match, but that is not working with the jsonpath implementation. 
    // Generally it is not expected that references will have the fullURL. May to implement a check to see if full url is provided, and if not prefix the base. 
    // This base will need to be determined somehow, perhaps the fullUrl of the ExplanationOfBenefit
    function getSubscriberResource() {
        return jp.query(props, "$..[?(@.fullUrl =~ " + "'/.*" + getCoverageResource().subscriber.reference + "/')].resource")[0];
    }

    function getPatientResource() {
        return jp.query(props, "$..[?(@.fullUrl ==" + "'" + jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].patient.reference')[0] + "')].resource")[0];
    }

    function getSubmittingProviderResource(eobResource) {
        return jp.query(props, "$..[?(@.fullUrl ==" + "'" + eobResource.provider.reference + "')].resource")[0];
    }

    function getTelecomDisplay(telecomArray) {
        var returnString = "";

        if (Array.isArray(telecomArray)) {
            telecomArray.forEach(function (telecom) {
                returnString += telecom.value;
                if ('use' in telecom) {
                    returnString += " (" + telecom.use;
                    if ('system' in telecom) {
                        returnString += " " + telecom.system;
                    }
                    returnString += ")";
                }
                else if ('system' in telecom) {
                    returnString += "(" + telecom.system + ")";
                }
                returnString += "; ";
            });
        }
        else
            console.log(telecomArray);

        return returnString;
    }

    function getAddressDisplay(addressArray) {
        var returnString = "";

        if (Array.isArray(addressArray)) {
            addressArray.forEach(function (address) {
                if ('text' in address) {
                    returnString += " " + address.text;
                }
                else {
                    returnString += "TODO Address without text";
                }
            });
        }
        else
            console.log(addressArray);

        return returnString;
    }


    function getSubmittingProviderId() {

        //get the insurance url from insurance ref
        const submitterProviderURL = jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].provider.reference')[0];

        //get the id of the provider organization using that url
        const fullString = "$..[?(@.fullUrl ==" + "'" + submitterProviderURL + "'" + ")].resource.id"

        //returns string: submitter-org-1
        return jp.query(props, (fullString))[0];
    }

    function getDate() {

        const date = jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].meta.lastUpdated')[0];
        return moment(date).format('lll');

    }

    function calcCopay() {

        const copayPercentage = jp.query(props, '$..[?(@.resourceType == "Coverage")].costToBeneficiary[0].valueQuantity.value')[0];
        const copayDeci = copayPercentage / 100;
        const copayAmount = (copayDeci * jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].total[0].amount.value')[0]).toFixed(2);
        const currency = jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].total[0].amount.currency')[0];

        return copayAmount + " " + currency;
    }


    const handleChange = (event) => {
        //this.setState({ currentTabIndex: value });
        setCurrentTabIndex(event.target.value);

    };
    function getBackToMain() {
        if (currentTabIndex !== 1) {
            window.location.reload(false);
            return false;
        }
    }


    return (
        <div>
            <AppBar position="static">
                <Tabs
                    value={currentTabIndex}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    aria-label="full width tabs example"
                >
                    <Tab label="Good Faith Estimate" {...a11yProps(0)} />
                    <Tab label="Advanced Explanation of Benefits" {...a11yProps(1)} />
                </Tabs>
            </AppBar>
            <TabPanel value={currentTabIndex} index={0} className={classes.tabBackground}>
                {getBackToMain()}

            </TabPanel>


            <TabPanel value={currentTabIndex} index={1} className={classes.tabBackground}>



                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>AEOB- Initial Response from GFE Submission</Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.aeobInitialResponseText}>
                        <Grid container spacing={1}>
                            <Grid container spacing={2}>
                                <Grid item xs={10}>
                                    <Grid item md={4}>
                                        <Typography variant="h5" gutterBottom>
                                            Bundle:
                                        </Typography>
                                    </Grid>
                                    <Grid item md={4}>
                                        <Typography variant="body1" gutterBottom>
                                            ID: {props.bundleId}
                                        </Typography>
                                    </Grid>
                                    <Grid item md={4}>
                                        <Typography variant="body1" gutterBottom>
                                            Identifier: {props.bundleIdentifier}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid item alignItems="flex-end" xs={2}>
                                    <Grid item>

                                        <Button loading variant="contained" color="primary" type="show-raw-gfe" onClick={handleOpenGFEResponse}>
                                            Raw JSON
                                        </Button>

                                        <Modal
                                            open={openGFEResponse}
                                            onClose={handleCloseGFEResponse}
                                            aria-labelledby="modal-modal-title"
                                            aria-describedby="modal-modal-description"
                                        >
                                            <Box sx={style}>
                                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                                    Raw JSON of Initial Response from GFE Submission:
                                                </Typography>
                                                <div>
                                                    <pre>{JSON.stringify(props.gfeResponse, undefined, 2)}</pre>
                                                </div>
                                            </Box>
                                        </Modal>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {(props.receivedAEOBResponse) ? (
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>AEOB- Query at {handleRequestTime()}</Typography>

                        </AccordionSummary>
                        <AccordionDetails className={classes.aeobInitialResponseText}>
                            <Grid container spacing={1}>
                                <Grid container spacing={2}>
                                    <Grid item xs={10}>
                                        <Grid item md={4}>
                                            <Typography variant="h5" gutterBottom>
                                                <b><u>Bundle</u></b>
                                            </Typography>
                                        </Grid>
                                        <Grid item md={4}>
                                            <Typography variant="body1" gutterBottom>
                                                ID: {jp.query(props, '$..[?(@.resourceType == "Bundle")].id')[0]}
                                            </Typography>
                                        </Grid>
                                        <Grid item md={4}>
                                            <Typography variant="body1" gutterBottom>
                                                Identifier: {jp.query(props, '$..[?(@.resourceType == "Bundle")].identifier.value')[0]}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    <Grid item alignItems="flex-end" xs={2}>
                                        <Grid item>
                                            <Button loading variant="contained" color="primary" type="show-raw-gfe" onClick={handleOpenAEOB}>
                                                Raw JSON
                                            </Button>
                                            <Dialog
                                                maxWidth="lg"
                                                open={openAEOB}
                                                onClose={handleCloseAEOB}
                                            >
                                                <DialogTitle>Raw JSON of AEOB Response:</DialogTitle>
                                                <DialogContent>
                                                    <Box
                                                        noValidate
                                                        component="form"
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            m: 'auto',
                                                            width: 'fit-content',
                                                            height: "fit-content"
                                                        }}
                                                    >
                                                        <div>
                                                            <pre>{JSON.stringify(props.receivedAEOBResponse, undefined, 2)}</pre>
                                                        </div>
                                                    </Box>

                                                    <DialogActions>
                                                        <Button onClick={handleCloseAEOBContent}>Close</Button>
                                                    </DialogActions>
                                                </DialogContent>
                                            </Dialog>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>


                            <Grid className={classes.info}>
                                <Divider />
                                <Divider light />

                                <Grid item>
                                    <Typography variant="h5" gutterBottom>
                                        <b><u>Patient Information</u></b>
                                    </Typography>
                                </Grid>
                                <Grid container direction="row" spacing={9} >
                                    <Grid item>
                                        <Grid container direction="column" >
                                            <Grid item>
                                                <Typography variant="h6" gutterBottom>
                                                    <b>Demographics:</b>
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" gutterBottom>
                                                    <b>Name:</b> {/*getHumanNameDisplay(jp.query("$..[?(@.fullUrl ==" + "'" + jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].patient.reference')[0] + "'" + ")].resource.id"))*/}
                                                    {/*getHumanNameDisplay(jp.query(props, "$..[?(@.fullUrl ==" + "'" + jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].patient.reference')[0] + "')].resource.name[0]")[0])*/}
                                                    {getHumanNameDisplay(getPatientResource().name[0])}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" gutterBottom>
                                                    <b>Birthdate:</b> {getPatientResource().birthDate}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" gutterBottom>
                                                    <b>Gender:</b> {getPatientResource().gender}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" gutterBottom>
                                                    <b>Telephone:</b> {getTelecomDisplay(getPatientResource().telecom)}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" gutterBottom>
                                                    <b>Address:</b> {getAddressDisplay(getPatientResource().address)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item>
                                        <Grid container direction="column">
                                            <Grid item>
                                                <Typography variant="h6" gutterBottom>
                                                    <b>Insurance:</b>
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" gutterBottom>
                                                    <b>Payor:</b> {getPayorResource().name}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" gutterBottom>
                                                    <b>Subscriber:</b> {getCoverageResource().subscriberId} ({getCoverageResource().relationship.coding[0].display})
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" gutterBottom>
                                                    <b>Member ID:</b> {getCoverageResource().id}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" gutterBottom>
                                                    <b>Plan:</b> {getCoverageResource().class[0].name}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" gutterBottom>
                                                    <b>Coverage Period:</b> {getCoverageResource().period.start} to {getCoverageResource().period.end}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>



                            <Grid style={{ marginTop: 33 }}>
                                <Divider />
                                <Divider light />
                                <Divider />
                                <Divider light />

                                <Grid item>
                                    <Grid container spacing={0}>
                                        <Grid item xs={5}>
                                            <Typography variant="h5" gutterBottom>
                                                <b><u>Advanced Explanation of Benefits</u></b>
                                            </Typography>

                                        </Grid>
                                        <Grid item xs={4} >
                                            <Typography variant="h6" align='left' style={{ color: "#d7d3d3" }}>THIS IS NOT A BILL</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body1" gutterBottom>
                                        <b>ID:</b> {jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].id')[0]}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body1" gutterBottom>
                                        <b>Created:</b> {getDate()}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body1" gutterBottom>
                                        <b>Outcome:</b> {aeobInquiryOutcome}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body1" gutterBottom className={classes.spaceBelow}>
                                        <b>Submitting Provider:</b> {getNameDisplay(getSubmittingProviderResource(jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")]')[0]))} ({getSubmittingProviderId()})
                                    </Typography>
                                </Grid>


                                <Grid container direction="row" spacing={9}>
                                    <Grid item>
                                        <Grid container direction="column" >
                                            <Grid item>
                                                <Typography variant="h6" gutterBottom>
                                                    <b>Totals:</b>
                                                </Typography>
                                            </Grid>
                                            {jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].total').map((value, index) => {
                                                return <Grid item>
                                                    <Typography variant="body1" gutterBottom>
                                                        <b>{value[0].category.coding[0].display}:</b> {value[0].amount.value.toFixed(2)} {value[0].amount.currency}
                                                    </Typography>
                                                </Grid>
                                            })}

                                            <Grid item>
                                                <Typography variant="body1" gutterBottom className={classes.spaceBelow}>
                                                    <b>Copay:</b> {calcCopay()}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid item>
                                    <Typography variant="h6" gutterBottom>
                                        <b>Items:</b>
                                    </Typography>

                                    <AEOBItemsTable title="Items" data={props} />

                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion >
                ) : null
                }
                {
                    (props.gfeRequestSuccess === true && props.gfeRequestPending) ? (

                        <Grid item className={classes.aeobQueryButton}>
                            <FormControl>
                                <Button variant="contained" color="primary" type="submit" onClick={handleSendInquiry}>
                                    Query AEOB Bundle
                                </Button>
                            </FormControl>
                        </Grid>
                    ) : null
                }

            </TabPanel>
        </div >

    );
}