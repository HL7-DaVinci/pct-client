import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../Context";
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { v4 } from "uuid";
import { getParticipants } from "../../util/taskUtils";
import coordinationTask from "../../resources/coordination-task.json";
import contributorTask from "../../resources/contributor-task.json";
import gfeInformationBundle from "../../resources/gfe-information-bundle.json";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';



export default function CoordinationTaskNewDialog({ open, onClose, onSave }) {
  
  const { coordinationServer, dataServer, requester } = useContext(AppContext);

  const defaultCoordinationTask = useMemo(() => ({
    ...coordinationTask, 
    requester: { reference: requester },
    input: [
      {
        "type": {
          "coding": [
            {
              "system": "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTTaskInputTypeCS",
              "code": "gfe-information-bundle"
            }
          ],
          "text": "GFE Information Bundle"
        },
        "valueAttachment": {
          "contentType": "application/fhir+json",
          "data": btoa(JSON.stringify(gfeInformationBundle))
        }
      }
    ]
  }),[requester]);

  const defaultContributorTask = useMemo(() => ({
    ...contributorTask,
    requester: { reference: requester }
  }),[requester]);

  const [newCoordinationTask, setNewCoordinationTask] = useState(defaultCoordinationTask);
  const [isValid, setIsValid] = useState(false);

  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [participants, setParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);


  useEffect(() => {
    setNewCoordinationTask({...defaultCoordinationTask});
    setSelectedParticipants([]);
  },[open, defaultCoordinationTask]);

  useEffect(() => {
    getParticipants(dataServer).then((options) => {
      setParticipants(options);
    });
  },[dataServer]);


  useEffect(() => {
    setIsValid(selectedParticipants.length > 0);
  },[selectedParticipants]);

  const handleClose = () => {
    onClose(false);
  }

  const handleSave = async () => {
    
    // build the task bundle

    const bundle = {
      resourceType: "Bundle",
      meta: {
        profile: ["http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-coordination-bundle"]
      },
      type: "transaction",
      entry: []
    };

    
    newCoordinationTask.id = `urn:uuid:${v4()}`;

    if (!newCoordinationTask.extension) {
      newCoordinationTask.extension = [];
    }

    newCoordinationTask.extension.push({
      url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/requestInitiationTime",
      valueInstant: new Date().toISOString()
    });

    newCoordinationTask.extension.push({
      url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/plannedServicePeriod",
      valuePeriod: {
        start: startDate?.toISOString(),
        end: endDate?.toISOString()
      }
    });

    // add coordination task first
    bundle.entry.push({
      resource: newCoordinationTask,
      request: {
        method: "POST",
        url: "Task"
      }
    });


    // create a contributor task for each selected participant and add to the bundle
    selectedParticipants.forEach((participant) => {

      const newContributorTask = {
        ...defaultContributorTask,
        partOf: [ { reference: newCoordinationTask.id } ],
        owner: { reference: participant },
      }

      if (!newContributorTask.extension) {
        newContributorTask.extension = [];
      }

      newContributorTask.extension.push({
        url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/requestInitiationTime",
        valueInstant: new Date().toISOString()
      });
  
      newContributorTask.extension.push({
        url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/plannedServicePeriod",
        valuePeriod: {
          start: startDate?.toISOString(),
          end: endDate?.toISOString()
        }
      });

      bundle.entry.push({
        resource: newContributorTask,
        request: {
          method: "POST",
          url: "Task"
        }
      });
      
    });
    
    await fetch(coordinationServer, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json"
      },
      body: JSON.stringify(bundle)
    });

    onClose(true);
  }

  return (

    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth={true}>
      <DialogTitle>New Coordination Task</DialogTitle>
      <DialogContent>

      { !newCoordinationTask ? <div>No task defined.</div> :

        <div>
          <Grid container spacing={2}>
            <Grid size={6}>
              <List>
                <ListItem>
                  <ListItemText primary="Status" secondary={newCoordinationTask.status} />
                </ListItem>
              </List>
            </Grid>
            <Grid size={6}>
              <List>
                <ListItem>
                  <ListItemText primary="Requester" secondary={newCoordinationTask.requester?.reference} />
                </ListItem>
              </List>
            </Grid>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid size={6}>
                <DateTimePicker label="Service Period Start" value={startDate} onChange={(newValue) => setStartDate(newValue)} />
              </Grid>

              <Grid size={6}>
                <DateTimePicker label="Service Period End" value={endDate} onChange={(newValue) => setEndDate(newValue)} />
              </Grid>
            </LocalizationProvider>

            <Grid size={12}>
              <Autocomplete
                multiple
                options={participants}
                getOptionLabel={(option) => option}
                value={selectedParticipants}
                onChange={(e, newValue) => setSelectedParticipants(newValue)}
                renderInput={(params) => <TextField {...params} label="Participants" />}
              />
            </Grid>
          </Grid>
        </div>

      }
      </DialogContent>
      <DialogActions>

      <Grid container spacing={2} sx={{flexGrow: 1}}>

        <Grid size={12} display="flex" justifyContent="end">
          <Button onClick={handleSave} variant="contained" disabled={!isValid}>Save</Button>
          <Button onClick={handleClose} sx={{ marginLeft: 2 }}>Cancel</Button>            
        </Grid>

      </Grid>
      </DialogActions>
    </Dialog>

  );

}