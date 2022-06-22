import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Divider, List, Typography, makeStyles, FormControl, Grid, Button, LinearProgress, IconButton, Avatar } from '@material-ui/core';
import { sendAEOInquiry } from '../api';
import ArrowBackIosNew from '@material-ui/icons/ArrowBackIos'
import ViewGFERequestDialog from './ViewGFEDialog';


const useStyles = makeStyles({
    root: {
        //backgroundColor: "#dadacc"
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
    topbutton: {
        marginTop: 10,
        marginBottom: 20,
        marginLeft: 20
    }
});



export default function AEOBResponsePanel(props) {
    const classes = useStyles();

    const [aeobInquirySubmitted, setAeobInquirySubmitted] = useState(false);
    const [aeobInquirySuccess, setAeobInquirySuccess] = useState(false);
    const [aeobInquiryPending, setAeobInquiryPending] = useState(false);
    const [aeobInquiryError, setAeobInquiryError] = useState(false);
    const [aeobError, setAeobError] = useState(undefined)
    const [aeobInquiryOutcome, setAeobInquiryOutcome] = useState(undefined);

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


    const [open, setOpen] = React.useState(false);
    const [openAEOB, setOpenAEOB] = React.useState(false);

    const [request, setRequest] = React.useState(undefined);
    const [error, setError] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleClickOpenAEOB = () => {
        setOpenAEOB(true);
    };

    const handleCloseAEOB = () => {
        setOpenAEOB(false);
    };

    return (
        <div>

            <Grid container spacing={2} direction="column" >
                <Grid item>
                    <Grid container justifyContent='left'>
                        <Grid item className={classes.topbutton}>
                            <Button loading variant="contained" color="secondary" onClick={handleNewRequest} startIcon={<ArrowBackIosNew />}>
                                Create New GFE Request
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item className={classes.responseBody}>

                    <Grid container spacing={3} direction="row" className={classes.root}>
                        <Grid item className={classes.header} xs={12}>
                            <Typography variant="h5" color="initial">Estimate Details</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container direction="row" spacing={2} className={classes.aeobResponse}>
                                <Divider />
                                <Grid item>
                                    <Grid container spacing={2} direction="column">
                                        <Grid item className={classes.header} xs={12}>
                                            <Typography variant="h6" color="initial">GFE Response</Typography>
                                        </Grid>
                                        <Divider light />
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



            <Grid item xs={12}>
                <Box>
                    <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                        Review GFE Request
                    </Button>
                    <Dialog

                        maxWidth="lg"
                        open={open}
                        onClose={handleClose}
                    >


                        <DialogTitle>
                            Review Submitted GFE Request

                        </DialogTitle>
                        <DialogContent>
                            {
                                error ? null : (<DialogContentText>
                                    Submitted GFE Request:
                                </DialogContentText>)
                            }
                            <Box
                                noValidate
                                component="form"
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    m: 'auto',
                                    width: 'fit-content',

                                }}
                            >
                                {
                                    error ? (<div style={{ color: "red" }}>
                                        <span>Request Validation Errors:</span>
                                        <ul>
                                            {
                                                request ? (request.map(error => (
                                                    <li>
                                                        {error}
                                                    </li>
                                                ))) : (props.error.map(error => (
                                                    <li>
                                                        {error}
                                                    </li>
                                                )))
                                            }
                                        </ul>

                                    </div>) : (
                                        <div>
                                            <pre>{JSON.stringify(props.gfeResponse, undefined, 2)}</pre>
                                        </div>
                                    )
                                }
                                <DialogActions>
                                    <Button onClick={handleClose}>Close</Button>
                                </DialogActions>
                            </Box>
                        </DialogContent>
                    </Dialog>
                </Box>

                <Box>
                    <Button variant="outlined" color="primary" onClick={() => {
                        handleSendInquiry();
                        handleClickOpenAEOB();
                    }}>
                        Review Submitted AEOB Bundle
                    </Button>
                    <Dialog
                        maxWidth="lg"
                        open={openAEOB}
                        onClose={handleCloseAEOB}
                    >


                        <DialogTitle>
                            Review Submitted AEOB Bundle

                        </DialogTitle>
                        <DialogContent>
                            {
                                error ? null : (<DialogContentText>
                                    Submitted GFE Request:
                                </DialogContentText>)
                            }
                            <Box
                                noValidate
                                component="form"
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    m: 'auto',
                                    width: 'fit-content',

                                }}
                            >
                                {
                                    error ? (<div style={{ color: "red" }}>
                                        <span>Request Validation Errors:</span>
                                        <ul>
                                            {
                                                request ? (request.map(error => (
                                                    <li>
                                                        {error}
                                                    </li>
                                                ))) : (props.error.map(error => (
                                                    <li>
                                                        {error}
                                                    </li>
                                                )))
                                            }
                                        </ul>

                                    </div>) : (
                                        <div>
                                            <pre>{
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


                                            </pre>
                                        </div>
                                    )
                                }
                                <DialogActions>
                                    <Button onClick={handleCloseAEOB}>Close</Button>
                                </DialogActions>
                            </Box>
                        </DialogContent>
                    </Dialog>
                </Box>
            </Grid>

        </div >
    );
}