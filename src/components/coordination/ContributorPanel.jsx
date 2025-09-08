import React, { useContext, useEffect, useState } from 'react';
import { Edit, Person, AttachFile } from '@mui/icons-material';
import Grid from '@mui/material/Grid2';
import { DataGrid, GridActionsCellItem, useGridApiRef } from '@mui/x-data-grid';
import { AppContext } from '../../Context';
import {FHIRClient, getContributorTasks} from '../../api';
import ContributorTaskDialog from './ContributorTaskDialog';
import { displayInstant, displayPeriod } from '../../util/displayUtils';
import { getPlannedServicePeriod, getRequestInitiationTime } from '../../util/taskUtils';
import { Box } from '@mui/material';
export default function ContributorPanel() {

  const apiRef = useGridApiRef();
  const { coordinationServer, dataServer, contributor } = useContext(AppContext);
  const [rows, setRows] = useState([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(undefined);
  const [refreshTasks, setRefreshTasks] = useState(false);


  // fetch contributor tasks
  useEffect(() => {

    if (!contributor || !apiRef) {
      return;
    }
    
    getContributorTasks(coordinationServer, dataServer, contributor).then((response) => {
      const newRows = (response.entry || []).map((entry, index) => entry.resource);
      setRows(newRows);
    }).catch(() => {
      setRows([]);
    }).finally(() => {
      setRefreshTasks(false);
    });
  }, [coordinationServer, dataServer, contributor, apiRef, refreshTasks]);

  
  useEffect(() => {
    if (apiRef?.current && apiRef.current.autosizeColumns) {
      setTimeout(() => {
        apiRef.current.autosizeColumns({ includeHeaders: true, includeOutliers: true });
      }, 0);
    }
  }, [apiRef, rows, taskDialogOpen]);


  const openTaskDialog = async (task) => {
    if(task.status === "requested") {
      // read task resource from server
      FHIRClient(coordinationServer).request(`Task/${task.id}`).then((response) => {
        if (response.resourceType !== "Task") {
          throw new Error("Expected a resource of type Task");
        }
        setCurrentTask(response);
        setRefreshTasks((prev) => !prev);
      }).catch((error) => {
        console.error("Error fetching task", error);
        alert("Error fetching task: " + error?.message);
      });
    }

    setCurrentTask(task);
    setTaskDialogOpen(true);
  }

  const handleDialogClose = (updated) => {
    setTaskDialogOpen(false);
    setCurrentTask(undefined);
    if (updated) {
      setRefreshTasks((prev) => !prev);
    }
  }

  // Helper function to check if GFE bundle is attached for contributor task
  function hasGfeBundle(row) {
    return Array.isArray(row.output) && row.output.some(
        out =>
            out.type?.coding?.some(
                c =>
                    c.system === "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTTaskOutputTypeCSTemporaryTrialUse" &&
                    c.code === "gfe-bundle"
            )
    );
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
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => {
        const status = params.value || '';
        const badgeClass = `status-badge status-${status.replace(/_/g, '-').toLowerCase()}`;
        return (
          <Box component="span" className={badgeClass}>
            {status}
          </Box>
        );
      }
    },
    {
      field: 'gfeBundle', headerName: <AttachFile fontSize="small" sx={{ verticalAlign: 'middle' }} />, description: 'GFE Bundle attached', valueGetter: (value, row) => hasGfeBundle(row) ? "Yes" : "No",
    },
    { 
      field: 'reason',
      headerName: 'Reason',
      valueGetter: (value, row) => row.reasonCode?.coding?.find(c => c.system === "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFERequestTaskCSTemporaryTrialUse")?.code 
    },
    { field: 'requester', headerName: 'Requester', valueGetter: (value, row) => value.reference },
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
      !contributor ? 
      <p variant="body1">No coordination contributor selected.  Please select a valid contributor in the account menu above.</p> 
      :

      <>
        <Grid container marginBottom={2} spacing={2}>
          <Grid display="flex" alignItems="center" justifyContent="space-between" size={12} sx={{ marginBottom: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 8, fontSize: '1.15rem', fontWeight: 370 }}>
                Currently displaying contributor tasks for:
              </span>
              <Person sx={{ mx: 1 }}/> {contributor || "No contributor selected"}
            </div>
          </Grid>
        </Grid>

        <DataGrid
          rows={rows} 
          columns={columns} 
          apiRef={apiRef} 
          rowSelection={false}
          autoHeight={true}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f7fa',
              color: '#556cd6',
              fontWeight: 700,
              fontSize: '1.08rem',
              borderBottom: '2px solid #e2e8f0',
              letterSpacing: '0.03em',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.97rem',
            },
          }}
        />

        <ContributorTaskDialog 
          open={taskDialogOpen} 
          onClose={handleDialogClose}
          task={currentTask}
          setTask={setCurrentTask}
        />
      </>
    }      

    </>
  );
};
