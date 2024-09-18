import * as React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import SettingsIcon from '@mui/icons-material/Settings';
import StatusLog from "./StatusLog";

const useStyles = makeStyles((theme) =>
  createStyles({
    button: {
      marginLeft: "auto",
      "&:hover": {
        display: "block",
      },
    },
    hideSettings: {
      display: "none",
    },
    select: {
      color: "white",
      paddingRight: 10,
      paddingLeft: 10,
      "&:before": {
        borderColor: "white",
      },
      "&:after": {
        borderColor: "white",
      },
    },
    icon: { fill: "white" },
  })
);

export default function MenuBar(props) {
  const classes = useStyles();
  return (
    <Box sx={{ flexGrow: 1 }}>
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
              PCT GFE Submission
            </Typography>
            <div
              style={{
                
                display: "flex",
                flexDirection: "row",
              }}
            >

              <StatusLog logs={props.statusLogs} setLogs={props.setStatusLogs} />

              <Select
                value={props.selectedSession}
                variant="standard"
                className={classes.select}
                sx={{ mr: 2 }}
                inputProps={{
                  className: classes.select,
                  classes: { icon: classes.icon },
                }}
              >
                {props.sessions.map((sesh, i) => (
                  <MenuItem
                    value={sesh}
                    key={i}
                    onClick={() => {
                      props.setGfeRequestSuccess(false);
                      props.setSelectedSession(sesh);
                      props.setMainPanelTab("1");
                    }}
                  >{`GFE Bundle ${i + 1}`}</MenuItem>
                ))}
                <MenuItem onClick={props.addNewSession}>
                  Create New GFE Bundle
                </MenuItem>
              </Select>
              <div className={classes.button}>
                <IconButton
                  size="medium"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  sx={{ mr: 2 }}
                  onClick={(e) => props.toggleSettings(!props.showSettings)}
                >
                  <SettingsIcon titleAccess="Server Settings" />
                </IconButton>
              </div>
            </div>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
