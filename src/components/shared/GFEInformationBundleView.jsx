import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { getPatientDisplayName } from '../SelectComponents';
import { displayPeriod } from '../../util/dateUtils';


export default function GFEInformationBundleView({ bundle }) {


  const [patients, setPatients] = useState([]);
  const [coverage, setCoverage] = useState(undefined);


  useEffect(() => {
    
    if (!bundle) {
      return;
    }

    const patients = (bundle.entry || []).filter((entry) => entry.resource.resourceType === "Patient");
    patients.push(patients[0]);
    setPatients(patients);

    const coverage = (bundle.entry || []).find((entry) => entry.resource.resourceType === "Coverage");
    setCoverage(coverage);
  }, [bundle]);

  
  if (!bundle) {
    return <p>No bundle data available.</p>;
  }
  return (
    <Grid container spacing={2}>
    
      <Grid size={12}>
        <h4>Patient Demographics</h4>
        {
          !patients || patients.length < 1 ? <p>No patients in the bundle.</p>
          :
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Birthdate</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                (patients || []).map((patient, index) => {
                  if (!patient.resource) {
                    return <></>;
                  }
                  return (
                    <TableRow>
                      <TableCell>{patient.resource.id}</TableCell>
                      <TableCell>{getPatientDisplayName(patient)}</TableCell>
                      <TableCell>{patient.resource.birthDate}</TableCell>
                      <TableCell>{patient.resource.gender}</TableCell>
                      <TableCell>{patient.resource.telecom[0]?.value}</TableCell>
                      <TableCell>{patient.resource.address[0]?.text}</TableCell>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        }
      </Grid>

      <Grid size={12}>
        <h4>Coverage Information</h4>
        {
          !coverage || !coverage.resource ? <p>No coverage information in the bundle.</p>
          :
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Beneficiary</TableCell>
                <TableCell>Subscriber ID</TableCell>
                <TableCell>Payor</TableCell>
                <TableCell>Relationship</TableCell>
                <TableCell>Period</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{coverage.resource.id}</TableCell>
                <TableCell>{coverage.resource.status}</TableCell>
                <TableCell>{coverage.resource.beneficiary?.reference}</TableCell>
                <TableCell>{coverage.resource.subscriberId}</TableCell>
                <TableCell>{(coverage.resource.payor||[])[0]?.reference}</TableCell>
                <TableCell>{(coverage.resource.relationship?.coding||[])[0]?.code}</TableCell>
                <TableCell>{ displayPeriod(coverage.resource.period, false)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        }
      </Grid>
    
    </Grid>
  );
};
