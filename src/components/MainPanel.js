import React, { useState } from "react";

import {
  AppBar,
  Grid,
  Tabs,
  Tab,
  makeStyles,
  createStyles,
  MenuItem,
} from "@material-ui/core";
import { TabPanel } from "./TabPanel";
import RequestPanel from "./GFERequestPanel";
import ResponsePanel from "./AEOBResponsePanel";
import Settings from "./Settings";
import MenuBar from "./MenuBar";
import * as _ from "lodash";
import { v4 } from "uuid";
import { exampleSessions } from "../exampleState";
import { Select } from "@mui/material";

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

  const generateGFE = () => {
    return {
      careTeamList: [{ id: v4() }],
      diagnosisList: [{ id: v4() }],
      procedureList: [{ id: v4() }],
      claimItemList: [{ id: v4() }],
      selectedPriority: null,
      selectedBillingProvider: null,
      interTransIntermediary: null,
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
        memberNumber: null,
        selectedAddress: null,
        birthdate: null,
        gender: null,
        telephone: null,
        selectedPatient: null,
        selectedPayor: null,
        selectedCoverage: null,
        subscriber: null,
        subscriberRelationship: null,
        coveragePlan: null,
        coveragePeriod: null,
        selectedBillingProvider: null,
      },
      gfeInfo: { ...initialGFEInfo },
      selectedGFE: startingGFEId,
    };
  };
  const initialSessionId = v4();
  const [selectedSession, setSelectedSession] = useState(initialSessionId);
  const initialSession = {};
  initialSession[initialSessionId] = generateNewSession();

  const [sessions, setSessions] = useState(initialSession);
  const addNewSession = () => {
    const newSessionId = v4();
    const newSessions = { ...sessions };
    newSessions[newSessionId] = generateNewSession();
    setSessions(newSessions);
    setSelectedSession(newSessionId);
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
    "https://davinci-pct-payer.logicahealth.org/fhir"
  );
  const [dataServerChanged, setDataServerChanged] = useState(false);
  const [payerServerChanged, setPayerServerChanged] = useState(false);
  const [showRequest, setShowRequest] = useState(true);
  const [showResponse, setShowResponse] = useState(false);
  const [mainPanelTab, setMainPanelTab] = useState("1");
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
            <Grid item></Grid>
            <Grid item>
              <MenuBar
                toggleSettings={setShowSettings}
                showSettings={showSettings}
                selectedSession={selectedSession}
                setSelectedSession={setSelectedSession}
                sessions={Object.keys(sessions)}
                addNewSession={addNewSession}
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
                  updateSessionGfeInfo={updateSessionGfeInfo}
                  updateSessionSubjectInfo={updateSessionSubjectInfo}
                  updateSessionInfo={updateSessionInfo}
                  session={sessions[selectedSession]}
                  generateGFE={generateGFE}
                  setMainPanelTab={setMainPanelTab}
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
            </TabPanel>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
