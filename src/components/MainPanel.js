import React, { useState } from 'react';

import { Grid, makeStyles, createStyles } from '@material-ui/core';

import RequestPanel from './GFERequestPanel';
import ResponsePanel from './AEOBResponsePanel';
import Settings from './Settings';
import MenuBar from './MenuBar';

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            backgroundColor: theme.palette.background,
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: 'left',
            color: theme.palette.text.secondary,
        },
        title: {
            top: 50,
            textAlign: 'center',
            display: "flex",
            backgroundColor: "#556cd6"
        },
        block: {
            marginTop: 50,
            marginBottom: 50,
            alignContent: "left",
            marginLeft: 50,
            minWidth: 200
        },
        content: {
            alignContent: "left",
            marginRight: 500
        },
        settings: {
            marginLeft: 30,
            marginTop: 20,
        }
    }),
);

export default function MainPanel() {
    const classes = useStyles();
    const [submitting, setSubmitting] = useState(false);
    const [gfeSubmitted, setGfeSubmitted] = useState(false);
    const [gfeResponse, setGfeResponse] = useState(undefined);
    const [gfeRequestSuccess, setGfeRequestSuccess] = useState(false);
    const [bundleId, setBundleId] = useState(undefined);
    const [bundleIdentifier, setBundleIdentifier] = useState(undefined);
    const [gfeRequestPending, setGfeRequestPending] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [receivedAEOBResponse, setReceivedAEOBResponse] = useState(undefined);
    const [dataServers] = useState([
        {
            "value": "http://localhost:8080/fhir"
        },
        {
            "value": "https://davinci-pct-ehr.logicahealth.org/fhir"
        }
    ]);
    const [selectedDataServer, setSelectedDataServer] = useState("https://davinci-pct-ehr.logicahealth.org/fhir");
    const [payerServers] = useState([
        {
            "value": "http://localhost:8081/fhir"
        },
        {
            "value": "https://davinci-pct-payer.logicahealth.org/fhir"
        }
    ]);
    const [selectedPayerServer, setSelectedPayerServer] = useState("https://davinci-pct-payer.logicahealth.org/fhir");
    const [dataServerChanged, setDataServerChanged] = useState(false);
    const [payerServerChanged, setPayerServerChanged] = useState(false);
    const [gfeType, setGfeType] = useState("institutional");
    const [showRequest, setShowRequest] = useState(true);
    const [showResponse, setShowResponse] = useState(false);
    
    function resetState() {
        setGfeResponse(undefined);
        setReceivedAEOBResponse(undefined);
        setBundleId(undefined);
        setBundleIdentifier(undefined);
        setGfeSubmitted(false);
        setGfeRequestSuccess(false);
    }
    return (
        <React.Fragment>
            <MenuBar toggleSettings={setShowSettings} showSettings={showSettings} />
            <div>
                {
                    showSettings ? (<Grid container className={classes.settings}>
                        <Grid item xs={12}>
                            <Settings className={classes.settings}
                                dataServers={dataServers}
                                selectedDataServer={selectedDataServer}
                                setSelectedDataServer={setSelectedDataServer}
                                setDataServerChanged={setDataServerChanged}
                                payerServers={payerServers}
                                selectedPayerServer={selectedPayerServer}
                                setSelectedPayerServer={setSelectedPayerServer}
                                setPayerServerChanged={setPayerServerChanged}
                                resetState={resetState}
                            />
                        </Grid>
                    </Grid>) : null
                }
                <Grid container spacing={1} className={classes.content}>
                    {showRequest ? (<Grid item xs={12}>
                        <RequestPanel setSubmitting={setSubmitting}
                            submittingStatus={submitting}
                            setGfeResponse={setGfeResponse}
                            setGfeRequestSuccess={setGfeRequestSuccess}
                            setGfeSubmitted={setGfeSubmitted}
                            setGfeRequestPending={setGfeRequestPending}
                            setBundleId={setBundleId}
                            setBundleIdentifier={setBundleIdentifier}
                            ehrUrl={selectedDataServer}
                            payorUrl={selectedPayerServer}
                            dataServerChanged={dataServerChanged}
                            setDataServerChanged={setDataServerChanged} 
                            gfeType={gfeType}
                            setGfeType={setGfeType}
                            setReceivedAEOBResponse={setReceivedAEOBResponse}
                            setShowRequest={setShowRequest}
                            setShowResponse={setShowResponse}/>
                    </Grid>) : null}
                    {showResponse ? (<Grid item xs={12}>
                        <ResponsePanel
                            gfeResponse={gfeResponse}
                            submittingStatus={submitting}
                            gfeRequestSuccess={gfeRequestSuccess}
                            gfeSubmitted={gfeSubmitted}
                            bundleId={bundleId}
                            bundleIdentifier={bundleIdentifier}
                            gfeRequestPending={gfeRequestPending}
                            payorUrl={selectedPayerServer}
                            receivedAEOBResponse={receivedAEOBResponse}
                            setReceivedAEOBResponse={setReceivedAEOBResponse}
                            payerServerChanged={payerServerChanged}
                            setPayerServerChanged={setPayerServerChanged}
                            dataServerChanged={dataServerChanged}
                            setShowRequest={setShowRequest}
                            setShowResponse={setShowResponse}
                        />
                    </Grid>) : null}
                </Grid>
            </div>
        </React.Fragment>
    );
}