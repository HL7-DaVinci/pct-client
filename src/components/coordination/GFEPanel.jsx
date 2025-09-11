import React, {useContext, useEffect, useState} from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Grid from '@mui/material/Grid2';
import {AppContext} from "../../Context";
import {Person} from "@mui/icons-material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import AEOBBundle from "../response/AEOBBundle";
import {Editor} from "@monaco-editor/react";
import {searchDocumentReference} from "../../api";
import { Button } from '@mui/material';

const columns = [
  { field: 'dateOfRequest', headerName: 'Date of request', flex: 1 },
  { field: 'patient', headerName: 'Patient', flex: 1 },
  { field: 'encounterPeriod', headerName: 'Encounter period', flex: 1 },
  { field: 'serviceRequested', headerName: 'Service/Device requested', flex: 1 },
  { field: 'condition', headerName: 'Condition', flex: 1 },
  {
    field: 'fhirResource',
    headerName: 'FHIR Resource',
    flex: 1,
    renderCell: (params) => (
        <a
            href="#"
            style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              params.row.onFhirResourceClick();
            }}
        >
          View JSON
        </a>
    )
  }
];

const formatDate = dateStr => dateStr ? dateStr.split('T')[0] : '';

const fetchGFEPacket = async (row) => {
  const docRef = row?.fhirJson ? row.fhirJson : row;
  const attachment = docRef?.content?.[0]?.attachment;
  const base64Binary = attachment?.data;
  if (!base64Binary) {
    return { error: 'Attachment data not found in DocumentReference content.' };
  }
  try {
    const decoded = atob(base64Binary);
    return JSON.parse(decoded);
    //console.log("Decoded GFE packet:", decoded);
  } catch (e) {
    console.error('Error decoding or parsing GFE packet from DocumentReference:', e);
    return { error: 'Failed to decode or parse GFE packet.' };
  }
};

export default function GFEPanel({ selectedButton }) {
  const [rows, setRows] = useState(undefined);
  const [requestDate, setRequestDate] = useState('');
  const [encounterDate, setEncounterDate] = useState('');
  const { dataServer, requester } = useContext(AppContext);
  const [selectedRow, setSelectedRow] = useState(null);
  const [GFEPacket, setGFEPacket] = useState(null);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonDialogData, setJsonDialogData] = useState(null);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  useEffect(() => {
    // Search when requester changes AND user is in 'My GFEs' panel
    if (selectedButton === 'gfes' && requester) {
      handleClearFields();
      handleSearch(true);
    }
  }, [requester]);

  const handleFhirResourceClick = async (row) => {
    const packet = await fetchGFEPacket(row);
    setJsonDialogData(packet);
    setJsonDialogOpen(true);
  };

  const handleSearch = async (isDefaultSearch = false) => {
    // For search, require at least one date
    if (!isDefaultSearch && !requestDate && !encounterDate) {
      alert('Please enter Request/Encounter Date to search.');
      return;
    }
    let params = {};
    params = { type: 'gfe-packet' };
    if (requestDate) params['estimate-initiation-time'] = requestDate;
    if (encounterDate) {
      // Dates within the period, including the start and end, should match.
      params['planned-period'] = [`le${encounterDate}`, `ge${encounterDate}`];
    }
    try {
      const response = await searchDocumentReference(dataServer, params);
      if (response.status === 401) {
        alert('Your token is expired or invalid. Please update your auth token in Settings.');
        return;
      }
      const data = await response.json();
      // Map DocumentReference resources to table rows
      const newRows = (data.entry || [])
          .map((entry, idx) => {
            const doc = entry.resource;
            let encounterPeriod = '';
            const gfeExt = doc.extension?.find(
                ext => ext.url === 'http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeServiceLinkingInfo'
            );
            const plannedPeriodExt = gfeExt?.extension?.find(
                ext => ext.url === 'plannedPeriodOfService'
            );
            // Check for valuePeriod or valueDate
            if (plannedPeriodExt?.valuePeriod) {
              const period = plannedPeriodExt.valuePeriod;
              encounterPeriod = `${formatDate(period.start) || ''} - ${formatDate(period.end) || ''}`;
            } else if (plannedPeriodExt?.valueDate) {
              encounterPeriod = formatDate(plannedPeriodExt.valueDate);
            }
            return {
              id: doc.id || idx,
              dateOfRequest: (() => {
                const ext = doc.extension?.find(
                    ext => ext.url === 'http://hl7.org/fhir/us/davinci-pct/StructureDefinition/requestInitiationTime'
                );
                const instant = ext?.valueInstant || '';
                return instant ? instant.split('T')[0] : '';
              })(),
              patient: doc?.subject?.reference || '',
              encounterPeriod,
              serviceRequested: (() => {
                const exts = doc.extension?.filter(
                    ext => ext.url === 'http://hl7.org/fhir/us/davinci-pct/StructureDefinition/estimateProcedureOrService'
                ) || [];
                const displays = exts.flatMap(ext =>
                    ext.valueCodeableConcept?.coding?.map(c => c.display).filter(Boolean) || []
                );
                return displays.join(', ');
              })(),
              condition: (() => {
                const ext = doc.extension?.find(
                    ext => ext.url === 'http://hl7.org/fhir/us/davinci-pct/StructureDefinition/estimateCondition'
                );
                return ext?.valueCodeableConcept?.coding?.[0]?.display || '';
              })(),
              fhirJson: doc,
              onFhirResourceClick: () => handleFhirResourceClick({ fhirJson: doc })
            };
          })
      setRows(newRows);
    } catch (error) {
      alert('An error occurred while searching: ' + (error.message || error));
    }
  };

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
    fetchGFEPacket(params.row).then(packet => setGFEPacket(packet));
  };

  const handleCloseDetailsDialog = () => {
    setSelectedRow(null);
    setGFEPacket(null);
  };

  const handleCloseJsonDialog = () => {
    setJsonDialogOpen(false);
    setJsonDialogData(null);
  };

  const handleClearFields = () => {
    setRequestDate('');
    setEncounterDate('');
    setRows([]);
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ color: '#333', fontWeight: 500, fontSize: '1.25rem', margin: 0 }}>
            My GFEs
          </h2>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ verticalAlign: 'middle', mr: 1 }} style={{ fontSize: '1.15em' }} />
            <span style={{ fontWeight: 400, fontSize: '1rem', marginRight: 6 }}>Author:</span>
            <span style={{ fontSize: '1rem' }}>{requester || "No requester selected"}</span>
          </span>
        </div>
      </Grid>
      <Grid size={12} sx={{ marginBottom: 2 }}>
        <div className="date-filters">
          <div className="filter-row">
            <label className="filter-label" htmlFor="gfe-request-date">Request Date:</label>
            <input
              id="gfe-request-date"
              type="date"
              className="date-input"
              value={requestDate}
              onChange={e => setRequestDate(e.target.value)}
            />
          </div>
          <div className="filter-row">
            <label className="filter-label" htmlFor="gfe-encounter-date">Encounter Date:</label>
            <input
              id="gfe-encounter-date"
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
            <button
                className="search-button"
                style={{ marginLeft: 8 }}
                onClick={e => { e.preventDefault(); handleClearFields(); }}
            >
              Clear
            </button>
          </div>
        </div>
      </Grid>
      <Grid size={12}>
        <DataGrid
          rows={rows}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50, 100]}
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
      <Dialog
          open={!!selectedRow}
          onClose={handleCloseDetailsDialog}
          maxWidth="lg"
          fullWidth
      >
        <DialogTitle>
          GFE Details
          <IconButton
              aria-label="close"
              onClick={handleCloseDetailsDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
              size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {GFEPacket && <AEOBBundle data={GFEPacket} showRawJsonButton={false} />}
          {GFEPacket?.error && <div>{GFEPacket.error}</div>}
        </DialogContent>
      </Dialog>
      <Dialog
          open={jsonDialogOpen}
          onClose={handleCloseJsonDialog}
          maxWidth="lg"
          fullWidth
      >
        <DialogTitle>
          GFE Packet JSON
          <IconButton
              aria-label="close"
              onClick={handleCloseJsonDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
              size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {jsonDialogData?.error && <div>{jsonDialogData.error}</div>}
          {jsonDialogData && !jsonDialogData.error && (
              Array.isArray(jsonDialogData) && jsonDialogData.length === 0 ? (
                  <div>GFE packet is empty.</div>
              ) : (
                  <Editor
                      height="75vh"
                      width="100%"
                      defaultLanguage="json"
                      value={JSON.stringify(jsonDialogData, null, 2)}
                      options={{ readOnly: true, fontSize: 16 }}
                  />
              )
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  );
}
