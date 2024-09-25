import React, { useState, useEffect, useContext, useCallback } from 'react';
import { DataGrid, GridActionsCellItem, useGridApiRef } from '@mui/x-data-grid';
import { getCoordinationTasks } from '../../api';
import { AppContext } from '../../Context';
import { Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Add, Edit, Person } from '@mui/icons-material';
import CoordinationTaskDetailsDialog from './CoordinationTaskDetailsDialog';
import CoordinationTaskNewDialog from './CoordinationTaskNewDialog';
import { getPlannedServicePeriod, getRequestInitiationTime } from '../../util/taskUtils';
import { displayInstant, displayPeriod } from '../../util/displayUtils';



export default function RequesterPanel({addToLog}) {
  const apiRef = useGridApiRef();
  const { coordinationServer, requester } = useContext(AppContext);
  const [rows] = useState([]);
  const [taskDetailsDialogOpen, setTaskDetailsDialogOpen] = useState(false);
  const [taskNewDialogOpen, setTaskNewDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(undefined);
  const [refreshTasks, setRefreshTasks] = useState(false);


  // fetch coordination tasks
  useEffect(() => {

    if (!requester || !apiRef) {
      return;
    }

    getCoordinationTasks(coordinationServer, requester).then((response) => {
      const newRows = (response.entry || []).map((entry, index) => entry.resource);
      apiRef.current.setRows(newRows);
    }).catch((err) => {
      apiRef.current.setRows([]);
    }).finally(() => {
      apiRef.current.autosizeColumns({ includeHeaders: true, includeOutliers: true });
      setRefreshTasks(false);
    });
  }, [coordinationServer, requester, apiRef, refreshTasks]);


  useEffect(() => {
    if (apiRef?.current && apiRef.current.autosizeColumns) {
      apiRef.current.autosizeColumns({ includeHeaders: true, includeOutliers: true }); 
    }
  });


  const openTaskDetailsDialog = (task) => {
    setCurrentTask(task);
    setTaskDetailsDialogOpen(true);
  }

  const handleTaskDetailsDialogClose = (updated) => {
    setTaskDetailsDialogOpen(false);
    setCurrentTask(undefined);
    setRefreshTasks(updated);
  }

  const openTaskNewDialog = () => {
    setTaskNewDialogOpen(true);
  }

  const handleTaskNewDialogClose = (updated) => {
    setTaskNewDialogOpen(false);
    setCurrentTask(undefined);
    setRefreshTasks(updated);
  }

  const handleTaskNewDialogSave = (task) => {
    setRefreshTasks(true);
  }


  const columns = [
    { 
      field: 'actions',
      type: 'actions',
      getActions: (params) => {
        return [
          <GridActionsCellItem
            icon={<Edit />}
            label="Edit"
            onClick={() => openTaskDetailsDialog(params.row)}
          />
        ];
      }  
    },
    { field: 'id', headerName: 'ID' },
    { field: 'status', headerName: 'Status' },
    { 
      field: 'reason',
      headerName: 'Reason',
      valueGetter: (value, row) => row.reasonCode?.coding?.find(c => c.system === "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFERequestTaskCSTemporaryTrialUse")?.code 
    },
    {
      field: 'initiation',
      headerName: 'Request Initiation',
      valueGetter: (value, row) => displayInstant(getRequestInitiationTime(row), false)
    },
    {
      field: 'servicePeriod',
      headerName: 'Service Period',
      valueGetter: (value, row) => displayPeriod(getPlannedServicePeriod(row), false)
    },
    {
      field: 'lastModified',
      headerName: 'Task Last Modified',
      valueGetter: (value, row) => displayInstant(row.meta?.lastUpdated)
    }
  ];

  return (
    <>

    {
      !requester ? 
      <p>No coordination requester selected.  Please select a valid requester in the account menu above.</p>

      :

      <>
        <Grid container marginBottom={2} spacing={2}>
          <Grid display="flex" alignItems="center" size={6}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openTaskNewDialog}
            >
              Add Coordination Task
            </Button>
          </Grid>

          <Grid display="flex" alignItems="center" justifyContent="end" size={6}>
            <Person sx={{ mx: 1 }}/> {requester || "No requester selected"}
          </Grid>
        
        </Grid>

        <DataGrid
          rows={rows} 
          columns={columns} 
          apiRef={apiRef} 
          pageSize={5}
          autoHeight={true}
        />

        <CoordinationTaskDetailsDialog
          open={taskDetailsDialogOpen} 
          onClose={handleTaskDetailsDialogClose}
          task={currentTask}
          setTask={setCurrentTask}
          addToLog={addToLog}
        />

        <CoordinationTaskNewDialog
          open={taskNewDialogOpen} 
          onClose={handleTaskNewDialogClose}
          onSave={handleTaskNewDialogSave}
          addToLog={addToLog}
        />
      </>
    }

    </>

  );
};
