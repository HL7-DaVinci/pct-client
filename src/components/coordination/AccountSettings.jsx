import React, { useContext, useEffect, useState } from 'react';
import { Autocomplete, TextField, InputAdornment } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AppContext } from '../../Context';
import { getParticipants } from '../../util/taskUtils';
import ParticipantSearchDialog from "../shared/ParticipantSearchDialog";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import {getDisplayNameForParticipant} from "../../util/displayUtils";

export default function AccountSettings() {

  const { coordinationServer, coordinationServers, requester, setRequester, setRequesterDisplayName, contributor, setContributor, setContributorDisplayName, setAccountSettingsError } = useContext(AppContext);
  const [accountOptions, setAccountOptions] = useState([]);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState(null);
  const appContext = useContext(AppContext);
  const isServerInList = coordinationServers && coordinationServers.some(s => (s.value || s) === coordinationServer);

  // fetch practitioners and organizations for requester, contributor options from coordination server; prefetch for known servers due to fewer resources, else allow manual fetch by ID or Name.
  useEffect(() => {
    if(isServerInList){
    getParticipants(coordinationServer).then((options) => {
      setAccountOptions(options || []);
    });
    } else {
      setAccountOptions(requester ? [{ value: requester, label: requester }] : []);
    }
  }, [coordinationServer, isServerInList]);


  useEffect(() => {
    setAccountSettingsError(!requester || !contributor);
  },[requester, contributor, setAccountSettingsError]);

  const handleOpenSearchDialog = (target) => {
    setSearchTarget(target);
    setSearchDialogOpen(true);
  };

  const handleCloseSearchDialog = () => {
    setSearchDialogOpen(false);
    setSearchTarget(null);
  };

  const handleSelectResult = (resource) => {
    if (!resource || !resource.resourceType || !resource.id) return;
    const value = `${resource.resourceType}/${resource.id}`;
    const label = getDisplayNameForParticipant(resource);
    const result = { value, label };
    setAccountOptions(prevOptions => {
      if (!prevOptions.some(opt => opt.value === value)) {
        return [...prevOptions, result];
      }
      return prevOptions;
    });
    if (searchTarget === 'requester') {
      setRequester(value);
      setRequesterDisplayName(label);
      localStorage.setItem("pct-selected-requester", value);
      localStorage.setItem("pct-selected-requester-display", label);
    } else if (searchTarget === 'contributor') {
      setContributor(value);
      setContributorDisplayName(label);
      localStorage.setItem("pct-selected-contributor", value);
      localStorage.setItem("pct-selected-contributor-display", label);
    }
  }


  const handleRequesterChange = (e, newValue) => {
    if (newValue) {
      setRequester(newValue.value);
      setRequesterDisplayName(newValue.label);
      localStorage.setItem("pct-selected-requester", newValue.value);
      localStorage.setItem("pct-selected-requester-display", newValue.label);
    } else {
      setRequester("");
      setRequesterDisplayName("");
      localStorage.removeItem("pct-selected-requester");
      localStorage.removeItem("pct-selected-requester-display");
    }
  }

  const handleContributorChange = (e, newValue) => {
    if (newValue) {
      setContributor(newValue.value);
      setContributorDisplayName(newValue.label);
      localStorage.setItem("pct-selected-contributor", newValue.value);
      localStorage.setItem("pct-selected-contributor-display", newValue.label);
    } else {
      setContributor("");
      setContributorDisplayName("");
      localStorage.removeItem("pct-selected-contributor");
      localStorage.removeItem("pct-selected-contributor-display");
    }
  }


  return (
    <div>
      <Grid container spacing={2} margin={2}>

      <Grid size={6}>
        <Autocomplete 
          options={accountOptions}
          value={accountOptions.find(opt => opt.value === requester) || null}
          onChange={handleRequesterChange}
          disabled={!isServerInList}
          getOptionLabel={option => option?.label}
          isOptionEqualToValue={(option, value) => option?.value === value?.value}
          renderInput={(params) => <TextField {...params} label="Requester" InputProps={{
            ...params.InputProps,
            endAdornment: (
                <>
                  <InputAdornment position="end">
                    <IconButton aria-label="search user" onClick={() => handleOpenSearchDialog('requester')} size="large">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                  {params.InputProps.endAdornment}
                </>
            ),
          }}/>}
        />
      </Grid>
        
      <Grid size={6}>
        <Autocomplete 
          options={accountOptions}
          value={accountOptions.find(opt => opt.value === contributor) || null}
          onChange={handleContributorChange}
          disabled={!isServerInList}
          getOptionLabel={option => option.label}
          isOptionEqualToValue={(option, value) => option?.value === value?.value}
          renderInput={(params) => <TextField {...params} label="Contributor" InputProps={{
            ...params.InputProps,
            endAdornment: (
                <>
                  <InputAdornment position="end">
                    <IconButton aria-label="search user" onClick={() => handleOpenSearchDialog('contributor')} size="large">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                  {params.InputProps.endAdornment}
                </>
            ),
          }}/>}
        />
      </Grid>

      </Grid>
      <ParticipantSearchDialog
          open={searchDialogOpen}
          onClose={handleCloseSearchDialog}
          onSelect={handleSelectResult}
          coordinationServer={appContext.coordinationServer}
          getResultDisplay={getDisplayNameForParticipant}
          target={searchTarget}
      />
    </div>
  )

}