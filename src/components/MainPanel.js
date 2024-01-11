import React, { useState } from "react";

import { AppBar, Grid, Tabs, Tab } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { TabPanel } from "./TabPanel";
import RequestPanel from "./GFERequestPanel";
import ResponsePanel from "./AEOBResponsePanel";
import Settings from "./Settings";
import MenuBar from "./MenuBar";
import * as _ from "lodash";
import { v4 } from "uuid";

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

  const [gfeResponse, setGfeResponse] = useState(undefined);
  const [gfeRequestSuccess, setGfeRequestSuccess] = useState(false);
  const [bundleId, setBundleId] = useState(undefined);
  const [bundleIdentifier, setBundleIdentifier] = useState(undefined);
  const [receivedAEOBResponse, setReceivedAEOBResponse] = useState(undefined);

  const [submitting, setSubmitting] = useState(false);
  const [gfeSubmitted, setGfeSubmitted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const generateGFE = () => {
    return {
      careTeamList: [{ id: v4() }],
      diagnosisList: [{ id: v4() }],
      procedureList: [{ id: v4() }],
      claimItemList: [{ id: v4() }],
      selectedPriority: "",
      selectedBillingProvider: "",
      interTransIntermediary: "",
      supportingInfoTypeOfBill: "",
    };
  };
  const generateNewSession = () => {
    const startingGFEId = v4();
    const initialGFEInfo = {};
    initialGFEInfo[startingGFEId] = generateGFE();
    return {
      patientList: [],
      priorityList: [],
      practitionerRoleList: [],
      practitionerList: [],
      organizationList: [],
      resolvedReferences: {},
      selectedProcedure: undefined,
      locationList: [],
      subjectInfo: {
        gfeType: "institutional",
        memberNumber: "",
        selectedAddress: "",
        birthdate: "",
        gender: "",
        telephone: "",
        selectedPatient: "",
        selectedPayor: "",
        selectedCoverage: "",
        subscriber: "",
        subscriberRelationship: "",
        coveragePlan: "",
        coveragePeriod: "",
        selectedBillingProvider: "",
      },
      gfeInfo: { ...initialGFEInfo },
      selectedGFE: startingGFEId,
    };
  };

  const initialSessionId = v4();
  const [selectedSession, setSelectedSession] = useState(initialSessionId);
  const initialSession = {};
  initialSession[initialSessionId] = generateNewSession();

  // const exampleSessions = require("../exampleState").exampleSessions;
  // const initialSessionId = Object.keys(exampleSessions)[0];
  // const [selectedSession, setSelectedSession] = useState(initialSessionId);
  // const initialSession = {};
  // initialSession[initialSessionId] = exampleSessions[initialSessionId];

  const [sessions, setSessions] = useState(initialSession);
  const addNewSession = () => {
    const newSessionId = v4();
    const newSessions = { ...sessions };
    newSessions[newSessionId] = generateNewSession();
    setSessions(newSessions);
    setSelectedSession(newSessionId);
    setGfeRequestSuccess(false);
    setMainPanelTab("1");
  };
  const updateSessionInfo = (update) => {
    const sessionInfo = _.cloneDeep(sessions);
    sessionInfo[selectedSession] = {
      ...sessionInfo[selectedSession],
      ...update,
    };
    setSessions(sessionInfo);
  };
  const updateSessionGfeInfo = (gfeInfo) => {
    const sessionInfo = _.cloneDeep(sessions);
    sessionInfo[selectedSession].gfes = gfeInfo;
    setSessions(sessionInfo);
  };
  const updateSessionSubjectInfo = (subjectInfo) => {
    const sessionInfo = _.cloneDeep(sessions);
    sessionInfo[selectedSession].subject = subjectInfo;
    setSessions(sessionInfo);
  };
  const [dataServers] = useState([
    {
      value: "http://localhost:8081/fhir",
    },
    {
      value: "https://pct-ehr.davinci.hl7.org/fhir",
    },
  ]);
  const [selectedDataServer, setSelectedDataServer] = useState(
    "https://pct-ehr.davinci.hl7.org/fhir"
  );
  const [payerServers] = useState([
    {
      value: "http://localhost:8080/fhir",
    }
  ]);
  const [selectedPayerServer, setSelectedPayerServer] = useState(
    "https://pct-payer.davinci.hl7.org/fhir"
  );
  const [dataServerChanged, setDataServerChanged] = useState(false);
  const [payerServerChanged, setPayerServerChanged] = useState(false);
  const [mainPanelTab, setMainPanelTab] = useState("1");
  const [pollUrl, setPollUrl] = useState(undefined);
  const [statusLogs, setStatusLogs] = useState([]);

  function resetState() {
    setGfeResponse(undefined);
    setReceivedAEOBResponse(undefined);
    setBundleId(undefined);
    setBundleIdentifier(undefined);
    setGfeSubmitted(false);
    setGfeRequestSuccess(false);
  }

  function addToLog(message, type, object) {
    const consoleOuput = type === "error" ? console.error : console.log;
    consoleOuput(
      `${new Date().toLocaleString()} :: ${
        !!type ? type : "info"
      } :: ${message}`,
      object
    );

    const newLog = {
      message: message,
      type: type,
      object: object,
      time: new Date(),
    };

    setStatusLogs([newLog, ...statusLogs]);
  }

  return (
    <React.Fragment>
      <Grid container direction="column">
        <Grid item xs={12}>
          <Grid container direction="column">
            <Grid item></Grid>
            <Grid item>
              <MenuBar
                toggleSettings={setShowSettings}
                showSettings={showSettings}
                toggleLogs={setShowLogs}
                showLogs={showLogs}
                selectedSession={selectedSession}
                setSelectedSession={setSelectedSession}
                sessions={Object.keys(sessions)}
                addNewSession={addNewSession}
                setGfeRequestSuccess={setGfeRequestSuccess}
                setMainPanelTab={setMainPanelTab}
                statusLogs={statusLogs}
                setStatusLogs={setStatusLogs}
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
                        session={sessions[selectedSession]}
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
          <AppBar position="static">
            <Tabs
              value={mainPanelTab}
              onChange={(e, newValue) => setMainPanelTab(newValue)}
              indicatorColor="secondary"
              textColor="inherit"
              variant="fullWidth"
            >
              <Tab label="Good Faith Estimate" id={"tab1"} value="1" />
              <Tab
                disabled={!gfeRequestSuccess}
                label="Advanced Explanation of Benefits"
                id={"tab2"}
                value="2"
              />
            </Tabs>
          </AppBar>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <TabPanel value={mainPanelTab} index={"1"}>
              <Grid item xs={12}>
                <RequestPanel
                  setSubmitting={setSubmitting}
                  submittingStatus={submitting}
                  setGfeResponse={setGfeResponse}
                  setGfeRequestSuccess={setGfeRequestSuccess}
                  setGfeSubmitted={setGfeSubmitted}
                  setBundleId={setBundleId}
                  setBundleIdentifier={setBundleIdentifier}
                  pollUrl={pollUrl}
                  setPollUrl={setPollUrl}
                  ehrUrl={selectedDataServer}
                  payorUrl={selectedPayerServer}
                  dataServerChanged={dataServerChanged}
                  setDataServerChanged={setDataServerChanged}
                  setReceivedAEOBResponse={setReceivedAEOBResponse}
                  updateSessionGfeInfo={updateSessionGfeInfo}
                  updateSessionSubjectInfo={updateSessionSubjectInfo}
                  updateSessionInfo={updateSessionInfo}
                  session={sessions[selectedSession]}
                  generateGFE={generateGFE}
                  setMainPanelTab={setMainPanelTab}
                  addToLog={addToLog}
                />
              </Grid>
            </TabPanel>
            <TabPanel value={mainPanelTab} index={"2"}>
              <Grid item xs={12}>
                <ResponsePanel
                  gfeResponse={gfeResponse}
                  submittingStatus={submitting}
                  gfeRequestSuccess={gfeRequestSuccess}
                  gfeSubmitted={gfeSubmitted}
                  bundleId={bundleId}
                  bundleIdentifier={bundleIdentifier}
                  payorUrl={selectedPayerServer}
                  pollUrl={pollUrl}
                  setPollUrl={setPollUrl}
                  receivedAEOBResponse={receivedAEOBResponse}
                  setReceivedAEOBResponse={setReceivedAEOBResponse}
                  payerServerChanged={payerServerChanged}
                  setPayerServerChanged={setPayerServerChanged}
                  dataServerChanged={dataServerChanged}
                  addToLog={addToLog}
                />
              </Grid>
            </TabPanel>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
