import React from 'react';
import { createStyles, makeStyles } from "@mui/styles";
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ManageAccounts, Settings } from '@mui/icons-material';


const useStyles = makeStyles((theme) =>
  createStyles({
    buttons: {
      marginLeft: "auto",
      "&:hover": {
        display: "block",
      },
    }
  })
);

export default function CoordinationMenuBar(props) {
  const classes = useStyles();

  return (
    <AppBar position="static">
      <Toolbar>
        <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
          
          
          <Typography variant="h6" component="div">
            PCT Coordination Platform
          </Typography>
          <div className={classes.buttons}>
            <IconButton
              size="medium"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={(e) => props.toggleAccountSettings(!props.showAccountSettings)}>
              <ManageAccounts titleAccess="Account Settings" />
            </IconButton>
            <IconButton
              size="medium"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={(e) => props.toggleSettings(!props.showSettings)}
            >
              <Settings titleAccess="Server Settings" />
            </IconButton>
          </div>
        
        </div>
      </Toolbar>
    </AppBar>
  );
}
