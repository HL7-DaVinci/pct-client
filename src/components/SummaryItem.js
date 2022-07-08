import React from 'react';
import { Grid, Typography, CardContent, Card, makeStyles, createStyles, Box } from '@material-ui/core'
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';


const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            //minWidth: "80%",
            minWidth: "70vw",
            textAlign: "left",
            marginLeft: 0,
            color: theme.palette.text.secondary,
            backgroundColor: "#D3D3D3"
        },
        listItemProcedure: {
            marginLeft: 0
        }
    }),
);


function createProcedureList(procedureList) {
    console.log(procedureList)

    return procedureList.map(el => {
        return <ListItem disableGutters>{el.id}: {el.procedure}, {el.type}</ListItem>
    })
}



export default function SummaryItem(props) {
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
                        <SummaryText content="Patient:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={(summary.patientId)} />
                    </Grid>
                </Grid>


                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Birthdate:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.birthdate} />
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Gender:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.gender} />
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Telephone:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.telephone} />
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
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
                    <Box sx={{ mb: 2 }}>
                        <SummaryText content="Insurance:" class="label" />
                    </Box>
                </Grid>


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

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Subscriber ID:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.subscriberId} />
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Member ID:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.memberId} />
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Subscriber Relationship:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.subscriberRelationship} />
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Plan:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.coveragePlan} />
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
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
                        <SummaryText content="Care Team:" class="label" />
                    </Box>
                </Grid>

                {(summary.payorId !== undefined) ?
                    <Grid container>
                        <Grid item xs={6} >
                            <SummaryText content="Billing:" class="label" />
                        </Grid>
                        <Grid item xs={6}>
                            <SummaryText content={summary.practitionerSelected[0].provider} />
                        </Grid>
                    </Grid> : null
                }

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Practitioner Role:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.practitionerSelected[0].role} />
                    </Grid>
                </Grid>

                <Box sx={{ my: 2 }}>
                    <Divider />
                    <Divider light />
                </Box>

                <Grid container>
                    <Box sx={{ mb: 2 }}>
                        <SummaryText content="Service Details:" class="label" />
                    </Box>
                </Grid>

                {(summary.payorId !== undefined) ?
                    <Grid container>
                        <Grid item xs={6} >
                            <SummaryText content="Type:" class="label" />
                        </Grid>
                        <Grid item xs={6}>
                            <SummaryText content={summary.gfeType} />
                        </Grid>
                    </Grid> : null
                }

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Date:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.startDateService + " - " + summary.endDateService} />
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Priority:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.priorityLevel.priority.coding[0].code} />
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Diagnosis:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.diagnosisList[0].diagnosis} />
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Procedure:" class="label" />
                    </Grid>
                    <Grid item xs={6}>

                        <SummaryText content={createProcedureList(summary.procedureList)} />
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Services:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={summary.servicesList[0].productOrService} />
                    </Grid>
                </Grid>



            </CardContent>
        </React.Fragment >
    )



    return (
        <div>
            <Card variant="outlined">{card}</Card>
        </div>
    )
}



