import React, { useMemo, useState } from "react";

import "./App.css";
import { AppContext } from "./Context";
import { Tabs, Tab, Grid } from "@mui/material";
import MainPanel from "./components/MainPanel";
import CoordinationPanel from "./components/coordination/CoordinationPanel";

function App() {
  const [selectedWorkflow, setSelectedWorkflow] = useState("coordinationPanel");
  
  const [coordinationServers, setCoordinationServers] = useState([
    {
      value: "http://localhost:8080/fhir",
    },
    {
      value: "https://pct-coordination-platform.davinci.hl7.org/fhir",
    },
  ]);

  const [coordinationServer, setCoordinationServer] = useState(
    localStorage.getItem("pct-selected-coordination-server") ||
    (window.location.hostname === "localhost" ? coordinationServers[0].value : coordinationServers[1].value)
  );

  const [dataServers, setDataServers] = useState([
    {
      value: "http://localhost:8081/fhir",
    },
    {
      value: "https://pct-ehr.davinci.hl7.org/fhir",
    },
  ]);
  const [dataServer, setDataServer] = useState(
    localStorage.getItem("pct-selected-data-server") ||
    (window.location.hostname === "localhost" ? dataServers[0].value : dataServers[1].value)
  );
  
  const [payerServers, setPayerServers] = useState([
    {
      value: "http://localhost:8082/fhir",
    },
    {
      value: "https://pct-payer.davinci.hl7.org/fhir",
    }

  ]);
  const [payerServer, setPayerServer] = useState(
    localStorage.getItem("pct-selected-payer-server") ||
    (window.location.hostname === "localhost" ? payerServers[0].value : payerServers[1].value)
  );

  const [requester, setRequester] = useState(localStorage.getItem("pct-selected-requester") || "");
  const [contributor, setContributor] = useState(localStorage.getItem("pct-selected-contributor") || "");
  const [requesterDisplayName, setRequesterDisplayName] = useState(localStorage.getItem("pct-selected-requester-display") || "");
  const [contributorDisplayName, setContributorDisplayName] = useState(localStorage.getItem("pct-selected-contributor-display") || "");
  const [accountSettingsError, setAccountSettingsError] = useState(!requester || !contributor);

  
  const appContextValue = useMemo(
    () => ({ 
      coordinationServers, setCoordinationServers, coordinationServer, setCoordinationServer, 
      dataServers, setDataServers, dataServer, setDataServer, 
      payerServers, setPayerServers, payerServer, setPayerServer, 
      requester, setRequester, requesterDisplayName, setRequesterDisplayName, contributor, setContributor, contributorDisplayName, setContributorDisplayName, accountSettingsError, setAccountSettingsError}),
    [coordinationServers, coordinationServer, dataServers, dataServer, payerServers, payerServer, requester, requesterDisplayName, contributor, contributorDisplayName, accountSettingsError]
  );

  return (
    
    <AppContext.Provider value={appContextValue}>
      <div className="App">
        <header className="App-header">
          <Grid container>
            <Grid item xs={12}>
              {/* <AppBar position="static"> */}
              <Tabs
                value={selectedWorkflow}
                onChange={(e, newValue) => setSelectedWorkflow(newValue)}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
              >
                <Tab
                  label="Coordination Platform Workflow"
                  id={"coordinationPanel"}
                  value="coordinationPanel"
                />
                <Tab
                  label="Single GFE Submission"
                  id={"submissionPanel"}
                  value="submissionPanel"
                />
              </Tabs>
              {/* </AppBar> */}
            </Grid>
            <Grid item xs={12}>
            {selectedWorkflow === "coordinationPanel" ? (
              <CoordinationPanel />
            ) : (
              <MainPanel />
            )}
            </Grid>
          </Grid>
        </header>
      </div>
    </AppContext.Provider>
  );
}

export default App;
