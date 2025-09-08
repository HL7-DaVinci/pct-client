import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Grid from '@mui/material/Grid2';


const columns = [
  { field: 'dateOfRequest', headerName: 'Date of request', flex: 1 },
  { field: 'patient', headerName: 'Patient', flex: 1 },
  { field: 'encounterPeriod', headerName: 'Encounter period', flex: 1 },
  { field: 'serviceRequested', headerName: 'Service/Device requested', flex: 1 },
  { field: 'condition', headerName: 'Condition', flex: 1 },
  { field: 'fhirResource', headerName: 'FHIR Resource', flex: 1 }
];

export default function AEOBPanel() {
  const [rows] = useState(undefined);
  const [requestDate, setRequestDate] = useState('');
  const [encounterDate, setEncounterDate] = useState('');

  const handleSearch = () => {
    console.log('Search clicked:', { requestDate, encounterDate });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <h2 style={{ marginBottom: '1rem', color: '#333', fontWeight: 500, fontSize: '1.25rem' }}>
          My AEOBs
        </h2>
      </Grid>
      <Grid size={12} sx={{ marginBottom: 2 }}>
        <div className="date-filters">
          <div className="filter-row">
            <label className="filter-label" htmlFor="request-date">Request Date:</label>
            <input
              id="request-date"
              type="date"
              className="date-input"
              value={requestDate}
              onChange={e => setRequestDate(e.target.value)}
            />
          </div>
          <div className="filter-row">
            <label className="filter-label" htmlFor="encounter-date">Encounter Date:</label>
            <input
              id="encounter-date"
              type="date"
              className="date-input"
              value={encounterDate}
              onChange={e => setEncounterDate(e.target.value)}
            />
            <button
              className="search-button"
              onClick={e => { e.preventDefault(); handleSearch(); }}
            >
              Search
            </button>
          </div>
        </div>
      </Grid>
      <Grid size={12}>
        <DataGrid
          rows={rows}
          columns={columns}
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
      </Grid>
    </Grid>
  );
}