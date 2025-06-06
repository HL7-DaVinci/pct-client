import React, { useState } from "react";

import { AppBar, Tabs, Tab } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { createStyles, makeStyles } from "@mui/styles";
import { TabPanel } from "./TabPanel";
import RequestPanel from "./GFERequestPanel";
import ResponsePanel from "./AEOBResponsePanel";
import Settings from "./Settings";
import MenuBar from "./MenuBar";
import * as _ from "lodash";
import { v4 } from "uuid";
import { generateGFE, generateNewSession } from "../util/gfeUtil";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: "100%",
      textAlign: 'start',
      backgroundColor: theme.palette.background.paper
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
      <div className={classes.root}>
        <Grid container>
          <Grid size={12}>
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
          <Grid size={12}>
            {showSettings ? (
              <Settings
                className={classes.settings}
                resetState={resetState}
                session={sessions[selectedSession]}
              />
            ) : (
              <span></span>
            )}
          </Grid>
        </Grid>

        <Grid size={12}>
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
        <Grid size={12}>
          <Grid container spacing={1}>
            <TabPanel value={mainPanelTab} index={"1"}>
              <Grid size={12}>
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
              <Grid size={12}>
                <ResponsePanel
                  gfeResponse={gfeResponse}
                  submittingStatus={submitting}
                  gfeRequestSuccess={gfeRequestSuccess}
                  gfeSubmitted={gfeSubmitted}
                  bundleId={bundleId}
                  bundleIdentifier={bundleIdentifier}
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
      </div>
  );
}
