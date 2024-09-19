import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../Context";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography } from "@mui/material";
import { Check, LibraryBooks } from "@mui/icons-material";
import Grid from "@mui/material/Grid2";
import { displayInstant, displayPeriod } from "../../util/dateUtils";
import { getPlannedServicePeriod, getRequestInitiationTime } from "../../util/taskUtils";
import { FHIRClient, retrieveGFEBundle, submitGFEClaim } from "../../api";
import { TabPanel } from "../TabPanel";
import AEOBResponsePanel from "../AEOBResponsePanel";
import { Editor } from "@monaco-editor/react";



export default function CoordinationTaskDetailsDialog({ open, onClose, task, setTask, addToLog }) {

  const TAB_TASK = "taskTab";
  const TAB_GFE = "gfeTab";
  const TAB_AEOB = "aeobTab";
  
  const { coordinationServer, payerServer } = useContext(AppContext);
  const [updated, setUpdated] = useState(false);
  const [currentTab, setCurrentTab] = useState(TAB_TASK);
  const [contributorTasks, setContributorTasks] = useState([]);
  const [gfeBundle, setGfeBundle] = useState(undefined);

  // aeob response panel related
  const [gfeSubmitted, setGfeSubmitted] = useState(false);
  const [pollUrl, setPollUrl] = useState(undefined);
  const [gfeRequestSuccess, setGfeRequestSuccess] = useState(false);
  const [receivedAEOBResponse, setReceivedAEOBResponse] = useState(undefined);


  // fetch related contrinutor tasks
  useEffect(() => {

    if (!task) {
      return;
    }
    
    FHIRClient(coordinationServer).request(`Task?part-of=${task.id}`).then((response) => {
      const res = (response.entry || []).map((entry) => entry.resource);
      setContributorTasks(res);
    });

  }, [task, coordinationServer]);


  const handleClose = () => {
    setCurrentTab(TAB_TASK);
    setGfeBundle(undefined);

    onClose(updated);
    setUpdated(false);
  }


  // update task.status to "completed"
  const markCompleted = async () => {
    task.status = "completed";
    FHIRClient(coordinationServer).update(task).then((response) => {
      setTask(response);
      setUpdated(true);
    }).catch((error) => {
      console.error("Error updating task", error);
      alert("Error updating task: " + error?.message);
    });
    
  };
  

  // invokes the $gfe-retrieve operation
  const retrieveGFE = () => {
    
    retrieveGFEBundle(coordinationServer, task.id).then((response) => {
      return response.json();
    }).then((data) => {
      addToLog("GFE Bundle retrieved successfully", "info", data);
      setGfeBundle(data);
      setCurrentTab(TAB_GFE);
    }).catch((error) => {
      console.error("Error retrieving GFE Bundle", error);
      alert("Error retrieving GFE Bundle: " + error?.message);
      setCurrentTab(TAB_TASK);
      setGfeBundle(undefined);
    });

  }


  // invokes the $gfe-submit operation
  const submitGFE = async (tab) => {

    if (!gfeBundle) {
      alert("No GFE Bundle to submit");
      return;
    }

    setGfeSubmitted(true);
    setGfeRequestSuccess(false);

    submitGFEClaim(payerServer, gfeBundle).then((response) => {
      addToLog("GFE Claim Response", "info", response);
      
      if (response.status !== 200 && response.status !== 202) {
        throw new Error("Expected 200 or 202 response, received " + response.status);
      }

      addToLog("GFE Claim submitted successfully", "info", response);

      setGfeRequestSuccess(true);

      // async response
      if (response.status === 202) {
        const pollUrl = response.headers.get("Content-Location");
        console.log("Poll URL", pollUrl);
        setPollUrl(pollUrl);
      }

      // sync response
      else if (response.status === 200) {
        
      }

      setCurrentTab(TAB_AEOB);

    }).catch((error) => {
      console.error("Error submitting GFE Claim", error);
      alert("Error submitting GFE Claim: " + error?.message);
      setCurrentTab(TAB_GFE);
    });

  };


  return (
    <Dialog open={open} onClose={() => { handleClose() }} maxWidth="xl" fullWidth={true}>
      <DialogTitle>Coordination Task Details</DialogTitle>
      <DialogContent>
        {!task ? 
          <p variant="body1">No task selected</p> :

          <>

            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} variant="fullWidth">
              <Tab label="Task" value={TAB_TASK} />
              <Tab label="GFE Bundle" value={TAB_GFE} disabled={!gfeBundle} />
              <Tab label="GFE Submit (AEOB)" value={TAB_AEOB} disabled={!gfeSubmitted} />
            </Tabs>


            {/* Coordination task tab */}
            <TabPanel value={currentTab} index={TAB_TASK}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <List>
                    <ListItem>
                      <ListItemText primary="Task ID" secondary={task.id} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Status" secondary={task.status} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Requester" secondary={task.requester.reference} />
                    </ListItem>
                  </List>
                </Grid>
                <Grid size={6}>
                  <List>
                    <ListItem>
                      <ListItemText primary="Task Last Modified" secondary={displayInstant(task.meta?.lastUpdated)} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Request Initiation" secondary={displayInstant(getRequestInitiationTime(task))} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Planned Service Period" secondary={displayPeriod(getPlannedServicePeriod(task))} />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Related Contributor Tasks</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Participant</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(contributorTasks||[]).map((contributorTask) => (
                      <TableRow key={contributorTask.id}>
                        <TableCell>{contributorTask.id}</TableCell>
                        <TableCell>{contributorTask.owner?.reference}</TableCell>
                        <TableCell>{contributorTask.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>


            {/* GFE Bundle tab from $gfe-retrieve */}
            <TabPanel value={currentTab} index={TAB_GFE}>
              <Editor
                height="60vh"
                defaultLanguage="json" 
                defaultValue={JSON.stringify(gfeBundle, null, 2)}
                options={{readOnly: true}}
              />
            </TabPanel>


            {/* AEOB tab result from $gfe-submit */}
            <TabPanel value={currentTab} index={TAB_AEOB}>
              <Typography variant="h6" gutterBottom>AEOB Response</Typography>
              <AEOBResponsePanel
                gfeRequestSuccess={gfeRequestSuccess}
                pollUrl={pollUrl}
                setPollUrl={setPollUrl}
                receivedAEOBResponse={receivedAEOBResponse}
                setReceivedAEOBResponse={setReceivedAEOBResponse}
                addToLog={console.log}
              />
            </TabPanel>

          </>
        }
      </DialogContent>
      <DialogActions>

      <Grid container spacing={2} sx={{flexGrow: 1}}>

        <Grid size={6}>
          {
            currentTab === TAB_TASK && (
              <Button onClick={() => { retrieveGFE() }} color="primary" variant="contained" startIcon={<LibraryBooks />}>Retrieve GFE Bundle</Button>
            )
          }

          {
            currentTab === TAB_GFE && (
              <Button onClick={() => { submitGFE() }} color="primary" variant="contained" startIcon={<LibraryBooks />}>Submit GFE to Payer</Button>
            )
          }
          
          {
            currentTab === TAB_TASK && task?.status !== "completed" && (
              <Button onClick={() => { markCompleted() }} color="success" variant="contained" startIcon={<Check />} sx={{marginLeft: 2}}>Mark Completed</Button>
            )
          }
          
        </Grid>

        <Grid size={6} display="flex" justifyContent="end">
          <Button onClick={() => { handleClose() }} color="primary">Close</Button>
        </Grid>

      </Grid>
      </DialogActions>
    </Dialog>
  );

}