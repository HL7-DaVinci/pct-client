import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import jp from "jsonpath";
import PatientInfo from "./PatientInfo";
import SubmitterInfo from "./SubmitterInfo";
import AEOBEntry from "./AEOBEntry";
import { Editor } from "@monaco-editor/react";

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

export default function AEOBBundle(props) {
  const classes = useStyles();
  const showRawJsonButton = props.showRawJsonButton !== undefined ? props.showRawJsonButton : true;

  function getNameDisplay(resource) {
    var returnString = "";

    try
    {
      if (resource.constructor.name === "Object" && resource !== null) {
        if (resource.resourceType === "Organization")
          returnString = resource.name;
        else if (
          resource.resourceType === "Patient" ||
          resource.resourceType === "Practitioner" ||
          resource.resourceType === "relatedPerson"
        ) {
          returnString = getHumanNameDisplay(resource.name[0]);
        } else {
          returnString =
            "Name for resource of type " &
            resource.resourceType &
            " is not supported.";
        }
      }
    }
    catch(error)
    {}

    return returnString;
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

  function getCoverageResource() {
    return jp.query(
      props,
      "$..[?(@.fullUrl ==".concat(
        "'",
        jp.query(
          props,
          '$..[?(@.resourceType == "ExplanationOfBenefit")].insurance[0].coverage.reference'
        )[0] + "')].resource"
      )
    )[0];
  }

  function getAEOBList() {
    const list = jp.query(
      props,
      '$..[?(@.resourceType == "ExplanationOfBenefit")]'
    );
    return list;
  }

  return (
    <React.Fragment>
      <Grid container direction="column">
        {showRawJsonButton && (
        <Grid item>
            <Button
            variant="contained"
            color="primary"
            type="show-raw-gfe"
            onClick={props.handleOpenAEOB}
            >
            Raw JSON
            </Button>
            <Dialog
            maxWidth="lg"
            open={props.openAEOB}
            onClose={props.handleCloseAEOB}
            fullWidth={true}
            >
            <DialogTitle>Raw JSON of AEOB Response:</DialogTitle>
            <DialogContent>
              <Editor
                height="75vh"
                defaultLanguage="json"
                defaultValue={JSON.stringify(props.aeobResponse, undefined, 2)}
                options={{readOnly: true}}
              />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleCloseAEOB}>Close</Button>
            </DialogActions>
            </Dialog>
        </Grid>
            )}
        <Grid item>
            <Typography variant="body1" gutterBottom>
                ID:{" "}
                {jp.query(props, '$..[?(@.resourceType == "Bundle")].id')[0]}
            </Typography>
        </Grid>
        <Grid item>
            <Typography variant="body1" gutterBottom>
                Identifier:{" "}
                {
                jp.query(
                    props,
                    '$..[?(@.resourceType == "Bundle")].identifier.value'
                )[0]
                }
            </Typography>
        </Grid>        

        <PatientInfo props={props} classes={classes} />
        <SubmitterInfo
          props={props}
          classes={classes}
          getNameDisplay={getNameDisplay}
        />

        <Grid style={{ marginTop: 10 }}>
          <Divider />
          <Divider light />
          <Divider />
          <Divider light />

          <Grid item style={{ marginTop: 33 }}>
            <Grid container spacing={0}>
              <Grid item xs={5}>
                <Typography variant="h5" gutterBottom>
                  <b>
                    <u>Advanced Explanation of Benefits</u>
                  </b>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {getAEOBList().map((item) => {
            return (
              <AEOBEntry
                key={item.id}
                aeob={item}
                classes={classes}
                coverage={getCoverageResource()}
              />
            );
          })}
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
