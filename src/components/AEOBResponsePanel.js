import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  Link,
  Typography
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { pollAEOBStatus } from "../api";
import PropTypes from "prop-types";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AEOBBundle from "./response/AEOBBundle";

const useStyles = makeStyles({
  root: {
    backgroundColor: "#dadacc",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
  },
  response: {
    textAlign: "left",
    fontSize: 14,
  },
  content: {
    flexGrow: 1,
    overflow: "auto",
    maxWidth: 1200,
    maxHeight: 400,
    marginLeft: 50,
  },
  body: {
    marginTop: "12px",
  },
  blockHeader: {
    backgroundColor: "#d7d3d3",
    width: "100%",
  },
  header: {
    textAlign: "center",
    width: "100%",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  aeobResponse: {
    minWidth: "500px",
  },
  responseBody: {
    minHeight: "800px",
  },
  aeobInitialResponseText: {
    textAlign: "left",
    justifyContent: "space-between",
  },
  aeobInitialResponseButtonRawJSON: {
    alignContent: "right",
  },
  style: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  },
  aeobQueryButton: {
    marginTop: 20,
    alignItems: "right",
  },
  spaceTop: {
    marginTop: 40,
  },
  spaceBelow: {
    marginBottom: 20,
  },
  card: {
    minWidth: "70vw",
    textAlign: "left",
    marginLeft: 0,
    backgroundColor: "#D3D3D3",
  },
  info: {
    backgroundColor: "#EEEEEE",
  },
});

// const style = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 800,
//   bgcolor: "background.paper",
//   border: "2px solid #000",
//   boxShadow: 24,
//   p: 4,
// };

//GFE and AEOB tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

//GFE and AEOB tabs
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

//GFE and AEOB tabs
//sourced from: https://stackoverflow.com/questions/48031753/material-ui-tab-react-change-active-tab-onclick
function TabContainer(props) {
  return (
    <Typography {...props} component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

//GFE and AEOB tabs
//sourced from: https://stackoverflow.com/questions/48031753/material-ui-tab-react-change-active-tab-onclick
TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function AEOBResponsePanel(props) {
  // const [openGFEResponse, setOpenGFEResponse] = React.useState(false);
  // const handleOpenGFEResponse = () => setOpenGFEResponse(true);
  // const handleCloseGFEResponse = () => setOpenGFEResponse(false);
  const [timerSeconds, setTimerSeconds] = useState(undefined);
  let timerRef = useRef();

  const [openAEOB, setOpenAEOB] = useState(false);
  const handleOpenAEOB = () => setOpenAEOB(true);
  const handleCloseAEOB = () => setOpenAEOB(false);

  const classes = useStyles();


  function handleRequestTime() {
    return new Date().toLocaleString();
  }

  
  const stopTimer = useCallback(() => {
    setTimerSeconds(undefined);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [timerRef]);

  const startTimer = useCallback((seconds) => {
    stopTimer();
    setTimerSeconds(seconds);
    timerRef.current = setInterval(() => setTimerSeconds((t) => t-1), 1000);
  }, [stopTimer, setTimerSeconds, timerRef]);

  
  const handleAEOBPoll = useCallback(() => {

    stopTimer();
    
    props.addToLog(`Polling AEOB status at ${props.pollUrl}`);
    pollAEOBStatus(props.pollUrl)
      .then(async (response) => {

        // still waiting
        if (response.status === 202) {
          const retryAfter = response.headers.get("retry-after") || 30;
          props.addToLog(`Received 202 response. Retry after ${retryAfter} seconds.`, 'network');
          startTimer(retryAfter);
        }
        // AEOB response received
        else if (response.status === 200) {
          props.addToLog("Received 200 response.", "network");
          const aeobResponse = await response.json();
          props.setReceivedAEOBResponse(aeobResponse);
          props.addToLog("Consumed AEOB response.", "info", aeobResponse);
        }
        // unexpected response
        else {
          throw new Error(`Received unexpected response with status of ${response.status}`, 'error', response);
        }
      })
      .catch((error) => {
        props.addToLog(`Error while polling AEOB status: ${error}`, 'error', error);
      });
  }, [props, startTimer, stopTimer]);
  

  const timerIsVisible = useCallback(() => {
    return props.gfeRequestSuccess === true && !props.receivedAEOBResponse;
  }, [props.gfeRequestSuccess, props.receivedAEOBResponse]);
  

  // monitor timer to send another poll when timer reaches 0
  useEffect(() => {
    if (timerIsVisible() && timerSeconds < 1) {
      handleAEOBPoll();
    }
  }, [timerSeconds, timerIsVisible, handleAEOBPoll]);

  
  // if we don't have a bundle from the initial response then do the first AEOB poll
  useEffect(() => {
    setTimerSeconds(0);
  },[]);


  return (
    <div>
      {/* <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>AEOB - Initial Response from GFE Submission</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.aeobInitialResponseText}>
          <Grid container spacing={1}>
            <Grid container spacing={2}>
              <Grid item xs={10}>
                <Grid item md={4}>
                  <Typography variant="h5" gutterBottom>
                    Bundle:
                  </Typography>
                </Grid>
                <Grid item md={4}>
                  <Typography variant="body1" gutterBottom>
                    ID: {props.bundleId}
                  </Typography>
                </Grid>
                <Grid item md={4}>
                  <Typography variant="body1" gutterBottom>
                    Identifier: {props.bundleIdentifier}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container alignItems="flex-end">
                <Grid item xs={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="show-raw-gfe"
                    onClick={handleOpenGFEResponse}
                  >
                    Raw JSON
                  </Button>

                  <Modal
                    open={openGFEResponse}
                    onClose={handleCloseGFEResponse}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box sx={style}>
                      <Typography
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                      >
                        Raw JSON of Initial Response from GFE Submission:
                      </Typography>
                      <div>
                        <pre>
                          {JSON.stringify(props.gfeResponse, undefined, 2)}
                        </pre>
                      </div>
                    </Box>
                  </Modal>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion> */}

      {props.receivedAEOBResponse ? (
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>AEOB - Query at {handleRequestTime()}</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.aeobInitialResponseText}>
            <Grid style={{ marginTop: 33 }}>
              <Divider />
              <Divider light />
              <Divider />
              <Divider light />
              <Grid item xs={12} style={{ marginTop: 10 }}>
                <AEOBBundle
                  aeobResponse={props.receivedAEOBResponse}
                  handleOpenAEOB={handleOpenAEOB}
                  openAEOB={openAEOB}
                  handleCloseAEOB={handleCloseAEOB}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ) : null}

      
      {timerIsVisible() ? (
        <Card className={classes.card}>
          <CardContent>
            <Typography>
              Time until next poll: {timerSeconds}
            </Typography>
            <Typography>
              Poll AEOB Status URL:
              <Link href={props.pollUrl}>{props.pollUrl}</Link>
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              onClick={handleAEOBPoll}
            >
              Query AEOB Bundle
            </Button>
            <Button
              variant="outlined"
              onClick={stopTimer}
            >
              Cancel Timer
            </Button>
          </CardActions>
        </Card>
      ) : null}
    </div>
  );
}
