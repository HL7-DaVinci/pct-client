import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ArrowDropDown, AttachFile, Block, Check, LibraryBooks } from '@mui/icons-material';
import { getPlannedServicePeriod, getRequestInitiationTime } from '../../util/taskUtils';
import FHIR from 'fhirclient';
import { AppContext } from '../../Context';
import gfeBundle from '../../resources/gfe-bundle.json';
import { displayInstant, displayPeriod } from '../../util/dateUtils';
import RequestPanel from '../GFERequestPanel';
import { generateNewSession } from '../../util/gfeUtil';
import { TabPanel } from '../TabPanel';
import { Editor } from '@monaco-editor/react';
import { FHIRClient } from '../../api';
import GFEInformationBundleView from '../shared/GFEInformationBundleView';




export default function ContributorTaskDialog({ open, onClose, task, setTask }) {

  const { coordinationServer } = useContext(AppContext);
  const [updated, setUpdated] = useState(false);
  const [currentTab, setCurrentTab] = useState("summaryTab");
  const [showGfeBuilder, setShowGfeBuilder] = useState(false);
  const [submissionBundle, setSubmissionBundle] = useState(undefined);
  const [coordinationTaskRef, setCoordinationTaskRef] = useState(undefined);
  const [coordinationTask, setCoordinationTask] = useState(undefined);
  const [infoBundle, setInfoBundle] = useState(undefined);

  // GFE builder related
  const [gfeSession, setGfeSession] = useState(generateNewSession());


  const loadCoordinationTask = useCallback(() => {

    if (task && task.partOf) {
      setCoordinationTaskRef((task.partOf || []).find((reference) => reference.reference.includes("Task/"))?.reference);
      if (coordinationTaskRef) {
        FHIRClient(coordinationServer).request(coordinationTaskRef).then((coordinationTask) => {
          setCoordinationTask(coordinationTask);
          const infoBundleInput = (coordinationTask.input || []).find((input) => input.type?.coding[0].code === "gfe-information-bundle");
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
        }).catch((error) => {
          console.error("Error loading coordination task", error);
          setCoordinationTaskRef(undefined);
          setCoordinationTask(undefined);
          setInfoBundle(undefined);
        });
      }
    }

  }, [task, coordinationServer, coordinationTaskRef]);


  useEffect(() => {

    // dialog is opening, load coordination task that this contributor task is associated with
    if (open) {
      setCurrentTab("summaryTab");
      setShowGfeBuilder(false);
      loadCoordinationTask();
    }
    else {
      setTask(undefined);
      setCoordinationTaskRef(undefined);
      setCoordinationTask(undefined);
      setInfoBundle(undefined);
      setSubmissionBundle(undefined);
    }
  }, [open, loadCoordinationTask, setTask]);


  const updateTask = async (status) => {
    task.status = status;
    const updatedTask = await FHIR.client(coordinationServer).update(task);
    setTask(updatedTask);
    setUpdated(true);

    if (status === "rejected" || status === "completed") {
      onClose(updated);
    }

  }


  const updateSessionInfo = (update) => {
    setGfeSession({ ...gfeSession, ...update });
  };

  const handleCreateBundle = async () => {
    console.log("Creating GFE Bundle", gfeBundle);
    setShowGfeBuilder(true);
  }

  const attachGfeBundle = async (bundle) => {

    const output = [
      {
        type: {
          coding: [
            {
              system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTTaskOutputTypeCSTemporaryTrialUse",
              code: "gfe-bundle"
            }
          ],
          text: "GFE Bundle"
        },
        valueAttachment: {
          contentType: "application/fhir+json",
          data: btoa(JSON.stringify(bundle))
        }
      }
    ];

    task.output = output;
    updateTask(task.status);
    onClose(true);

  }


  return (
    <Dialog open={open} onClose={() => { onClose(updated) }} maxWidth="xl" fullWidth={true}
      PaperProps={{
        sx: {
          minHeight: "85vh",
        }
      }}
    >
      <DialogTitle>Contributor Task Details</DialogTitle>
      <DialogContent>
        {!task ? 
          <p variant="body1">No task selected</p> :
          
          !showGfeBuilder ?

          <>
            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} variant="fullWidth">
              <Tab label="Summary" value={"summaryTab"}></Tab>
              <Tab label="Contributor Task JSON" value={"taskJsonTab"}></Tab>
              <Tab label="Coordination Task JSON" value={"coordinationTaskTab"}></Tab>
              <Tab label="GFE Information Bundle JSON" value={"infoBundleTab"}></Tab>
            </Tabs>


            <TabPanel value={currentTab} index="summaryTab">
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
                      <ListItemText primary="Requester" secondary={task.requester?.reference} />
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

                <Grid size={12}>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ArrowDropDown />}>GFE Information Bundle Details</AccordionSummary>
                    <AccordionDetails>
                      {
                        !infoBundle ? <>No valid GFE information bundle attached to the coordination task.</>
                        :
                        <GFEInformationBundleView bundle={infoBundle} />
                      }
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </TabPanel>


            <TabPanel value={currentTab} index="taskJsonTab">
              <Editor 
                height="65vh"
                defaultLanguage="json"
                defaultValue={JSON.stringify(task, null, 2)}
                options={{ readOnly: true }}
              />
            </TabPanel>

            <TabPanel value={currentTab} index="coordinationTaskTab">
              {
                !coordinationTask ? <>Could not load coordination task {  
                  coordinationTaskRef ? `from reference: ${coordinationTaskRef}` : "because no reference was found in the task."
                }</>

                :

                <Editor
                  height="65vh"
                  defaultLanguage="json"
                  defaultValue={JSON.stringify(coordinationTask, null, 2)}
                  options={{ readOnly: true }}
                />
              }
            </TabPanel>

            <TabPanel value={currentTab} index="infoBundleTab">
              {
                !infoBundle ? <>No valid GFE information bundle attached to the coordination task.</>
                :

                <Editor
                  height="65vh"
                  defaultLanguage="json"
                  defaultValue={JSON.stringify(infoBundle, null, 2)}
                  options={{ readOnly: true }}
                />
              }
            </TabPanel>
          </>

          :

          <Grid container>
            <RequestPanel 
              embedded={true}
              session={gfeSession}
              updateSessionInfo={updateSessionInfo}
              submissionBundle={submissionBundle}
              setSubmissionBundle={setSubmissionBundle}
              disableGfeSubmit={true}
              addToLog={console.log}
            />
          </Grid>

        }
      </DialogContent>
      <DialogActions>
        <Grid container spacing={2} sx={{flexGrow: 1}}>

          <Grid size={6}>

            {              
              /**
               * Task is currently requested and needs to be accepted or rejected
               */
            task?.status === "requested" ? 
              <>
                <Button color="success" variant="contained" startIcon={<Check/>}
                  onClick={() => { updateTask("accepted") }}
                >
                  Accept Task
                </Button>
                <Button color="warning" variant="contained" startIcon={<Block/>} sx={{ mx: 2 }}
                  onClick={() => { updateTask("rejected") }}
                >
                  Reject Task
                </Button>
              </>
            
            /**
             * Task has been accepted and needs to be completed
             */
            : task?.status === "accepted" &&

            <>

              {!showGfeBuilder ? 
                <>
                  <Button color="primary" variant="contained" startIcon={<LibraryBooks/>} sx={{ marginRight: 2 }}
                    onClick={handleCreateBundle}
                  >
                    Create GFE Bundle
                  </Button>

                  <Button color="success" variant="contained" startIcon={<Check />}
                  onClick={() => { updateTask("completed") }}
                  >
                  Mark Completed
                  </Button>
                </>
                
              :

                <Button color="primary" variant="contained" startIcon={<AttachFile />} disabled={!submissionBundle}
                  onClick={() => { attachGfeBundle(submissionBundle) }} 
                >
                  Attach GFE Bundle
                </Button>
              }

            </>
            }
          </Grid>

          <Grid size={6} display="flex" justifyContent="end">
            <Button onClick={() => { onClose(updated) }} color="primary" variant="contained">Close</Button>
          </Grid>

        </Grid>
      </DialogActions>
    </Dialog>
  );

};
