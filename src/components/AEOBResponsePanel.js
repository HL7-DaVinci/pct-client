import React, { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, FormLabel, Typography, makeStyles, FormControl, Grid, Button, LinearProgress, IconButton, Avatar, Tabs,
    Tab, AppBar
} from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

import { sendAEOInquiry } from '../api';
import ArrowBackIosNew from '@material-ui/icons/ArrowBackIos'
import PropTypes from 'prop-types';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

import Modal from '@mui/material/Modal';
import Divider from '@mui/material/Divider';






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
    aeobText: {

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



    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

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
    const currentTabIndex = 1;

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

        //set time of current request


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








    return (

        <div>
            <AppBar position="static">
                <Tabs
                    value={currentTabIndex}
                    //onChange={this.handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    aria-label="full width tabs example"

                >
                    <Tab label="Good Faith Estimate" {...a11yProps(0)} />
                    <Tab label="Advanced Explanation of Benefits" {...a11yProps(1)} />
                </Tabs>
            </AppBar>

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

                                    <Button loading variant="contained" color="primary" type="show-raw-gfe" onClick={handleOpen}>
                                        Raw JSON
                                    </Button>
                                    <Modal
                                        open={open}
                                        onClose={handleClose}
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
                                        <Button loading variant="contained" color="primary" type="show-raw-gfe" onClick={handleOpenAEOB}>
                                            Raw JSON
                                        </Button>
                                        <Modal
                                            open={openAEOB}
                                            onClose={handleCloseAEOB}
                                            aria-labelledby="modal-modal-title"
                                            aria-describedby="modal-modal-description"
                                        >
                                            <Box sx={style}>
                                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                                    Raw JSON of Initial Response from GFE Submission:
                                                </Typography>
                                                <Typography className={classes.response} color="textSecondary" gutterBottom>
                                                    <div>
                                                        <pre>{JSON.stringify(props.receivedAEOBResponse, undefined, 2)}</pre>
                                                    </div>
                                                </Typography>
                                            </Box>
                                        </Modal>
                                    </Grid>
                                </Grid>

                            </Grid>
                        </Grid>

                        <Grid>
                            <Divider />
                            <Divider light />



                            <Grid item>
                                <Typography variant="h5" gutterBottom>
                                    Advanced Explanation of Benefits
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    id:
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    Start date:
                                </Typography>
                            </Grid>


                            <Grid container direction="row">
                                <Grid item>
                                    <Grid container direction="column">
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Totals:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Submitted Amount:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Eligible Amount:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Deductible:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Copay:
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid item>
                                    <Grid container direction="column">
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Coinsurance:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Noncovered:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Paid to Provider:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Member Liability:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Copay:
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid item>
                                    <Grid container direction="column">
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Details:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Insurance:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" gutterBottom>
                                                Submitting Provider:
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>


                    </AccordionDetails>
                </Accordion>
            ) : null
            }

            {(props.gfeRequestSuccess === true && props.gfeRequestPending) ? (
                <Grid item className={classes.aeobQueryButton}>
                    <FormControl>
                        <Button variant="contained" color="primary" type="submit" onClick={handleSendInquiry}>
                            Query AEOB Bundle
                        </Button>
                    </FormControl>
                </Grid>
            ) : null
            }

            {/*
            {
                (props.gfeRequestSuccess === true && props.gfeRequestPending) ? (
                    <Grid item>
                        <FormControl>
                            <Button variant="contained" color="primary" type="submit" onClick={handleSendInquiry}>
                                Send AEOB Inquiry
                            </Button>
                        </FormControl>
                    </Grid>
                ) : null
            }
            {
                props.receivedAEOBResponse ? (
                    <Grid item className={classes.content}>
                        <CardContent className={classes.content}>
                            <Typography className={classes.blockHeader} color="textSecondary" gutterBottom>
                                AEOB Inquiry Response received from the payer
                            </Typography>
                            <Typography className={classes.title} color="textSecondary" gutterBottom>
                                AEOB outcome is {aeobInquiryOutcome}
                            </Typography>
                        </CardContent>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                            Received AEOB response
                        </Typography>
                        <Typography className={classes.response} color="textSecondary" gutterBottom>
                            <div>
                                <pre>{JSON.stringify(props.receivedAEOBResponse, undefined, 2)}</pre>
                            </div>
                        </Typography>
                    </Grid>
                ) : null
            }
            {
                aeobInquiryError ? (<Card>
                    <CardContent className={classes.error}>
                        <Typography className={classes.title} gutterBottom>
                            Error occurred
                        </Typography>
                    </CardContent>
                    <CardContent className={classes.content}>
                        <Typography className={classes.response} color="textSecondary" gutterBottom>
                            <div>
                                <pre>{JSON.stringify(aeobError, undefined, 2)}</pre>
                            </div>
                        </Typography>
                    </CardContent></Card>) : null
            }
        */}





            {/*

            <Grid container spacing={2} direction="column" >
                <Grid item>
                    <FormControl>
                        <Grid container>
                            <Grid item>
                                <Button loading variant="contained" color="secondary" onClick={handleNewRequest} startIcon={<ArrowBackIosNew />}>
                                    Create New GFE Request
                                </Button>
                            </Grid>
                        </Grid>
                    </FormControl>
                </Grid>
                <Grid item className={classes.responseBody}>
                    <Grid container spacing={3} direction="row" className={classes.root}>
                        <Grid item className={classes.header} xs={12}>
                            <Typography variant="h5" color="initial">Response</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container direction="row" spacing={2} className={classes.aeobResponse}>
                                <Grid item>
                                    <Grid container spacing={2} direction="column">
                                        <Grid item className={classes.header} xs={12}>
                                            <Typography variant="h6" color="initial">GFE Response</Typography>
                                        </Grid>
                                        <Grid item className={classes.content}>
                                            <div className={classes.body}>
                                                <Card>
                                                    {
                                                        props.submittingStatus === true ?
                                                            (
                                                                <Grid item direction="row"><CardContent className={classes.content}>
                                                                    <Typography />
                                                                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                                                                        Sending GFE request to payer ...
                                                                    </Typography>
                                                                    <LinearProgress color="inherit" />
                                                                </CardContent></Grid>) : null
                                                    }
                                                    {
                                                        (props.gfeSubmitted === true && props.gfeRequestSuccess === true) ?
                                                            (<Grid item direction="row">
                                                                <CardContent>
                                                                    <Typography className={classes.blockHeader} color="textSecondary" gutterBottom>
                                                                        GFE Response received from the payer
                                                                    </Typography>
                                                                    <CardContent className={classes.content}>
                                                                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                                                                            Returned bundle ID is {props.bundleId} with identifier {props.bundleIdentifier}
                                                                        </Typography>
                                                                        <Typography className={classes.response} color="textSecondary" gutterBottom>
                                                                            <div>
                                                                                <pre>{JSON.stringify(props.gfeResponse, undefined, 2)}</pre>
                                                                            </div>
                                                                        </Typography>
                                                                    </CardContent>
                                                                </CardContent></Grid>) : null
                                                    }
                                                    {
                                                        (props.gfeSubmitted === true && props.gfeRequestSuccess === false) ? (<CardContent className={classes.error}>
                                                            <Typography />
                                                            <Typography className={classes.title} gutterBottom>
                                                                Error occurred
                                                            </Typography>
                                                            <CardContent className={classes.content}>
                                                                <Typography className={classes.title} color="textSecondary" gutterBottom>
                                                                    <div>
                                                                        <pre>{JSON.stringify(props.gfeResponse, undefined, 2)}</pre>
                                                                    </div>
                                                                </Typography>
                                                            </CardContent>
                                                        </CardContent>) : null
                                                    }
                                                </Card>
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <Grid container spacing={2} direction="column" justifyContent='center'>
                                        <Grid item className={classes.header} xs={12}>
                                            <Typography variant="h6" color="initial">AEOB Inquiry and Response</Typography>
                                        </Grid>
                                        <Grid item>
                                            <div className={classes.body}>
                                                <Card>
                                                    {
                                                        (props.gfeRequestSuccess === true && props.gfeRequestPending) ? (
                                                            <Grid item>
                                                                <FormControl>
                                                                    <Button variant="contained" color="primary" type="submit" onClick={handleSendInquiry}>
                                                                        Send AEOB Inquiry
                                                                    </Button>
                                                                </FormControl>
                                                            </Grid>
                                                        ) : null
                                                    }
                                                    {
                                                        props.receivedAEOBResponse ? (
                                                            <Grid item className={classes.content}>
                                                                <CardContent className={classes.content}>
                                                                    <Typography className={classes.blockHeader} color="textSecondary" gutterBottom>
                                                                        AEOB Inquiry Response received from the payer
                                                                    </Typography>
                                                                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                                                                        AEOB outcome is {aeobInquiryOutcome}
                                                                    </Typography>
                                                                </CardContent>
                                                                <Typography className={classes.title} color="textSecondary" gutterBottom>
                                                                    Received AEOB response
                                                                </Typography>
                                                                <Typography className={classes.response} color="textSecondary" gutterBottom>
                                                                    <div>
                                                                        <pre>{JSON.stringify(props.receivedAEOBResponse, undefined, 2)}</pre>
                                                                    </div>
                                                                </Typography>
                                                            </Grid>
                                                        ) : null
                                                    }
                                                    {
                                                        aeobInquiryError ? (<Card>
                                                            <CardContent className={classes.error}>
                                                                <Typography className={classes.title} gutterBottom>
                                                                    Error occurred
                                                                </Typography>
                                                            </CardContent>
                                                            <CardContent className={classes.content}>
                                                                <Typography className={classes.response} color="textSecondary" gutterBottom>
                                                                    <div>
                                                                        <pre>{JSON.stringify(aeobError, undefined, 2)}</pre>
                                                                    </div>
                                                                </Typography>
                                                            </CardContent></Card>) : null
                                                    }
                                                </Card>
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>

                            </Grid>
                        </Grid>

                    </Grid >
                </Grid>
            </Grid>
                                                */}
        </div >
    );
}