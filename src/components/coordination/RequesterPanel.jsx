import React, { useState, useEffect, useContext } from 'react';
import { DataGrid, GridActionsCellItem, useGridApiRef } from '@mui/x-data-grid';
import { getCoordinationTasks } from '../../api';
import { AppContext } from '../../Context';
import { Button, Icon, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Add, Edit, Person } from '@mui/icons-material';
import CoordinationTaskDetailsDialog from './CoordinationTaskDetailsDialog';
import CoordinationTaskNewDialog from './CoordinationTaskNewDialog';



export default function RequesterPanel() {
  const apiRef = useGridApiRef();
  const { coordinationServer, requester } = useContext(AppContext);
  const [rows] = useState([]);
  const [taskDetailsDialogOpen, setTaskDetailsDialogOpen] = useState(false);
  const [taskNewDialogOpen, setTaskNewDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(undefined);
  const [refreshTasks, setRefreshTasks] = useState(false);


  // fetch coordination tasks
  useEffect(() => {

    getCoordinationTasks(coordinationServer, requester).then((response) => {
      console.log("getCoordinationTasks:", response);

      const newRows = (response.entry || []).map((entry, index) => entry.resource);
      apiRef.current.setRows(newRows);
    }).catch(() => {
      apiRef.current.setRows([]);
    }).finally(() => {
      apiRef.current.autosizeColumns({ includeHeaders: true, includeOutliers: true });
      setRefreshTasks(false);
    });
  }, [coordinationServer, requester, apiRef, refreshTasks]);


  useEffect(() => {
    if (apiRef?.current) {
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
      field: 'lastModified',
      headerName: 'Last Modified',
      valueGetter: (value, row) => row.meta?.lastUpdated
    }
  ];

  return (
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
      />

      <CoordinationTaskNewDialog
        open={taskNewDialogOpen} 
        onClose={handleTaskNewDialogClose}
        onSave={handleTaskNewDialogSave}
      />

    </>
  );
};
