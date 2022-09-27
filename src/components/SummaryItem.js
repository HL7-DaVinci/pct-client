import React from "react";
import {
  Grid,
  Typography,
  CardContent,
  Card,
  makeStyles,
  createStyles,
  Box,
} from "@material-ui/core";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { SummaryTable } from "./SummaryTable";

const useStyles = makeStyles((theme) =>
  createStyles({
    card: {
      minWidth: "70vw",
      textAlign: "left",
      marginLeft: 0,
      color: theme.palette.text.secondary,
      backgroundColor: "#DCDCDC",
    },
    listItemProcedure: {
      marginLeft: 0,
    },
  })
);

function createProcedureList(procedureList) {
  return procedureList.map((el) => {
    return (
      <ListItem disableGutters>
        ({el.id}) {el.provider} ({el.type})
      </ListItem>
    );
  });
}

function alertDialog(itemsMissing) {
  if (itemsMissing.length === 0) {
    return;
  }

  return (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      Missing Required Fields — <strong>{itemsMissing.join(", ")}</strong>
    </Alert>
  );
}

export default function SummaryItem(props) {
  const classes = useStyles();
  const { summary } = props;
  let missingItems = [];
  //patient section
  if (!summary.patientId) {
    addToMissing("patient details");
  }
  if (!summary.billingProvider) {
    addToMissing("billing provider");
  }
  if (!summary.submittingProvider) {
    addToMissing("submitting provider");
  }
  if (!summary.gfeServiceId) {
    addToMissing("GFE assigned service identifier");
  }

  //care team
  for (let i = 0; i < summary.practitionerSelected.length; i++) {
    //if the provider is there, check if role is too
    if (
      summary.practitionerSelected[i].provider &&
      !summary.practitionerSelected[i].role
    ) {
      let rowNum = i + 1;
      addToMissing("care team provider role (row " + rowNum + ")");
    }
    //if role is there, check if provider
    if (
      summary.practitionerSelected[i].role &&
      !summary.practitionerSelected[i].provider
    ) {
      let rowNum = i + 1;
      addToMissing("care team provider (row " + rowNum + ")");
    }
    //otherwise if both undefined don't throw error bc allowed
  }

  //priority level on encounter tab
  if (!summary.priorityLevel) {
    addToMissing("priority level");
  }

  //diagnosis
  //check if given, and all required fields exist
  for (let i = 0; i < summary.diagnosisList.length; i++) {
    //if diagnosis there, but not type, throw error
    if (summary.diagnosisList[i].diagnosis && !summary.diagnosisList[i].type) {
      let rowNum = i + 1;
      addToMissing("encounter diagnosis type (row " + rowNum + ")");
    }
    //if type there, but not diagnosis, throw error
    if (summary.diagnosisList[i].type && !summary.diagnosisList[i].diagnosis) {
      let rowNum = i + 1;
      addToMissing("encounter diagnosis (row " + rowNum + ")");
    }
    //if both missing, throw general error
    if (!summary.diagnosisList[i].diagnosis && !summary.diagnosisList[i].type) {
      addToMissing("diagnosis");
    }
  }

  //procedure
  for (let i = 0; i < summary.procedureList.length; i++) {
    if (summary.procedureList[i].procedure && !summary.procedureList[i].type) {
      let rowNum = i + 1;
      addToMissing("encounter procedure type (row " + rowNum + ")");
    }
    if (!summary.procedureList[i].procedure && summary.procedureList[i].type) {
      let rowNum = i + 1;
      addToMissing("encounter procedure (row " + rowNum + ")");
    }
    //if both missing, not required
  }

  //services
  for (let i = 0; i < summary.servicesList.length; i++) {
    if (
      i === 0 &&
      !summary.servicesList[i].productOrService &&
      !summary.servicesList[i].estimatedDateOfService
    ) {
      addToMissing("services");
      break;
    }
    if (!summary.servicesList[i].productOrService) {
      let rowNum = i + 1;
      addToMissing("service (product or service - row " + rowNum + ")");
      addToMissing("service (unit price - row " + rowNum + ")");
      addToMissing("service (net - row " + rowNum + ")");
    }
    if (!summary.servicesList[i].estimatedDateOfService) {
      let rowNum = i + 1;
      addToMissing("service (estimate date - row " + rowNum + ")");
    }
  }

  const SummaryText = (props) => (
    <div>
      <Typography variant="subtitle1" component="h3" className={classes.card}>
        {props.content}
      </Typography>
    </div>
  );
  function addToMissing(item) {
    missingItems.push(item);
  }

  const card = (
    <React.Fragment>
      <CardContent justifyContent="left" className={classes.card}>
        <Grid container>
          <Box sx={{ mb: 2 }}>
            <b>Subject Details:</b>
          </Box>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Patient:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.patientId ? summary.patientId : ""} />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Birthdate:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.birthdate} />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Gender:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.gender} />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Telephone:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.telephone} />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Address:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.addressId} />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Submitting Provider:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <Typography style={{ wordWrap: "break-word" }}>
              {summary.submittingProviderName
                ? summary.submittingProviderName
                : ""}
            </Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="GFE Type:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText
              content={
                summary.gfeType ? summary.gfeType : addToMissing("gfe type")
              }
            />
          </Grid>
        </Grid>

        <Box sx={{ my: 2 }}>
          <Divider />
          <Divider light />
        </Box>

        <Grid container>
          <Box sx={{ mb: 2 }}>
            <b>Insurance Details:</b>
          </Box>
        </Grid>

        {summary.payorName ? (
          <Grid container>
            <Grid item xs={2}>
              <SummaryText content="Payor" class="label" />
            </Grid>
            <Grid item xs={6}>
              <SummaryText content={summary.payorName} />
            </Grid>
          </Grid>
        ) : null}

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Subscriber ID:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.subscriberId} />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Member ID:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.memberId} />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Subscriber Relationship:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.subscriberRelationship} />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Plan:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.coveragePlan} />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Coverage Period:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.coveragePeriod} />
          </Grid>
        </Grid>

        <Box sx={{ my: 2 }}>
          <Divider />
          <Divider light />
        </Box>

        <Grid container>
          <Box sx={{ mb: 2 }}>
            <b>Care Team Details:</b>
          </Box>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Billing:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <Typography style={{ wordWrap: "break-word" }}>
              {summary.billingProviderName ? summary.billingProviderName : ""}
            </Typography>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Care Team:" class="label" />
          </Grid>
          {summary.careTeamList.length > 0 && (
            <Grid item xs={4}>
              <SummaryTable
                headers={[
                  { display: "Provider", value: "provider" },
                  { display: "Role", value: "role" },
                ]}
                data={summary.careTeamList}
              />
            </Grid>
          )}
        </Grid>

        <Box sx={{ my: 2 }}>
          <Divider />
          <Divider light />
        </Box>

        <Grid container>
          <Box sx={{ mb: 2 }}>
            <b>Service Details:</b>
          </Box>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Priority:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText
              content={
                summary.priorityLevel
                  ? summary.priorityLevel.priority.coding[0].code
                  : ""
              }
            />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Diagnosis:" class="label" />
          </Grid>
          <Grid item xs={6}>
            {summary.diagnosisList.length > 0 && (
              <SummaryTable
                headers={[
                  {
                    display: "Diagnosis",
                    value: "diagnosis",
                  },
                  {
                    display: "Type",
                    value: "type",
                  },
                ]}
                data={summary.diagnosisList}
              />
            )}
          </Grid>
        </Grid>

        {summary.procedureList.length > 0 ? (
          <Grid container>
            <Grid item xs={2}>
              <SummaryText content="Procedure:" class="label" />
            </Grid>
            <Grid item xs={6}>
              <Typography style={{ wordWrap: "break-word" }}>
                {createProcedureList(summary.procedureList)}
              </Typography>
            </Grid>
          </Grid>
        ) : null}

        <Grid container>
          <Grid item xs={2}>
            <SummaryText content="Services:" class="label" />
          </Grid>
          <Grid item xs={10}>
            {summary.claimItemList.length > 0 && (
              <SummaryTable
                headers={[
                  {
                    display: "Product Or Service",
                    value: "productOrService",
                  },
                  {
                    display: "Estimate Date",
                    value: "estimatedDateOfService",
                  },
                  { display: "Unit Price", value: "unitPrice" },
                  { display: "Quantity", value: "quantity" },
                  { display: "Net", value: "net" },
                  { display: "Place Of Service", value: "placeOfService" },
                ]}
                data={summary.claimItemList}
              />
            )}
          </Grid>
        </Grid>
      </CardContent>
    </React.Fragment>
  );

  return (
    <div>
      {alertDialog(missingItems)}

      <Card variant="outlined">{card}</Card>
    </div>
  );
}
