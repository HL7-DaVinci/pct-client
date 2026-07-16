import React, { useContext, useState } from 'react';
import { Autocomplete, TextField, InputAdornment, RadioGroup, FormControlLabel, Radio, Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AppContext } from '../../Context';
import ParticipantSearchDialog from "../shared/ParticipantSearchDialog";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import {getDisplayNameForParticipant} from "../../util/displayUtils";

export default function AccountSettings({ selectedButton }) {

  const { coordinationServer, coordinationServers, requester, setRequester, requesterDisplayName, setRequesterDisplayName, contributor, setContributor, contributorDisplayName, setContributorDisplayName, loginRole, setLoginRole, accountOptions, setAccountOptions,  } = useContext(AppContext);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState(null);
  const appContext = useContext(AppContext);
  const isServerInList = coordinationServers && coordinationServers.some(s => (s.value || s) === coordinationServer);
  // Trigger build
  const handleOpenSearchDialog = () => {
    setSearchTarget(loginRole);
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
    if (loginRole === 'requester') {
      setRequester(value);
      setRequesterDisplayName(label);
      localStorage.setItem("pct-selected-requester", value);
      localStorage.setItem("pct-selected-requester-display", label);
    } else if (loginRole === 'contributor') {
      setContributor(value);
      setContributorDisplayName(label);
      localStorage.setItem("pct-selected-contributor", value);
      localStorage.setItem("pct-selected-contributor-display", label);
    }
  };

  const handleRoleChange = (e, newValue) => {
    if (loginRole === 'requester') {
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
    } else {
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
  };

  const dropdownLabel = loginRole === 'requester' ? 'Select Requester' : 'Select Contributor';
  const currentLoginUser = loginRole === 'requester'
    ? accountOptions.find(opt => opt.value === requester) || null
    : accountOptions.find(opt => opt.value === contributor) || null;
  const currentValue = loginRole === 'requester' ? requester : contributor;
  //console.log("requester:", requester, "contributor:", contributor, "currentLoginUser:", currentLoginUser, "accountOptions:", accountOptions);
  return (
      <Box
          sx={{
            backgroundColor: '#ffffff',
            borderBottom: '2px solid #e2e8f0',
            borderTop: '2px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',  // subtle shadow to lift it
            px: 2,
            py: 1,
          }}
      >
    <div>
      <Grid container spacing={2} margin={2}>

        <Grid item xs={12}>
          <Box display="flex" alignItems="center">
            <Typography variant="body1" sx={{ mr: 2 }}>
              Login as
            </Typography>
            <RadioGroup
              row
              value={loginRole}
              onChange={(e) => setLoginRole(e.target.value)}
            >
              <FormControlLabel value="requester" control={<Radio />} label="Requester" />
              <FormControlLabel value="contributor" control={<Radio />} label="Contributor" />
            </RadioGroup>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            key={`${loginRole}-${currentValue}`}
            options={accountOptions}
            value={currentLoginUser}
            onChange={handleRoleChange}
            disabled={!isServerInList}
            getOptionLabel={option => option?.label ?? ''}
            isOptionEqualToValue={(option, value) => option?.value === value?.value}
            clearOnBlur={false}
            renderInput={(params) => (
              <TextField
                {...params}
                label={dropdownLabel}
                placeholder="Select an option"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      <InputAdornment position="end">
                        <IconButton aria-label="search user" onClick={handleOpenSearchDialog} size="large">
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                style={{ width: 475 }}
              />
            )}
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
      </Box>
  );

}