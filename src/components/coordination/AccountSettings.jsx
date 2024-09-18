import React, { useContext, useEffect, useState } from 'react';

import { Autocomplete, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AppContext } from '../../Context';
import { getParticipants } from '../../util/taskUtils';


export default function AccountSettings(props) {

  const { dataServer, requester, setRequester, contributor, setContributor, setAccountSettingsError } = useContext(AppContext);
  const [accountOptions, setAccountOptions] = useState([]);

  // fetch practitioners and organizations for requester options
  useEffect(() => {
    getParticipants(dataServer).then((options) => {
      setAccountOptions(options);
    });
  }, [dataServer]);


  useEffect(() => {
    setAccountSettingsError(!requester || !contributor);
  },[requester, contributor, setAccountSettingsError]);


  const handleRequesterChange = (e, newValue) => {
    if (newValue) {
      setRequester(newValue);
      localStorage.setItem("pct-selected-requester", newValue);
    } else {
      setRequester("");
      localStorage.removeItem("pct-selected-requester");
    }
  }

  const handleContributorChange = (e, newValue) => {
    if (newValue) {
      setContributor(newValue);
      localStorage.setItem("pct-selected-contributor", newValue);
    } else {
      setContributor("");
      localStorage.removeItem("pct-selected-contributor");
    }
  }


  return (
    <div>
      <Grid container spacing={2} margin={2}>

      <Grid size={6}>
        <Autocomplete 
          options={accountOptions}
          value={requester}
          onChange = {handleRequesterChange}
          renderInput={(params) => <TextField {...params} label="Requester" />}
        />
      </Grid>
        
      <Grid size={6}>
        <Autocomplete 
          options={accountOptions}
          value={contributor}
          onChange = {handleContributorChange}
          renderInput={(params) => <TextField {...params} label="Contributor" />}
        />
      </Grid>

      </Grid>
    </div>
  )

}