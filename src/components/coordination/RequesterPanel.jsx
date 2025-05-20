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
  const { coordinationServer, dataServer, requester } = useContext(AppContext);
  const [rows, setRows] = useState([]);
  const [taskDetailsDialogOpen, setTaskDetailsDialogOpen] = useState(false);
  const [taskNewDialogOpen, setTaskNewDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(undefined);
  const [total, setTotal] = useState(undefined);


  const fetchTasks = useCallback(async () => {

    if (!requester || !coordinationServer) {
      return;
    }

    try {
      const response = await getCoordinationTasks(coordinationServer, dataServer, requester);
      const newRows = (response.entry || []).map((entry) => entry.resource);

      setRows(newRows);
      setTotal(response.total);
      return response;
    }
    catch (error) {
      console.error("RequesterPanel: error refreshing tasks", error);
      setRows([]);
      setTotal(0);
      return null;
    }
  }, [requester, coordinationServer]);


  useEffect(() => {
    if (apiRef?.current && apiRef.current.autosizeColumns) {
      setTimeout(() => {
        apiRef.current.autosizeColumns({ includeHeaders: true, includeOutliers: true });
      }, 0);
    }
  }, [apiRef, rows, taskDetailsDialogOpen, taskNewDialogOpen]);

  // refresh tasks when requester or coordination server changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, requester, coordinationServer]);


  const openTaskDetailsDialog = (task) => {
    setCurrentTask(task);
    setTaskDetailsDialogOpen(true);
  }

  const handleTaskDetailsDialogClose = (updated) => {
    setTaskDetailsDialogOpen(false);
    setCurrentTask(undefined);
    if (updated) {
      fetchTasks();
    }
  }

  const openTaskNewDialog = () => {
    setTaskNewDialogOpen(true);
  }

  const handleTaskNewDialogClose = async (updated) => {
    setTaskNewDialogOpen(false);
    setCurrentTask(undefined);

    // successful save of a new task
    if (updated) {
      const expectedTotal = total + 1;
      let res = await fetchTasks();

      // handle case where task has been saved but is not showing in search results yet
      while (res.total && res.total !== expectedTotal) {
        console.log(`Result total expected to be ${expectedTotal} but was ${res.total}.  Trying again in 2 seconds`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchTasks();
      }
    }
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
          paginationModel={{ pageSize: 100, page: 0 }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
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
          addToLog={addToLog}
        />
      </>
    }

    </>

  );
};
