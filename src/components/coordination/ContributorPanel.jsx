import React, { useContext, useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { Edit, Person } from '@mui/icons-material';
import Grid from '@mui/material/Grid2';
import { DataGrid, GridActionsCellItem, useGridApiRef } from '@mui/x-data-grid';
import { AppContext } from '../../Context';
import { getContributorTasks } from '../../api';
import ContributorTaskDialog from './ContributorTaskDialog';

export default function ContributorPanel() {

  const apiRef = useGridApiRef();
  const { coordinationServer, contributor } = useContext(AppContext);
  const [rows] = useState([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(undefined);
  const [refreshTasks, setRefreshTasks] = useState(false);


  // fetch contributor tasks
  useEffect(() => {
    getContributorTasks(coordinationServer, contributor).then((response) => {
      const newRows = (response.entry || []).map((entry, index) => entry.resource);
      apiRef.current.setRows(newRows);
    }).catch(() => {
      apiRef.current.setRows([]);
    }).finally(() => {
      apiRef.current.autosizeColumns({ includeHeaders: true, includeOutliers: true });
      setRefreshTasks(false);
    });
  }, [coordinationServer, contributor, apiRef, refreshTasks]);

  
  useEffect(() => {
    if (apiRef?.current) {
      apiRef.current.autosizeColumns({ includeHeaders: true, includeOutliers: true }); 
    }
  });


  const openTaskDialog = (task) => {
    setCurrentTask(task);
    setTaskDialogOpen(true);
  }

  const handleDialogClose = (updated) => {
    setTaskDialogOpen(false);
    setCurrentTask(undefined);
    setRefreshTasks(updated);
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
          onClick={() => openTaskDialog(params.row)}
        />
      ]}
    },
    { field: 'id', headerName: 'ID' },
    { field: 'status', headerName: 'Status' },
    { 
      field: 'reason',
      headerName: 'Reason',
      valueGetter: (value, row) => row.reasonCode?.coding?.find(c => c.system === "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFERequestTaskCSTemporaryTrialUse")?.code 
    },
    { field: 'requester', headerName: 'Requester', valueGetter: (value, row) => value.reference },
  ];

  return (
    <div>
      <Grid container marginBottom={2} spacing={2}>
        <Grid display="flex" justifyContent="end" size={12}>
          <Person sx={{ mx: 1 }}/> {contributor || "No contributor selected"}
        </Grid>
      </Grid>

      <DataGrid
        rows={rows} 
        columns={columns} 
        apiRef={apiRef} 
        rowSelection={false}
        autoHeight={true}
      />

      <ContributorTaskDialog 
        open={taskDialogOpen} 
        onClose={handleDialogClose}
        task={currentTask}
        setTask={setCurrentTask}
      />
    </div>
  );
};
