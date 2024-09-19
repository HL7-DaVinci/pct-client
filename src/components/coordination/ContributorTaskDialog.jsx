import React, { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AttachFile, Block, Check, LibraryBooks } from '@mui/icons-material';
import { getPlannedServicePeriod, getRequestInitiationTime } from '../../util/taskUtils';
import FHIR from 'fhirclient';
import { AppContext } from '../../Context';
import gfeBundle from '../../resources/gfe-bundle.json';
import { displayInstant, displayPeriod } from '../../util/dateUtils';
import RequestPanel from '../GFERequestPanel';
import { generateNewSession } from '../../util/gfeUtil';

export default function ContributorTaskDialog({ open, onClose, task, setTask }) {

  const { coordinationServer } = useContext(AppContext);
  const [updated, setUpdated] = useState(false);
  const [showGfeBuilder, setShowGfeBuilder] = useState(false);
  const [submissionBundle, setSubmissionBundle] = useState(undefined);

  // GFE builder related
  const [gfeSession, setGfeSession] = useState(generateNewSession());

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
    updateTask("completed");

  }


  return (
    <Dialog open={open} onClose={() => { onClose(updated) }} maxWidth="xl" fullWidth={true}>
      <DialogTitle>Task Details</DialogTitle>
      <DialogContent>
        {!task ? 
          <p variant="body1">No task selected</p> :
          
          !showGfeBuilder ?

          <div>
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
            </Grid>
          </div>

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
            : task?.status === "accepted" ?

              !showGfeBuilder ?

                <Button color="secondary" variant="contained" startIcon={<LibraryBooks/>} 
                  onClick={handleCreateBundle}
                >
                  Create GFE Bundle
                </Button> 

                :

                <Button color="primary" variant="contained" startIcon={<AttachFile />} disabled={!submissionBundle}
                  onClick={() => { attachGfeBundle(submissionBundle) }} 
                >
                  Attach GFE Bundle & Complete Task
                </Button>

            :
              <></>
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
