import {useContext, useEffect, useState} from 'react';
import Grid from "@mui/material/Grid2";
import { createStyles, makeStyles } from "@mui/styles";
import { TabPanel } from '../TabPanel';
import CoordinationMenuBar from './CoordinationMenuBar';
import RequesterPanel from './RequesterPanel';
import ContributorPanel from './ContributorPanel';
import Settings from '../Settings';
import AccountSettings from './AccountSettings';
import AEOBPanel from './AEOBPanel';
import GFEPanel from './GFEPanel';
import {getSupportedSearchParams} from "../../api";
import {AppContext} from "../../Context";


const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: '100%',
      textAlign: 'start',
      backgroundColor: theme.palette.background.paper,
    },
    settings: {
      marginLeft: 30,
      marginTop: 20,
    },
  })
);


export default function CoordinationPanel() {

  const [currentTab, setCurrentTab] = useState("requesterTab");
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [statusLogs, setStatusLogs] = useState([]);
  const [selectedButton, setSelectedButton] = useState('coordination');

  const classes = useStyles();
  const appContext = useContext(AppContext);

  useEffect(() => {
    async function fetchSupportedSearchParams() {
      console.log("  Fetching supported search parameters from servers...");
      try {
        const coordinationParams = await getSupportedSearchParams(
            appContext.coordinationServer,
            'Task',
            'cp'
        );
        const dataParams = await getSupportedSearchParams(
            appContext.dataServer,
            'DocumentReference',
            'ehr'
        );
        const payerParams = await getSupportedSearchParams(
            appContext.payerServer,
            'DocumentReference',
            'payer'
        );
      } catch (error) {
        console.error('Error fetching supported search params:', error);
      }
    }
    fetchSupportedSearchParams();
  }, []);

  // function addToLog(message, type, object) {
  const addToLog = (message, type, object) => {
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
  };

  // Content selection logic for navigation pane
  let content;
  switch (selectedButton) {
    case 'coordination':
      content = (
        <>
          <div className="tab-navigation">
            <button
              className={`tab-button${currentTab === 'requesterTab' ? ' active' : ''}`}
              onClick={() => setCurrentTab('requesterTab')}
            >
              Coordination Tasks
            </button>
            <button
              className={`tab-button${currentTab === 'contributorTab' ? ' active' : ''}`}
              onClick={() => setCurrentTab('contributorTab')}
            >
              Contributor Tasks
            </button>
          </div>
          <Grid size={12} sx={{ minHeight: 400 }}>
            <TabPanel value={currentTab} index="requesterTab">
              <RequesterPanel addToLog={addToLog} />
            </TabPanel>
            <TabPanel value={currentTab} index="contributorTab">
              <ContributorPanel addToLog={addToLog} />
            </TabPanel>
            <TabPanel value={currentTab} index="aeobsTab">
              <AEOBPanel selectedButton={selectedButton} />
            </TabPanel>
            <TabPanel value={currentTab} index="gfesTab">
              <GFEPanel />
            </TabPanel>
          </Grid>
        </>
      );
      break;
    case 'gfes':
      content = (
        <GFEPanel selectedButton={selectedButton} />
      );
      break;
    case 'aeobs':
      content = (
        <AEOBPanel selectedButton={selectedButton} />
      );
      break;
    default:
      content = (
        <div className="content-placeholder">Select a section.</div>
      );
  }

  return (
    <div className={classes.root}>
      <Grid container>
        <Grid size={12}>
          <CoordinationMenuBar 
            toggleSettings={(showSettings) => setShowSettings(showSettings)}
            showSettings={showSettings}
            toggleAccountSettings={(showAccountSettings) => setShowAccountSettings(showAccountSettings)}
            showAccountSettings={showAccountSettings}
            statusLogs={statusLogs}
            setStatusLogs={setStatusLogs}
          />
        </Grid>

        <Grid size={12}>
          {showAccountSettings ? (
            <AccountSettings
              className={classes.settings}
              // resetState={resetState}
            />
          ) : (
            <span></span>
          )}
        </Grid>
        
        <Grid size={12}>
          {showSettings ? (
            <Settings
              className={classes.settings}
              // resetState={resetState}
            />
          ) : (
            <span></span>
          )}
        </Grid>
      </Grid>
      <div className="layout-container">
        {/* Navigation Pane (Left Side) */}
        <div className="navigation-pane">
          <div className="nav-buttons">
            <button
                className={`nav-button${selectedButton === 'coordination' ? ' selected' : ''}`}
              onClick={() => setSelectedButton('coordination')}
            >
              Coordination
            </button>
            <button
                className={`nav-button${selectedButton === 'gfes' ? ' selected' : ''}`}
              onClick={() => setSelectedButton('gfes')}
            >
              My GFEs
            </button>
            <button
                className={`nav-button${selectedButton === 'aeobs' ? ' selected' : ''}`}
              onClick={() => setSelectedButton('aeobs')}
            >
              My AEOBs
            </button>
          </div>
        </div>
        <div className="divider-line"></div>
        <div className="content-area">
          {content}
        </div>
      </div>
    </div>
  );

}
