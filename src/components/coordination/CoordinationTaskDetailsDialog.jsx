import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../Context";
import { Accordion, AccordionDetails, AccordionSummary, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography } from "@mui/material";
import { ArrowDropDown, Check, LibraryBooks, AttachFile } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid2";
import { displayInstant, displayPeriod } from "../../util/displayUtils";
import { getPlannedServicePeriod, getRequestInitiationTime } from "../../util/taskUtils";
import { FHIRClient, retrieveGFEPacket, submitGFEClaim } from "../../api";
import { TabPanel } from "../TabPanel";
import AEOBResponsePanel from "../AEOBResponsePanel";
import { Editor } from "@monaco-editor/react";
import GFEInformationBundleView from "../shared/GFEInformationBundleView";
import buildGFEPacketDocumentReference from "../BuildGFEPacketDocumentReference";


export default function CoordinationTaskDetailsDialog({ open, onClose, task, setTask, addToLog }) {

  const TAB_TASK = "taskTab";
  const TAB_TASK_JSON = "taskJsonTab";
  const TAB_INFO_BUNDLE_JSON = "infoBundleJsonTab";
  const TAB_GFE = "gfeTab";
  const TAB_AEOB = "aeobTab";
  
  const { coordinationServer, payerServer, dataServer } = useContext(AppContext);
  const [updated, setUpdated] = useState(false);
  const [currentTab, setCurrentTab] = useState(TAB_TASK);
  const [infoBundle, setInfoBundle] = useState(undefined);
  const [contributorTasks, setContributorTasks] = useState([]);
  const [gfePacket, setGfePacket] = useState(undefined);

  // aeob response panel related
  const [gfeSubmitted, setGfeSubmitted] = useState(false);
  const [pollUrl, setPollUrl] = useState(undefined);
  const [gfeRequestSuccess, setGfeRequestSuccess] = useState(false);
  const [receivedAEOBResponse, setReceivedAEOBResponse] = useState(undefined);


  // fetch related contributor tasks
  useEffect(() => {

    if (!task) {
      return;
    }

    const infoBundleInput = (task.input || []).find((input) => input.type?.coding[0].code === "gfe-information-bundle");
    if (infoBundleInput) {
      try {
        const bundleData = atob(infoBundleInput.valueAttachment.data);
        setInfoBundle(JSON.parse(bundleData));
      }
      catch (e) {
        console.error("Error parsing GFE Information Bundle", e);
        setInfoBundle(undefined);
      }
    }

    
    FHIRClient(coordinationServer).request(`Task?part-of=${task.id}`).then((response) => {
      const res = (response.entry || []).map((entry) => entry.resource);
      setContributorTasks(res);
    });

  }, [task, coordinationServer]);


  const handleClose = () => {
    setCurrentTab(TAB_TASK);
    setGfePacket(undefined);
    setGfeSubmitted(false);

    onClose(updated);
    setUpdated(false);
  }


  // update task status to mark "completed", "cancelled" or "entered-in-error"
  const updateTask = async (status) => {
    task.status = status;
    if (status === "completed" || status === "cancelled"){
      // set default statusReason
      task.statusReason= {
        coding: [
          {
            system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTTaskStatusReasonCSTemporaryTrialUse",
            code: status === "completed" ? "fulfilled" : "service-cancelled",
            display: status === "completed" ? "Fulfilled" : "Service Cancelled"
          },
        ],
      };
    }
    task.businessStatus= {
      coding: [
        {
          system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTTaskBusinessStatusCSTemporaryTrialUse",
          code: "closed",
          display: "Closed"
        },
      ],
    };
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

    retrieveGFEPacket(coordinationServer, task.id).then((response) => {
      return response.json();
    }).then((data) => {
      addToLog("GFE Packet retrieved successfully", "info", data);
      // Create document reference and post to EHR Server
      const docRef = buildGFEPacketDocumentReference(data, task);
      FHIRClient(dataServer).update(docRef).then((response) => {
        addToLog("DocumentReference posted to EHR");
      }).catch((error) => {
        console.error("Error posting DocumentReference to EHR", error);
        addToLog("Error posting DocumentReference to EHR", "error", error);
      });
      setGfePacket(data);
      setCurrentTab(TAB_GFE);
    }).catch((error) => {
      console.error("Error retrieving GFE Packet", error);
      alert("Error retrieving GFE Packet: " + error?.message);
      setCurrentTab(TAB_TASK);
      setGfePacket(undefined);
    });

  }


  // invokes the $gfe-submit operation
  const submitGFE = async (tab) => {

    if (!gfePacket) {
      alert("No GFE Packet to submit");
      return;
    }

    setGfeSubmitted(true);
    setGfeRequestSuccess(false);

    submitGFEClaim(payerServer, gfePacket).then((response) => {
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
    <Dialog open={open} onClose={() => { handleClose() }} maxWidth="xl" fullWidth={true}
      PaperProps={{
        sx: {
          minHeight: "85vh",
        }
      }}
    >
      <DialogTitle>Coordination Task Details</DialogTitle>
      <DialogContent>
        {!task ? 
          <p variant="body1">No task selected</p> :

          <>

            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} variant="fullWidth"
              sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
              <Tab label="Task" value={TAB_TASK} />
              <Tab label="Task JSON" value={TAB_TASK_JSON} />
              <Tab label="GFE Information Bundle JSON" value={TAB_INFO_BUNDLE_JSON} />
              <Tab label="GFE Packet" value={TAB_GFE} disabled={!gfePacket} />
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
                      <TableCell><Tooltip title="GFE Bundle attached"><AttachFile fontSize="small" /></Tooltip></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(contributorTasks||[]).map((contributorTask) => (
                      <TableRow key={contributorTask.id}>
                        <TableCell>{contributorTask.id}</TableCell>
                        <TableCell>{contributorTask.owner?.reference}</TableCell>
                        <TableCell>{contributorTask.status}</TableCell>
                        <TableCell>{(contributorTask.output || []).some(out => out.type?.coding?.some(coding => coding.code === "gfe-bundle")) ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>


              <Accordion sx={{ my: 2}}>
                <AccordionSummary expandIcon={<ArrowDropDown />}>GFE Information Bundle Details</AccordionSummary>
                <AccordionDetails>
                  {
                    !infoBundle ? <>No valid GFE information bundle attached to the coordination task.</>
                    :
                    <GFEInformationBundleView bundle={infoBundle} />
                  }
                </AccordionDetails>
              </Accordion>

            </TabPanel>

            {/* Task JSON tab */}
            <TabPanel value={currentTab} index={TAB_TASK_JSON}>
              <Editor
                height="65vh"
                defaultLanguage="json" 
                defaultValue={JSON.stringify(task, null, 2)}
                options={{readOnly: true}}
              />
            </TabPanel>

            {/* GFE Information Bundle JSON tab */}
            <TabPanel value={currentTab} index={TAB_INFO_BUNDLE_JSON}>
              {
                !infoBundle ? <>No valid GFE information bundle attached to the coordination task.</>
                :
                <Editor
                  height="65vh"
                  defaultLanguage="json" 
                  defaultValue={JSON.stringify(infoBundle, null, 2)}
                  options={{readOnly: true}}
                />
              }
            </TabPanel>


            {/* GFE Bundle tab from $gfe-retrieve */}
            <TabPanel value={currentTab} index={TAB_GFE}>
              <Editor
                height="65vh"
                defaultLanguage="json" 
                defaultValue={JSON.stringify(gfePacket, null, 2)}
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

        <Grid size={8}>
          {
            (currentTab === TAB_TASK || currentTab === TAB_TASK_JSON || currentTab === TAB_INFO_BUNDLE_JSON) && (
              <Button onClick={() => { retrieveGFE() }} color="primary" variant="contained" startIcon={<LibraryBooks />}>Retrieve GFE Packet</Button>
            )
          }

          {
            currentTab === TAB_GFE && (
              <Button onClick={() => { submitGFE() }} color="primary" variant="contained" startIcon={<LibraryBooks />}>Submit GFE to Payer</Button>
            )
          }

          {
            (currentTab === TAB_TASK || currentTab === TAB_TASK_JSON || currentTab === TAB_INFO_BUNDLE_JSON) && task?.status === "in-progress" && (
              <Button onClick={() => { updateTask("completed") }} color="success" variant="contained" startIcon={<Check />} sx={{marginLeft: 2}}>Mark Completed</Button>
            )
          }
          {
              (currentTab === TAB_TASK || currentTab === TAB_TASK_JSON || currentTab === TAB_INFO_BUNDLE_JSON) && ( task?.status === "ready" || task?.status === "draft" || task?.status === "in-progress" ) && (
                  <Button onClick={() => { updateTask("cancelled") }} color="success" variant="contained" startIcon={<Check />} sx={{marginLeft: 2}}>Mark Cancelled</Button>
              )
          }
          {
              (currentTab === TAB_TASK || currentTab === TAB_TASK_JSON || currentTab === TAB_INFO_BUNDLE_JSON) && ( task?.status === "ready" || task?.status === "draft"  || task?.status === "in-progress" ) && (
                  <Button onClick={() => { updateTask("entered-in-error") }} color="success" variant="contained" startIcon={<Check />} sx={{marginLeft: 2}}>Mark Entered In Error</Button>
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