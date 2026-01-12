import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ArrowDropDown, AttachFile, Block, Check, LibraryBooks, Task } from '@mui/icons-material';
import { getPlannedServicePeriod, getRequestInitiationTime } from '../../util/taskUtils';
import FHIR from 'fhirclient';
import { AppContext } from '../../Context';
import { displayInstant, displayPeriod, getHumanDisplayName } from '../../util/displayUtils';
import RequestPanel from '../GFERequestPanel';
import { generateNewSession } from '../../util/gfeUtil';
import { TabPanel } from '../TabPanel';
import { Editor } from '@monaco-editor/react';
import { FHIRClient, getAccessToken, upsertResource, searchResourceByParams } from '../../api';
import GFEInformationBundleView from '../shared/GFEInformationBundleView';
import DialogContentText from '@mui/material/DialogContentText';




export default function ContributorTaskDialog({ open, onClose, task, setTask }) {

  const { coordinationServer, dataServer } = useContext(AppContext);
  const [updated, setUpdated] = useState(false);
  const [currentTab, setCurrentTab] = useState("summaryTab");
  const [showGfeBuilder, setShowGfeBuilder] = useState(false);
  const [submissionBundle, setSubmissionBundle] = useState(undefined);
  const [coordinationTaskRef, setCoordinationTaskRef] = useState(undefined);
  const [coordinationTask, setCoordinationTask] = useState(undefined);
  const [infoBundle, setInfoBundle] = useState(undefined);
  const [showAttachConfirm, setShowAttachConfirm] = useState(false);

  // GFE builder related
  const [gfeSession, setGfeSession] = useState(generateNewSession());


  const loadCoordinationTask = useCallback(() => {

    if (coordinationTaskRef) {
      FHIRClient(coordinationServer, getAccessToken("cp")).request(coordinationTaskRef).then((coordinationTask) => {
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

  }, [coordinationServer, coordinationTaskRef]);


  useEffect(() => {

    // dialog is opening, load coordination task that this contributor task is associated with
    if (open) {
      setCurrentTab("summaryTab");
      setShowGfeBuilder(false);
      const taskRef = (task.partOf || []).find((reference) => reference.reference.includes("Task/"))?.reference;
      setCoordinationTaskRef(taskRef);
    }
    else {
      setTask(undefined);
      setCoordinationTaskRef(undefined);
      setCoordinationTask(undefined);
      setInfoBundle(undefined);
      setSubmissionBundle(undefined);
    }
  }, [open, setTask, task]);

  useEffect(() => {
    if (coordinationTaskRef) {
      loadCoordinationTask();
    }
  }, [coordinationTaskRef, loadCoordinationTask]);


  const updateTask = async (status, source) => {
    task.status = status;
    if (status === "rejected"){
      // set default statusReason
      task.statusReason= {
        coding: [
          {
            system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTTaskStatusReasonCSTemporaryTrialUse",
            code: "service-not-provided",
            display: "Service Not Provided"
          },
        ],
      };
    }
    if (status === "rejected" || status === "completed") {
      task.businessStatus= {
        coding: [
          {
            system: "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTTaskBusinessStatusCSTemporaryTrialUse",
            code: "closed",
            display: "Closed"
          },
        ],
      };
    }
    const updatedTask = await FHIR.client(coordinationServer).update(task);
    setTask(updatedTask);
    setUpdated(true);

    if (status === "rejected" || status === "completed" || source === "attachGfeBundle") {
      onClose(updated);
    }

  }


  const updateSessionInfo = (update) => {
    setGfeSession({ ...gfeSession, ...update });
  };

  /**
   * Upsert resources from a FHIR Bundle (infoBundle) into the EHR system.
   */
    async function upsertInfoBundleResources(infoBundle) {
      if (!infoBundle || !Array.isArray(infoBundle.entry)) return;
      const resourceTypes = ["Patient", "Coverage", "Practitioner", "Organization"];
      // Group resources by type
      const resourceMap = (infoBundle.entry || [])
        .map((entry) => entry.resource)
        .reduce((resourceMap, res) => {
          if (resourceTypes.includes(res?.resourceType)) {
            if (!resourceMap[res.resourceType]) resourceMap[res.resourceType] = [];
            resourceMap[res.resourceType].push(res);
          }
          return resourceMap;
        }, {});
      const patients = resourceMap.Patient || [];
      const coverages = resourceMap.Coverage || [];
      const practitioners = resourceMap.Practitioner || [];
      const organizations = resourceMap.Organization || [];

      // Upsert Patients and their Coverages
      for (const patient of patients) {
        try {
          console.log("Processing Patient :", patient.id);
          // Find Coverage for this patient
          const patientCoverage = coverages.find((coverage) => {
            const beneficiaryRef = coverage.beneficiary?.reference;
            return beneficiaryRef === `Patient/${patient.id}` || beneficiaryRef === patient.id;
          });
          //console.log("Found Coverages for Patient:", patient.id, patientCoverage);

          const name = getHumanDisplayName(patient);
          const birthDate = patient.birthDate;
          const gender = patient.gender;
          if (!name) {
            console.error('Invalid, Patient name is missing, cannot upsert patient/coverage:', patient);
            continue;
          }
          const params = [];
          params.push(["name", name]);
          if (birthDate !== undefined) params.push(["birthdate", birthDate]);
          if (gender !== undefined) params.push(["gender", gender]);

          // Search for existing Patient
          const existingPatient = await searchResourceByParams(dataServer, "Patient", params);
          if (existingPatient) {
            patient.id = existingPatient.id;
            console.log(`Patient found in system. Patient:`, existingPatient.id);
          }
          const patientResult = await upsertResource(dataServer, patient);
          if (!patientResult || !patientResult.resource) {
            console.error('Upsert patient did not return a response:', patientResult);
            continue;
          }
          if (!patientCoverage) {
            console.warn(`No Coverage found for Patient/${patient.id}, skipping Coverage upsert.`);
            continue;
          }
          // If adding patient, add coverage
          if (patientResult.created) {
            console.log("Patient is created, Creating New Coverage for Patient:", patientResult.resource.id, "Coverage:", patientCoverage.id);
            await upsertResource(dataServer, patientCoverage);
          } else {
            console.log("Patient is updated, Checking existing Coverage for Patient to update:", patient.id);
            const covParams = [];
            if (patientCoverage.beneficiary?.reference) covParams.push(["beneficiary", patientCoverage.beneficiary.reference]);
            const subscriberRef = patientCoverage.subscriber?.reference;
            // Use subscriberRef if present, otherwise assume subscriber is patient
            if (subscriberRef) {
              covParams.push(["subscriber", subscriberRef]);
            } else {
              covParams.push(["subscriber", `Patient/${patient.id}`]);
            }
            if (Array.isArray(patientCoverage.payor) && patientCoverage.payor[0]?.reference) covParams.push(["payor", patientCoverage.payor[0].reference]);
            //if (patientCoverage.relationship?.coding && patientCoverage.relationship.coding[0]?.code) covParams.push(["relationship", patientCoverage.relationship.coding[0].code]);

            const existingCoverage = await searchResourceByParams(dataServer, "Coverage", covParams);
            if (existingCoverage) {
              patientCoverage.id = existingCoverage.id;
              console.log(`Coverage found in system. Coverage:`, existingCoverage.id);
              await upsertResource(dataServer, patientCoverage);
            } else {
              console.log("Patient is updated but no existing Coverage found, creating new Coverage for Patient:", patientResult.resource.id, "Coverage:", patientCoverage.id);
              const upsertResultCoverage = await upsertResource(dataServer, patientCoverage);
              if (!upsertResultCoverage || !upsertResultCoverage.resource) {
                console.error('Upsert did not return a coverage resource:', upsertResultCoverage);
                continue;
              }
            }
          }
        } catch (error) {
          console.error('Failed to upsert resource:', error);
        }
      }

      // Upsert Practitioners
      for (const practitioner of practitioners) {
        const name = getHumanDisplayName(practitioner);
        let npi = undefined;
        if (Array.isArray(practitioner.identifier)) {
          const npiObj = practitioner.identifier.find(id => id.system && id.system.includes("npi"));
          npi = npiObj && npiObj.value ? npiObj.value : undefined;
        }
        const params = [];
        if (name !== undefined) params.push(["name", name]);
        if (npi !== undefined) params.push(["identifier", npi]);
        const existingPractitioner = await searchResourceByParams(dataServer, "Practitioner", params);
        if (existingPractitioner) {
          practitioner.id = existingPractitioner.id;
          console.log(`Practitioner found in system. Practitioner:`, existingPractitioner.id);
        }
        await upsertResource(dataServer, practitioner);
      }

      // Upsert Organizations
      for (const organization of organizations) {
        const name = organization.name;
        const params = [];
        if (name !== undefined) params.push(["name", name]);
        const existingOrganization = await searchResourceByParams(dataServer, "Organization", params);
        if (existingOrganization) {
          organization.id = existingOrganization.id;
          console.log(`Organization found in system. Organization:`, existingOrganization.id);
        }
        await upsertResource(dataServer, organization);
      }
    }

  const handleCreateBundle = () => {
    // Upsert missing/new resources from information bundle into EHR system
    upsertInfoBundleResources(infoBundle).then(() => {
      console.log("All missing resources upserted successfully.");
    }).catch((error) => {
      console.error("Error upserting missing resources:", error);
    });

    // Autofill Patient and Submitter(Task.owner) during GFE Bundle Creation from task details
    let providerId, providerType;
    const ownerReference = task?.owner?.reference;
    console.log("Owner Reference:", ownerReference);
    if (ownerReference) {
      // Match resource type and id at the end of the string, supporting both relative and absolute references
      const match = ownerReference.match(/(?:^|\/)(Organization|Practitioner)\/([^\/]+)$/);
      if (match) {
        providerType = match[1];
        providerId = match[2];
      }
      console.log("Provider Type:", providerType, "Provider ID:", providerId);
    }
    let gfeType = gfeSession.subjectInfo?.gfeType;
    if (providerType === "Practitioner") {
      gfeType = "professional";
    }
    const patient = infoBundle?.entry?.find((entry) => entry.resource?.resourceType === "Patient")?.resource;
    const patientId = patient?.id;
    if (patientId) {
      setGfeSession((prevSession) => ({
        ...prevSession,
        patientList: [{ resource: patient }],
        subjectInfo: {
          ...prevSession.subjectInfo,
          selectedPatient: patient.id,
          selectedSubmitter: providerId,
          gfeType: gfeType,
        }
      }));
    }
    setShowGfeBuilder(true);
  }

  const attachGfeBundle = async (bundle, markCompleted = false) => {
    let gfeBundle = bundle;
    // if bundle is a collection bundle, pull GFE bundle from collection bundle
    const nestedBundle = bundle.entry?.find(
        (entry) => entry.resource?.resourceType === "Bundle"
    );
    if(nestedBundle && nestedBundle.resource){
      gfeBundle = nestedBundle.resource;
    }
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
          data: btoa(JSON.stringify(gfeBundle))
        }
      }
    ];

    task.output = output;
    if (markCompleted) {
        task.status = "completed";
    }
    updateTask(task.status, "attachGfeBundle");

  }


  return (
      <>
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
            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} variant="fullWidth"
              sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
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
            task?.status === "received" ?
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
                  <Button color="warning" variant="contained" startIcon={<Block/>} sx={{ mx: 2 }}
                          onClick={() => { updateTask("rejected") }}>
                    Reject Task
                  </Button>
                  <Button color="success" variant="contained" startIcon={<Check />}
                  onClick={() => { updateTask("completed") }}
                  >
                  Mark Completed
                  </Button>
                </>

              :
                <>
                  <Button color="primary" variant="contained" startIcon={<AttachFile />} disabled={!submissionBundle}
                    onClick={() => { setShowAttachConfirm(true); }}
                  >
                    Attach GFE Bundle
                  </Button>

                  <Button color="secondary" variant="contained" startIcon={<Task />} sx={{ mx: 2 }}
                    onClick={() => setShowGfeBuilder(false)}>
                    View Task Details
                  </Button>
                </>
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

      {/* Attach GFE Bundle Confirmation Dialog */}
      <Dialog open={showAttachConfirm} onClose={() => setShowAttachConfirm(false)}>
        <DialogTitle>Attach GFE Bundle</DialogTitle>
        <DialogContent sx={{ minWidth: 360 }}>
          <DialogContentText>
            Mark task completed ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="success"
            variant="contained"
            onClick={() => {attachGfeBundle(submissionBundle, true);setShowAttachConfirm(false);}}
          >
            Yes
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {attachGfeBundle(submissionBundle, false);setShowAttachConfirm(false);}}
          >
            No
          </Button>
          <Button
            onClick={() => setShowAttachConfirm(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

};
