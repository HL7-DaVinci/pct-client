import React, { useCallback, useEffect, useState } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { getPatientDisplayName } from '../SelectComponents';
import { displayAddress, displayPeriod } from '../../util/displayUtils';


export default function GFEInformationBundleView({ bundle }) {


  const [patients, setPatients] = useState([]);
  const [coverage, setCoverage] = useState(undefined);
  const [organizations, setOrganizations] = useState(undefined);
  const [locations, setLocations] = useState(undefined);
  const [practitioners, setPractitioners] = useState(undefined);
  const [practitionerRoles, setPractitionerRoles] = useState(undefined);
  const [serviceRequests, setServiceRequests] = useState(undefined);
  const [medicationRequests, setMedicationRequests] = useState(undefined);
  const [deviceRequests, setDeviceRequests] = useState(undefined);
  const [nutritionOrders, setNutritionOrders] = useState(undefined);
  const [visionPrescriptions, setVisionPrescriptions] = useState(undefined);


  
  const getEntriesByResourceType = useCallback((resourceType) => {
    return (bundle.entry || []).filter((entry) => entry.resource.resourceType === resourceType);
  }, [bundle]);


  // Extract entries from the bundle by resource type
  useEffect(() => {

    if (!bundle) {
      return;
    }

    setPatients(getEntriesByResourceType("Patient"));
    setCoverage(getEntriesByResourceType("Coverage")[0]);
    setOrganizations(getEntriesByResourceType("Organization"));
    setLocations(getEntriesByResourceType("Location"));
    setPractitioners(getEntriesByResourceType("Practitioner"));
    setPractitionerRoles(getEntriesByResourceType("PractitionerRole"));
    setServiceRequests(getEntriesByResourceType("ServiceRequest"));
    setMedicationRequests(getEntriesByResourceType("MedicationRequest"));
    setDeviceRequests(getEntriesByResourceType("DeviceRequest"));
    setNutritionOrders(getEntriesByResourceType("NutritionOrder"));
    setVisionPrescriptions(getEntriesByResourceType("VisionPrescription"));

  }, [bundle, getEntriesByResourceType]);

  
  if (!bundle) {
    return <p>No bundle data available.</p>;
  }
  return (
    <Grid container spacing={2}>

      {/**
       * Patient and Coverage resources are required in the information bundle by the PCT GFE Information Bundle profile, the rest are optional.
       */}
    

      {/* Patient */}
      <Grid size={12}>
        <h4>Patient Demographics</h4>
        {
          !patients || patients.length < 1 ? <p>No patients in the bundle.</p>
          :
          <TableContainer component={Paper}>
            <Table size="small">
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
                        <TableCell>{displayAddress(patient.resource.address[0])}</TableCell>
                      </TableRow>
                    );
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
        }
      </Grid>


      {/* Coverage */}
      <Grid size={12}>
        <h4>Coverage Information</h4>
        {
          !coverage || !coverage.resource ? <p>No coverage information in the bundle.</p>
          :
          <TableContainer component={Paper}>
            <Table size="small">
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
          </TableContainer>
        }
      </Grid>

      {
        /* Organization */

        (organizations || []).length > 0 && 

        <Grid size={12}>
          <h4>Organizations</h4>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Identifier(s)</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    (organizations || []).map((organization, index) => {
                      if (!organization.resource) {
                        return <></>;
                      }
                      return (
                        <TableRow>
                          <TableCell>{organization.resource.id}</TableCell>
                          <TableCell>
                            {
                              (organization.resource.identifier || []).map((identifier) => {
                                return `${identifier.value} (${(identifier.type?.coding||[])[0]?.code || "unknown"})`;
                              }).join(", ")
                            }
                          </TableCell>
                          <TableCell>{organization.resource.name}</TableCell>
                          <TableCell>{(organization.resource.telecom||[])[0]?.value}</TableCell>
                          <TableCell>{displayAddress((organization.resource.address||[])[0])}</TableCell>
                        </TableRow>
                      );
                    })
                  }
                </TableBody>
              </Table>
            </TableContainer>
        </Grid>
      }

      {
        /* Location */
        (locations || []).length > 0 &&
        
        <Grid size={12}>
          <h4>Locations</h4>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  (locations || []).map((location, index) => {

                    if (!location.resource) {
                      return <></>;
                    }
                    return (
                      <TableRow>
                        <TableCell>{location.resource.id}</TableCell>
                        <TableCell>{location.resource.name}</TableCell>
                        <TableCell>{((location.resource.type||[])[0]?.coding||[]).map(c => c.code).join(", ")}</TableCell>
                        <TableCell>{(location.resource.telecom||[])[0]?.value}</TableCell>
                        <TableCell>{displayAddress((location.resource.address||[])[0])}</TableCell>
                      </TableRow>
                    );
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      }


      {
        /* ServiceRequest */

        (serviceRequests || []).length > 0 &&

        <Grid size={12}>
          <h4>Service Requests</h4>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Intent</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Requester</TableCell>
                  <TableCell>Occurrence</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  (serviceRequests || []).map((serviceRequest, index) => {
                    if (!serviceRequest.resource) {
                      return <></>;
                    }
                    return (
                      <TableRow>
                        <TableCell>{serviceRequest.resource.id}</TableCell>
                        <TableCell>{serviceRequest.resource.status}</TableCell>
                        <TableCell>{serviceRequest.resource.intent}</TableCell>
                        <TableCell>{serviceRequest.resource.subject?.reference}</TableCell>
                        <TableCell>{serviceRequest.resource.requester?.reference}</TableCell>
                        <TableCell>
                          {
                            serviceRequest.resource.occurrencePeriod ? 
                            displayPeriod(serviceRequest.resource.occurrencePeriod)
                            : serviceRequest.resource.occurrenceDateTime?.toLocaleString()
                          }
                        </TableCell>
                        <TableCell>{((serviceRequest.resource.code?.coding||[]).map(c => `${c.code} (${c.system || 'unknown'})`).join(", "))}</TableCell>
                        <TableCell>{serviceRequest.resource.quantityQuantity?.value}</TableCell>
                      </TableRow>
                    );
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      }


      {

        /* DeviceRequest */

        (deviceRequests || []).length > 0 &&

        <Grid size={12}>
          <h4>Device Requests</h4>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Intent</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Requester</TableCell>
                  <TableCell>Occurrence</TableCell>
                  <TableCell>Code</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  (deviceRequests || []).map((deviceRequest, index) => {
                    if (!deviceRequest.resource) {
                      return <></>;
                    }
                    return (
                      <TableRow>
                        <TableCell>{deviceRequest.resource.id}</TableCell>
                        <TableCell>{deviceRequest.resource.status}</TableCell>
                        <TableCell>{deviceRequest.resource.intent}</TableCell>
                        <TableCell>{deviceRequest.resource.subject?.reference}</TableCell>
                        <TableCell>{deviceRequest.resource.requester?.reference}</TableCell>
                        <TableCell>
                          {
                            deviceRequest.resource.occurrencePeriod ? 
                            displayPeriod(deviceRequest.resource.occurrencePeriod)
                            : deviceRequest.resource.occurrenceDateTime?.toLocaleString()
                          }
                        </TableCell>
                        <TableCell>
                          {
                            deviceRequest.resource.codeReference ?
                            deviceRequest.resource.codeReference.reference
                            :
                            (deviceRequest.resource.codeCodeableConcept?.coding||[]).map(c => `${c.code} (${c.system || 'unknown'})`).join(", ")
                          }
                        </TableCell>
                      </TableRow>
                    );
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      }


    </Grid>
  );
};
