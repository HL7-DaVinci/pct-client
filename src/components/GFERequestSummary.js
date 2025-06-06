import React from "react";
import {
  Divider,
  Grid,
  Typography,
  CardContent,
  Card,
  Box
} from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) =>
  createStyles({
    card: {
      minWidth: "50vw",
      textAlign: "left",
      color: theme.palette.text.secondary,
      backgroundColor: "#DCDCDC",
    },
  })
);

export default function GFERequestSummary(props) {
  const classes = useStyles();
  const { summary } = props;
  const SummaryText = (props) => {
    return (
      <div>
        <Typography variant="subtitle2" component="h6" className={classes.card}>
          {props.content}
        </Typography>
      </div>
    );
  };
  const TitleText = (props) => (
    <div>
      <Typography variant="h6" className={classes.card}>
        {props.content}
      </Typography>
    </div>
  );

  const card = (
    <React.Fragment>
      <CardContent className={classes.card}>
        <Grid container>
          <Grid item xs={6}>
            <Box sx={{ mb: 2 }}>
              <b>
                <u>
                  <TitleText content="Demographics:" class="label" />
                </u>
              </b>
            </Box>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <SummaryText content="Patient:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.patientId} />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <SummaryText content="Birthdate:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.birthdate} />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <SummaryText content="Gender:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.gender} />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={6}>
            <SummaryText content="Telephone:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.telephone} />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={6}>
            <SummaryText content="Address:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.addressId} />
          </Grid>
        </Grid>
        <Box sx={{ my: 2 }}>
          <Divider />
          <Divider light />
        </Box>

        <Grid container>
          <Grid item xs={6}>
            <Box sx={{ mb: 2 }}>
              <b>
                <u>
                  <TitleText content="Insurance:" class="label" />
                </u>
              </b>
            </Box>
          </Grid>
        </Grid>

        {summary.payorId !== undefined ? (
          <Grid container>
            <Grid item xs={6}>
              <SummaryText content="Payor:" class="label" />
            </Grid>
            <Grid item xs={6}>
              <SummaryText content={summary.payorId} />
            </Grid>
          </Grid>
        ) : null}
        <Grid container>
          <Grid item xs={6}>
            <SummaryText content="Subscriber ID:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.subscriberId} />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <SummaryText content="Member ID:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.memberId} />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <SummaryText content="Subscriber Relationship:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.subscriberRelationship} />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <SummaryText content="Plan:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.coveragePlan} />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <SummaryText content="Coverage Period:" class="label" />
          </Grid>
          <Grid item xs={6}>
            <SummaryText content={summary.coveragePeriod} />
          </Grid>
        </Grid>
      </CardContent>
    </React.Fragment>
  );

  return (
    <div>
      <Card variant="outlined">{card}</Card>
    </div>
  );
}
