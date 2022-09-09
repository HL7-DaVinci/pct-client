import React, { useState } from "react";

import { Grid, makeStyles, createStyles } from "@material-ui/core";

import RequestPanel from "./GFERequestPanel";
import ResponsePanel from "./AEOBResponsePanel";
import Settings from "./Settings";
import MenuBar from "./MenuBar";
import {
  MockGfeResponse as MockResponse /*MockSingleGFEResponse as MockResponse*/,
} from "../mock/GfeResponse";
import { MockAeobResponse } from "../mock/AeobResponse";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: "100%",
      backgroundColor: theme.palette.background,
    },
    settings: {
      marginLeft: 30,
      marginTop: 20,
    },
  })
);

export default function MainPanel() {
  const classes = useStyles();

  // ///////////////////// Temporty Debugging Setting /////////
  // const [gfeResponse, setGfeResponse] = useState(MockResponse);
  // const [gfeRequestSuccess, setGfeRequestSuccess] = useState(true);
  // const [bundleId, setBundleId] = useState(MockResponse.identifier.value);
  // const [bundleIdentifier, setBundleIdentifier] = useState(MockResponse.identifier.value);
  // const [receivedAEOBResponse, setReceivedAEOBResponse] = useState(MockAeobResponse);
  // ///////////////////////////////////////////////////////////

  const [gfeResponse, setGfeResponse] = useState(undefined);
  const [gfeRequestSuccess, setGfeRequestSuccess] = useState(false);
  const [bundleId, setBundleId] = useState(undefined);
  const [bundleIdentifier, setBundleIdentifier] = useState(undefined);
  const [receivedAEOBResponse, setReceivedAEOBResponse] = useState(undefined);

  const [submitting, setSubmitting] = useState(false);
  const [gfeSubmitted, setGfeSubmitted] = useState(false);
  const [gfeRequestPending, setGfeRequestPending] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [dataServers] = useState([
    {
      value: "http://localhost:8080/fhir",
    },
    {
      value: "https://davinci-pct-ehr.logicahealth.org/fhir",
    },
  ]);
  const [selectedDataServer, setSelectedDataServer] = useState(
    "https://davinci-pct-ehr.logicahealth.org/fhir"
  );
  const [payerServers] = useState([
    {
      value: "http://localhost:8080/fhir",
    },
    {
      value: "https://davinci-pct-payer.logicahealth.org/fhir",
    },
    {
      value: "https://fhir.collablynk.com/edifecs/fhir/R4",
    },
  ]);
  const [selectedPayerServer, setSelectedPayerServer] = useState(
    "http://localhost:8080/fhir"
  );
  const [dataServerChanged, setDataServerChanged] = useState(false);
  const [payerServerChanged, setPayerServerChanged] = useState(false);
  const [gfeType, setGfeType] = useState("institutional");
  const [showRequest, setShowRequest] = useState(false);
  const [showResponse, setShowResponse] = useState(true);

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
      <Grid container direction="column">
        <Grid item xs={12}>
          <Grid container direction="column">
            <Grid item>
              <MenuBar
                toggleSettings={setShowSettings}
                showSettings={showSettings}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container>
                {showSettings ? (
                  <Grid container className={classes.settings}>
                    <Grid item xs={12}>
                      <Settings
                        className={classes.settings}
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
                  </Grid>
                ) : (
                  <Grid container>
                    <Grid item>
                      <span></span>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            {showRequest ? (
              <Grid item xs={12}>
                <RequestPanel
                  setSubmitting={setSubmitting}
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
                  setReceivedAEOBResponse={setReceivedAEOBResponse}
                  setShowRequest={setShowRequest}
                  setShowResponse={setShowResponse}
                />
              </Grid>
            ) : null}
            {showResponse ? (
              <Grid item xs={12}>
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
              </Grid>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
