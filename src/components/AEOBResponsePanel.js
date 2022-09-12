import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  makeStyles,
  FormControl,
  Grid,
  Button,
  Tabs,
  Tab,
  AppBar,
} from "@material-ui/core";
import { sendAEOInquiry } from "../api";
import PropTypes from "prop-types";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Modal from "@mui/material/Modal";
import Divider from "@mui/material/Divider";
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

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

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

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

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
  const [openAEOBContent, setOpenAEOBContent] = React.useState(false);
  const handleCloseAEOBContent = () => {
    setOpenAEOBContent(false);
  };

  const [openGFEResponse, setOpenGFEResponse] = React.useState(false);
  const handleOpenGFEResponse = () => setOpenGFEResponse(true);
  const handleCloseGFEResponse = () => setOpenGFEResponse(false);

  const [openAEOB, setOpenAEOB] = React.useState(false);
  const handleOpenAEOB = () => setOpenAEOB(true);
  const handleCloseAEOB = () => setOpenAEOB(false);

  const classes = useStyles();

  const [aeobInquirySubmitted, setAeobInquirySubmitted] = useState(false);
  const [aeobInquirySuccess, setAeobInquirySuccess] = useState(false);
  const [aeobInquiryPending, setAeobInquiryPending] = useState(false);
  const [aeobInquiryError, setAeobInquiryError] = useState(false);
  const [aeobError, setAeobError] = useState(undefined);
  const [aeobInquiryOutcome, setAeobInquiryOutcome] = useState(undefined);
  const [currentTabIndex, setCurrentTabIndex] = useState(1);

  useEffect(() => {
    if (
      props.dataServerChanged ||
      props.payerServerChanged ||
      props.receivedAEOBResponse === undefined
    ) {
      setAeobInquirySubmitted(false);
      setAeobInquirySuccess(false);
      setAeobInquiryPending(false);
      setAeobInquiryError(false);
      setAeobError(undefined);
    }
  }, [props.dataServerChanged, props.payerServerChanged]);

  function handleSendInquiry() {
    setAeobInquirySubmitted(true);
    setAeobInquiryPending(true);
    sendAEOInquiry(props.payorUrl, props.bundleIdentifier)
      .then((response) => {
        console.log("received response: ", response);
        props.setReceivedAEOBResponse(response);
        const foundAeob =
          response.entry && response.entry.length >= 0
            ? response.entry[0].resource.entry.find(
                (item) => item.resource.resourceType === "ExplanationOfBenefit"
              )
            : undefined;
        const outCome = foundAeob ? foundAeob.resource.outcome : "unknown";
        setAeobInquiryOutcome(outCome);
        setAeobInquirySuccess(true);
        setAeobInquiryPending(false);
        setAeobInquirySubmitted(false);
      })
      .catch((error) => {
        console.log("got error", error);
        setAeobInquiryPending(false);
        setAeobInquirySuccess(false);
        setAeobInquirySubmitted(false);
        setAeobInquiryError(true);
        setAeobError(error.toJSON());
      });
  }

  function handleNewRequest() {
    props.setShowResponse(false);
    props.setShowRequest(true);
  }

  function handleRequestTime() {
    return new Date().toLocaleString();
  }

  function getHumanNameDisplay(humanName) {
    var returnString = "";

    if (humanName.constructor.name === "Object" && humanName !== null) {
      if ("text" in humanName) returnString = humanName.text;
      else if ("family" in humanName) {
        returnString = humanName.family;
        if ("given" in humanName) returnString += ", " + humanName.given[0];
        if (humanName.given.length > 1)
          returnString += " " + humanName.given[1];
      }
    } else
      returnString =
        "Human Name for object of type " &
        typeof humanName &
        " is not supported.";
    return returnString;
  }

  const handleChange = (event) => {
    //this.setState({ currentTabIndex: value });
    setCurrentTabIndex(event.target.value);
  };
  function getBackToMain() {
    if (currentTabIndex !== 1) {
      window.location.reload(false);
      return false;
    }
  }

  return (
    <div>
      <AppBar position="static">
        <Tabs
          value={currentTabIndex}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Good Faith Estimate" {...a11yProps(0)} />
          <Tab label="Advanced Explanation of Benefits" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel
        value={currentTabIndex}
        index={0}
        className={classes.tabBackground}
      >
        {getBackToMain()}
      </TabPanel>

      <TabPanel
        value={currentTabIndex}
        index={1}
        className={classes.tabBackground}
      >
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>AEOB- Initial Response from GFE Submission</Typography>
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

                <Grid item alignItems="flex-end" xs={2}>
                  <Grid item>
                    <Button
                      loading
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
        </Accordion>

        {props.receivedAEOBResponse ? (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>AEOB- Query at {handleRequestTime()}</Typography>
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
                    handleCloseAEOBContent={handleCloseAEOBContent}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ) : null}
        {props.gfeRequestSuccess === true && props.gfeRequestPending ? (
          <Grid item className={classes.aeobQueryButton}>
            <FormControl>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                onClick={handleSendInquiry}
              >
                Query AEOB Bundle
              </Button>
            </FormControl>
          </Grid>
        ) : null}
      </TabPanel>
    </div>
  );
}
