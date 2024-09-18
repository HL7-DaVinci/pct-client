import { useState } from 'react';
import { Tabs, Tab } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { createStyles, makeStyles } from "@mui/styles";
import { TabPanel } from '../TabPanel';
import CoordinationMenuBar from './CoordinationMenuBar';
import RequesterPanel from './RequesterPanel';
import ContributorPanel from './ContributorPanel';
import Settings from '../Settings';
import AccountSettings from './AccountSettings';


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


  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container>
        <Grid size={12}>
          <CoordinationMenuBar 
            toggleSettings={(showSettings) => setShowSettings(showSettings)}
            showSettings={showSettings}
            toggleAccountSettings={(showAccountSettings) => setShowAccountSettings(showAccountSettings)}
            showAccountSettings={showAccountSettings}
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

        <Grid size={12}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} variant="fullWidth">
            <Tab label="Coordination Requester" value={"requesterTab"}></Tab>
            <Tab label="Coordination Contributor" value={"contributorTab"}></Tab>
          </Tabs>
        </Grid>

        <Grid size={12}>
          <TabPanel value={currentTab} index="requesterTab">
            <RequesterPanel />
          </TabPanel>

          <TabPanel value={currentTab} index="contributorTab">
            <ContributorPanel />
          </TabPanel>
        </Grid>
      </Grid>
    </div>
  );

}

