import * as React from "react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from "@mui/material";

import DataObjectIcon from "@mui/icons-material/DataObject";
import ErrorIcon from "@mui/icons-material/Error";
import HttpIcon from "@mui/icons-material/Http";
import InfoIcon from "@mui/icons-material/Info";
import ListIcon from "@mui/icons-material/List";
import RecommendIcon from "@mui/icons-material/Recommend";
import Draggable from "react-draggable";

export default function StatusLog(props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [activeLog, setActiveLog] = React.useState();
  const nodeRef = React.useRef(null);

  const toggleDrawer = () => {
    setIsOpen((o) => !o);
  };
  const closeDrawer = () => {
    setIsOpen(false);
  };

  const openLogDialog = (log) => {
    setActiveLog(log);
    setIsDialogOpen(true);
  };
  const closeLogDialog = () => {
    setIsDialogOpen(false);
  };

  const PaperComponent = (props) => {
    return (
      <Draggable
        nodeRef={nodeRef}
        handle="#draggable-dialog-title"
        cancel={'[class*="MuiDialogContent-root"]'}
      >
        <Paper {...props} ref={nodeRef} />
      </Draggable>
    );
  };

  return (
    <React.Fragment>
      <IconButton
        size="medium"
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ mr: 2 }}
        onClick={toggleDrawer}
      >
        <Badge
          badgeContent={(props.logs && props.logs.length) || 0}
          color="secondary"
        >
          <ListIcon titleAccess="Status Log" />
        </Badge>
      </IconButton>

      <Drawer anchor="right" open={isOpen} onClose={closeDrawer}>
        <Box sx={{ width: "auto" }} role="presentation">
          <List>
            {props.logs && props.logs.length > 0 ? (
              (props.logs || []).map((log, index) => {
                return (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {log.type === "error" ? (
                        <ErrorIcon />
                      ) : log.type === "network" ? (
                        <HttpIcon />
                      ) : (
                        <InfoIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={log.message}
                      secondary={
                        (log.time && log.time.toLocaleString()) || null
                      }
                    ></ListItemText>
                    {!!log.object ? (
                      <IconButton onClick={() => openLogDialog(log)}>
                        <DataObjectIcon titleAccess="View related JSON object" />
                      </IconButton>
                    ) : null}
                  </ListItem>
                );
              })
            ) : (
              <ListItem>
                <ListItemIcon>
                  <RecommendIcon />
                </ListItemIcon>
                <ListItemText primary="No status logs to show yet." />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
      <Dialog
        maxWidth="lg"
        open={isDialogOpen}
        onClose={closeLogDialog}
        PaperComponent={PaperComponent}
        scroll='paper'
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          Status Log
        </DialogTitle>
        <DialogContent dividers={true}>
          <Box
            noValidate
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              m: "auto",
              width: "fit-content",
              height: "fit-content",
            }}
          >
            {!!activeLog ? (
              <div>
                <pre>{JSON.stringify(activeLog.object, undefined, 2)}</pre>
              </div>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLogDialog}>Close</Button>
          {!!activeLog ? (
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  JSON.stringify(activeLog.object, undefined, 2)
                );
              }}
              titleaccess="Copy object to clipboard"
            >
              Copy
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
