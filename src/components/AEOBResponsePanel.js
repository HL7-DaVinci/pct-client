import React, { useEffect, useState} from 'react';
import { Card, CardContent, Typography, makeStyles, FormControl, Grid, Button, LinearProgress} from '@material-ui/core';
import { sendAEOInquiry } from '../api';

const useStyles = makeStyles({
    root: {
        minWidth: 275,
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
        maxHeight: 1400,
        width: 650
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
    }
});



export default function AEOBResponsePanel(props) {
    const classes = useStyles();

    const [aeobInquirySubmitted, setAeobInquirySubmitted] = useState(false);
    const [aeobInquirySuccess, setAeobInquirySuccess] = useState(false);
    const [aeobInquiryPending, setAeobInquiryPending] = useState(false);
    const [aeobInquiryError, setAeobInquiryError] = useState(false);
    const [aeobError, setAeobError] = useState(undefined)
    const [aeobInquiryResponseReceived, setAeobInquiryResponseReceived] = useState(false);
    const [aeobInquiryOutcome, setAeobInquiryOutcome] = useState(undefined);

    useEffect(() => {
        if (props.dataServerChanged || props.payerServerChanged) {
            setAeobInquirySubmitted(false);
            setAeobInquirySuccess(false);
            setAeobInquiryPending(false);
            setAeobInquiryError(false);
            setAeobError(undefined);
            setAeobInquiryResponseReceived(false);
        }
    }, [props.dataServerChanged, props.payerServerChanged]);

    function handleSendInquiry() {
        setAeobInquirySubmitted(true);
        setAeobInquiryPending(true);
        sendAEOInquiry(props.payorUrl, props.bundleIdentifier)
            .then(response => {
                console.log("received resposne: ", response);
                props.setReceivedAEOBResponse(response);
                setAeobInquirySuccess(true);
                setAeobInquiryPending(false);
                setAeobInquirySubmitted(false);
                setAeobInquiryResponseReceived(true);
            })
            .catch(error => {
                console.log("got error", error);
                setAeobInquiryPending(false);
                setAeobInquirySuccess(false);
                setAeobInquirySubmitted(false);
                setAeobInquiryError(true);
                setAeobError(error.toJSON());
                setAeobInquiryResponseReceived(true);
            });
    }

    return (
        <Grid container spacing={1} className={classes.content}>
            <Grid item direction="row" className={classes.header}>
                <Typography variant="h5" color="initial">Response</Typography>
            </Grid>
            <Grid item direction="row">
                <div className={classes.body}>
                    <Card className={classes.root}>
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
            <Grid item>
                <div className={classes.body}>
                    <Card className={classes.root}>
                        {
                            (props.gfeRequestSuccess === true && props.gfeRequestPending) ? (
                                <Grid item direction="row">
                                    <FormControl>
                                        <Button variant="contained" color="primary" type="submit" onClick={handleSendInquiry}>
                                            Send AEOB Inquiry
                                        </Button>
                                    </FormControl>
                                </Grid>
                            ) : null
                        }
                        {
                            aeobInquiryResponseReceived ? (
                                <CardContent className={classes.content}>
                                    <Typography className={classes.blockHeader} color="textSecondary" gutterBottom>
                                        AEOB Inquiry Response received from the payer
                                    </Typography>
                                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                                                AEOB outcome is {aeobInquiryOutcome}
                                            </Typography>
                                </CardContent>
                            ) : null
                        }
                        {
                            props.receivedAEOBResponse ? (
                                <Grid item direction="row">
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

        </Grid >

    );
}