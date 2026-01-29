import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../Context";
import { Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, TextField, MenuItem, Box, InputAdornment, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { v4 } from "uuid";
import { getParticipants } from "../../util/taskUtils";
import coordinationTask from "../../resources/coordination-task.json";
import contributorTask from "../../resources/contributor-task.json";
import buildGFEInformationBundle from "../BuildGFEInformationBundle";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getAccessToken, getPatients, getCoverageByPatient } from "../../api";
import RequestItem from "../RequestItem";
import ParticipantSearchDialog from "../shared/ParticipantSearchDialog";
import { getDisplayNameForParticipant } from '../../util/displayUtils';
import SearchIcon from "@mui/icons-material/Search";

export default function CoordinationTaskNewDialog({ open, onClose }) {
  
  const { coordinationServer, coordinationServers, dataServer, requester } = useContext(AppContext);


  /* The participants are being fetched from coordinationServer itself, so a relative reference is used
  const resolveReference = useCallback((reference) => {
     if (coordinationServer !== dataServer) {
       const parts = reference.split("/");
       const resourceType = parts[0];
       const id = parts[1];

       return `${dataServer.replace(/\/+$/, '')}/${resourceType}/${id}`;
     }

    return reference;
  }, [coordinationServer, dataServer]);*/

  function addOneItem(rows) {
    return [
      ...rows,
      {
        id: v4(),
        description: "",
        code: "",
        quantity: 1,
      },
    ];
  }

  function editItem(rows, id, field, value) {
    return rows.map(row =>
        row.id === id ? { ...row, [field]: value } : row
    );
  }

  function deleteOneItem(rows, id) {
    return rows.filter(row => row.id !== id);
  }

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
        }
        // valueAttachment will be set after Save
      }
    ]
  }),[requester]);

  const defaultContributorTask = useMemo(() => ({
    ...contributorTask,
    requester: { reference: requester }
  }),[requester]);

  const [newCoordinationTask, setNewCoordinationTask] = useState(defaultCoordinationTask);
  const [isValid, setIsValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState(undefined);

  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [participants, setParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [step, setStep] = useState(0);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedCoverage, setSelectedCoverage] = useState("");
  const [patientCoverages, setPatientCoverages] = useState([]);
  const [coverageWithPayorOrg, setCoverageWithPayorOrg] = useState([]);
  const [servicesRows, setServicesRows] = useState([]);
  const [deviceRows, setDeviceRows] = useState([]);
  const [medicationRows, setMedicationRows] = useState([]);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState(null);
  const appContext = useContext(AppContext);
  const isServerInList = coordinationServers && coordinationServers.some(s => (s.value || s) === coordinationServer);

  useEffect(() => {
    setStep(0);
    setErrorMsg(undefined);
    setNewCoordinationTask({...defaultCoordinationTask});
    if (isServerInList) {
      setSelectedParticipants(participants.filter(p => p.value === requester));
    } else {
      setSelectedParticipants(requester ? [{ value: requester, label: requester }] : []);
    }
    }, [open, defaultCoordinationTask, requester, isServerInList, participants]);

  useEffect(() => {
    // For servers in the list, prefetch participants due to fewer resources; otherwise, allow manual fetch only by ID or Name.
    if (isServerInList) {
      getParticipants(coordinationServer).then((options) => {
        setParticipants(options || []);
      });
    }
  }, [coordinationServer, isServerInList]);

  useEffect(() => {
    getPatients(dataServer).then(result => setPatients(result?.entry ?? []));
  }, [dataServer]);


  useEffect(() => {
    setIsValid(selectedParticipants.length > 0);
  },[selectedParticipants]);

  // Ensure a default service row is present when dialog opens
  useEffect(() => {
    if (open) {
      setServicesRows((prev) => (prev.length === 0 ? [{ id: v4(), description: "", code: "", quantity: 1 }] : prev));
      setDeviceRows((prev) => (prev.length === 0 ? [{ id: v4(), description: "", code: "", quantity: 1 }] : prev));
      setMedicationRows((prev) => (prev.length === 0 ? [{ id: v4(), description: "", code: "", quantity: 1 }] : prev));
    } else{
        setServicesRows([]);
        setDeviceRows([]);
        setMedicationRows([]);
    }
  }, [open]);

  useEffect(() => {
    if (step === 0) {
      setIsValid(selectedParticipants && selectedParticipants.length > 0);
    } else if (step === 1) {
      setIsValid(
          !!selectedPatient &&
          !!selectedCoverage &&
          (
              servicesRows.some(row => !!row.code || !!row.description) ||
              deviceRows.some(row => !!row.code || !!row.description) ||
              medicationRows.some(row => !!row.code || !!row.description)
          )
      );
    }
  }, [step, selectedParticipants, selectedPatient, selectedCoverage, servicesRows, deviceRows, medicationRows]);

  useEffect(() => {
    if (selectedPatient) {
      getCoverageByPatient(dataServer, selectedPatient).then(result => {
        let coverages = Array.isArray(result.data) ? result.data : (result.data?.entry ?? []);
        setPatientCoverages(coverages);
        // Build array of { coverage, payorOrganization }
        let combined = [];
        if (result && result.references) {
          const organizationReferences = Object.values(result.references).filter(ref => ref.resourceType === "Organization");
          combined = coverages.map(coverage => {
            const payorRefs = coverage.payor || [];
            const payorOrgs = payorRefs
              .map(payorRef => {
                if (payorRef && payorRef.reference) {
                  const payorId = payorRef.reference.split("/").pop();
                  return organizationReferences.find(org => org.id === payorId);
                }
                return undefined;
              })
              .filter(Boolean);
            return { coverage, payorOrganizations: payorOrgs };
          });
        }
        setCoverageWithPayorOrg(combined);
        setSelectedCoverage(""); // Reset coverage selection when patient changes
      });
    } else {
      setPatientCoverages([]);
      setCoverageWithPayorOrg([]);
      setSelectedCoverage("");
    }
  }, [selectedPatient, dataServer]);

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleClose = () => {
    setSelectedPatient("");
    setSelectedCoverage("");
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

    // Find selected patient and coverage objects
    const patientObj = patients.find(entry => entry.resource.id === selectedPatient)?.resource;
    let coverageObj = patientCoverages.find(cov => cov.id === selectedCoverage);
    if (selectedCoverage === "self-pay" && patientCoverages.length > 0) {
      coverageObj = patientCoverages.length > 0 ? patientCoverages[0] : undefined;
      coverageObj.payor = { reference: `Patient/${patientObj.id}` };
      if (!coverageObj.extension) coverageObj.extension = [];
      coverageObj.extension = [
        ...coverageObj.extension,
        {
          url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/selfPayDeclared",
          valueBoolean: true
        }
      ];
    }
    const payorOrgs = coverageWithPayorOrg.find(item => item.coverage.id === selectedCoverage)?.payorOrganizations ?? [];
    // Print payorOrgs
    console.log("Selected Payor Organizations:", payorOrgs);
    const gfeInformationBundle = buildGFEInformationBundle({
      patient: patientObj,
      coverage: coverageObj,
      payor: payorOrgs,
      providers: [],
      providerOrganizations: [],
      requestedServiceItems: servicesRows,
      deviceRequestItems: deviceRows,
      medicationRequestItems: medicationRows
    });
    //console.log("GFE Information Bundle:", gfeInformationBundle);
    // Set valueAttachment before saving
    if (newCoordinationTask.input && newCoordinationTask.input.length > 0) {
      newCoordinationTask.input[0].valueAttachment = {
        contentType: "application/fhir+json",
        data: btoa(JSON.stringify(gfeInformationBundle))
      };
    }

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
        owner: { reference: participant?.value },
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

    setErrorMsg(undefined);

    try {
      const cpToken = getAccessToken("cp");
      const headers = {
        "Content-Type": "application/fhir+json"
      };
      if (cpToken) {
        headers["Authorization"] = `Bearer ${cpToken}`;
      }

      // Try new $gfe-coordination-request operation endpoint first
      let response = await fetch(`${coordinationServer}/$gfe-coordination-request`, {
        method: "POST",
        headers,
        body: JSON.stringify(bundle)
      });

      // If endpoint does not exist or returns error, fallback to normal POST
      if (!response.ok && (response.status === 400 || response.status === 404 || response.status === 405)) {
        console.warn("$gfe-coordination-request endpoint not available (status:", response.status, "). Falling back to /Bundle endpoint.");
        response = await fetch(coordinationServer, {
          method: "POST",
          headers,
          body: JSON.stringify(bundle)
        });
      }

      response.json().then((data) => {
        if (response.ok) {
          onClose(true);
          return;
        }

        if (data.issue && data.issue.length > 0) {
          setErrorMsg(data.issue[0].diagnostics);
        }
        else {
          console.error("Error saving task:", data);
          setErrorMsg("An error occurred while saving the task. Check the console or server logs for more information.");
        }
      });

    }
    catch (error) {
      console.error("Error saving task:", error);
      setErrorMsg("An error occurred while saving the task. Check the console or server logs for more information.");
    }
    
  }

  const handleCloseSearchDialog = () => {
    setSearchDialogOpen(false);
    setSearchTarget(null);
  };

  const handleSelectResult = resource => {
    if (!resource || !resource.resourceType || !resource.id) return;
    const value = `${resource.resourceType}/${resource.id}`;
    const label = getDisplayNameForParticipant(resource);
    const result = { value, label };
    if (!selectedParticipants.some(p => p.value === value)) {
      setSelectedParticipants(prev => Array.isArray(prev) ? [...prev, result] : [result]);
    }
    handleCloseSearchDialog();
  }

  // Helper function for coverage label
  function getCoverageLabel(coverage) {
    let insurer = '';
    let label = '';
    if (coverage.payor && Array.isArray(coverage.payor) && coverage.payor.length > 0) {
      insurer = coverage.payor[0].display || coverage.payor[0].reference || '';
    }
    if (insurer) {
      label += `${insurer}`;
    }
    label += ` Coverage/${coverage.id}`;
    if (coverage.type && coverage.type.coding && coverage.type.coding.length > 0) {
      label = coverage.type.coding[0].display || coverage.type.coding[0].code || label;
    }
    if (coverage.subscriberId) {
      label += ` Plan# ${coverage.subscriberId}`;
    }
    return label;
  }

  return (

    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth={true} sx={{'& .MuiDialog-paper': { minWidth: 1200 }}}>
      <DialogTitle>New Coordination Task</DialogTitle>
      <DialogContent>
        <div>
        {errorMsg && <Alert severity="error" sx={{ mb: 1 }}>{errorMsg}</Alert>}
        <Box sx={{ height: 15 }} />
        </div>
      { !newCoordinationTask ? <div>No task defined.</div> : (
      <>
      {step === 0 && (
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
                getOptionLabel={(option) => option.label}
                value={selectedParticipants}
                onChange={(e, newValue) => setSelectedParticipants(newValue)}
                disabled={!isServerInList}
                isOptionEqualToValue={(option, value) => option?.value === value?.value}
                renderInput={(params) => <TextField {...params} label={<span>Contributors <span style={{color:'red'}}>*</span></span>} InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                      <>
                        <InputAdornment position="end">
                          <IconButton
                              aria-label="search contributors"
                              onClick={() => setSearchDialogOpen(true)}
                              size="large"
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                        {params.InputProps.endAdornment}
                      </>
                  ),
                }}/>}
              />
            </Grid>
          </Grid>
        </div>
      )}
        {step === 1 && (
            <div>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                      select
                      label={<span>Patient <span style={{color:'red'}}>*</span></span>}
                      fullWidth
                      value={selectedPatient}
                      onChange={e => setSelectedPatient(e.target.value)}
                  >
                    <MenuItem value="">Select Patient</MenuItem>
                    {patients.map((entry) => {
                      const patient = entry.resource;
                      const display = patient.name && patient.name.length > 0
                        ? `${patient.name[0].given?.join(' ')} ${patient.name[0].family}`
                        : patient.id;
                      return (
                        <MenuItem key={patient.id} value={patient.id}>
                          {display}
                        </MenuItem>
                      );
                    })}
                  </TextField>

                </Grid>
                <Grid size={6}>
                  <TextField
                      select
                      label={<span>Insurance <span style={{color:'red'}}>*</span></span>}
                      fullWidth
                      value={selectedCoverage}
                      onChange={e => setSelectedCoverage(e.target.value)}
                      disabled={patientCoverages.length === 0}
                  >
                    <MenuItem value="">Select Coverage</MenuItem>
                    {patientCoverages.map((coverage) => (
                      <MenuItem key={coverage.id} value={coverage.id}>
                        {getCoverageLabel(coverage)}
                      </MenuItem>
                    ))}
                    <MenuItem key="self-pay" value="self-pay">Self-Pay (Patient will pay out-of-pocket)</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <Box sx={{ height: 16 }} />
              {(!servicesRows.some(row => !!row.code || !!row.description) &&
                !deviceRows.some(row => !!row.code || !!row.description) &&
                !medicationRows.some(row => !!row.code || !!row.description)) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Please add at least one Service, Device, or Medication item.
                </Alert>
              )}
              <div style={{ margin: '8px 0 4px 0', fontWeight: 500 }}> Service:</div>
              <RequestItem
                  rows={servicesRows}
                  setRows={setServicesRows}
                  addOne={() => setServicesRows(prev => addOneItem(prev))}
                  edit={(id, field, value) => setServicesRows(prev => editItem(prev, id, field, value))}
                  deleteOne={id => setServicesRows(prev => deleteOneItem(prev, id))}
                  valueSetUrl="http://example.org/fhir/ValueSet/PCTClientServiceItems"
              />
              <Box sx={{ height: 2 }} />
              <div style={{ margin: '8px 0 4px 0', fontWeight: 500 }}> Device:</div>
              <RequestItem
                  rows={deviceRows}
                  setRows={setDeviceRows}
                  addOne={() => setDeviceRows(prev => addOneItem(prev))}
                  edit={(id, field, value) => setDeviceRows(prev => editItem(prev, id, field, value))}
                  deleteOne={id => setDeviceRows(prev => deleteOneItem(prev, id))}
                  valueSetUrl="http://example.org/fhir/ValueSet/PCTClientDeviceItems"
              />
              <Box sx={{ height: 2 }} />
              <div style={{ margin: '8px 0 4px 0', fontWeight: 500 }}> Medication:</div>
              <RequestItem
                  rows={medicationRows}
                  setRows={setMedicationRows}
                  addOne={() => setMedicationRows(prev => addOneItem(prev))}
                  edit={(id, field, value) => setMedicationRows(prev => editItem(prev, id, field, value))}
                  deleteOne={id => setMedicationRows(prev => deleteOneItem(prev, id))}
                  valueSetUrl="http://example.org/fhir/ValueSet/PCTClientMedicationItems"
              />
            </div>
        )}
      </>
      )}
      </DialogContent>
      <DialogActions>

      <Grid container spacing={2} sx={{flexGrow: 1}}>

        <Grid size={12} display="flex" justifyContent="end">
          {step === 0 ? (
              <>
                <Button onClick={handleNext} variant="contained" disabled={!isValid}>Next</Button>
                <Button onClick={handleClose} sx={{ marginLeft: 2 }}>Cancel</Button>
              </>) : (
              <>
                <Button onClick={handleBack} variant="contained" >Back</Button>
                <Button onClick={handleSave} variant="contained" sx={{ marginLeft: 2 }} disabled={!isValid}>Save</Button>
                <Button onClick={handleClose} sx={{ marginLeft: 2 }}>Cancel</Button>
              </>)}
        </Grid>

      </Grid>
      </DialogActions>
      <ParticipantSearchDialog
          open={searchDialogOpen}
          onClose={handleCloseSearchDialog}
          onSelect={handleSelectResult}
          coordinationServer={appContext.coordinationServer}
          getResultDisplay={getDisplayNameForParticipant}
          target={searchTarget}
      />
    </Dialog>

  );

}