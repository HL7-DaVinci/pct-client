import React from 'react';
import { Grid, Typography, CardContent, Card, makeStyles, createStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            minWidth: 200,
            textAlign: "left",
            marginLeft: 20, 
            color: theme.palette.text.secondary,
            backgroundColor: "#fff"
        }
    }),
);

export default function GFERequestsummary(props) {
    const classes = useStyles();
    const { summary } = props;

    const SummaryText = props => (
        <div>
            <Typography variant="subtitle1" component="h3" className={classes.card}>
                {props.content}
            </Typography>
        </div>
    )

    const card = (
        <React.Fragment>
            <CardContent justifyContent="left" className={classes.card}>
                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Patient" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.patientId} />
                    </Grid>
                </Grid>
                {(summary.coverageId !== undefined) ?
                    <Grid container>
                        <Grid item xs={6} >
                            <SummaryText content="Insurance" class="label" />
                        </Grid>
                        <Grid item xs={6} >
                            <SummaryText content={summary.coverageId} />
                        </Grid>
                    </Grid> : null
                }
                {(summary.payorId !== undefined) ?
                    <Grid container>
                        <Grid item xs={6} >
                            <SummaryText content="Payor" class="label" />
                        </Grid>
                        <Grid item xs={6}>
                            <SummaryText content={summary.payorId} />
                        </Grid>
                    </Grid> : null
                }           
            </CardContent>
        </React.Fragment>
    )

    return (
        <div>
            <Card variant="outlined">{card}</Card>
        </div>
    )
}


