import React from 'react';
import { Grid, Typography, CardContent, Card, makeStyles, createStyles, Box } from '@material-ui/core'
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';


const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            minWidth: "70vw",
            textAlign: "left",
            marginLeft: 0,
            color: theme.palette.text.secondary,
            backgroundColor: "#DCDCDC"
        },
        listItemProcedure: {
            marginLeft: 0
        }
    }),
);


function createProcedureList(procedureList) {
    let num = 0;
    return procedureList.map(el => {
        num += 1;
        return <ListItem disableGutters>({num}) {el.type}: {el.procedure} </ListItem>
    })
}

function createDiagnosisList(diagnosisList) {
    let num = 0;
    return diagnosisList.map(el => {
        num += 1;
        return <ListItem disableGutters>({num}) {el.type}: {el.diagnosis}</ListItem>
    })
}

function createServiceList(serviceList) {

    let num = 0;
    return serviceList.map(el => {
        num += 1;
        return <ListItem disableGutters>({num}) {el.placeOfService}: {el.productOrService}</ListItem>
    })
}

function createDateList(serviceList) {

    let num = 0;
    return serviceList.map(el => {
        num += 1;
        return <ListItem disableGutters>Service #{num}: {el.estimatedDateOfService.toDateString()}</ListItem>
    })
}

function alertDialog(itemsMissing) {

    if (itemsMissing.length === 0) {
        return
    }

    return (<Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Missing Required Fields — <strong>{itemsMissing.join(", ")}</strong>
    </Alert>)
}





export default function SummaryItem(props) {
    const classes = useStyles();
    const { summary } = props;
    let missingItems = [];



    //patient section
    if ((summary.patientId) === undefined) {
        addToMissing("patient details")
    }
    if ((summary.billingProvider) === undefined) {
        addToMissing("billing provider");
    }
    if ((summary.submittingProvider) === undefined) {
        addToMissing("submitting provider");
    }
    if ((summary.gfeServiceId) === undefined) {
        addToMissing("GFE assigned service identifier");
    }



    //care team
    for (let i = 0; i < summary.practitionerSelected.length; i++) {
        //if the provider is there, check if role is too
        if (((summary.practitionerSelected[i].provider) !== undefined) && (summary.practitionerSelected[i].role) === undefined) {
            let rowNum = i + 1;
            addToMissing("care team provider role (row " + rowNum + ")");
        }
        //if role is there, check if provider
        if (((summary.practitionerSelected[i].role) !== undefined) && (summary.practitionerSelected[i].provider) === undefined) {
            let rowNum = i + 1;
            addToMissing("care team provider (row " + rowNum + ")");
        }
        //otherwise if both undefined don't throw error bc allowed
    }

    //priority level on encounter tab
    if (summary.priorityLevel === undefined) {
        addToMissing("priority level")
    }

    //diagnosis
    //check if given, and all required fields exist
    for (let i = 0; i < summary.diagnosisList.length; i++) {

        //if diagnosis there, but not type, throw error
        if (((summary.diagnosisList[i].diagnosis) !== undefined) && (summary.diagnosisList[i].type) === undefined) {
            let rowNum = i + 1;
            addToMissing("encounter diagnosis type (row " + rowNum + ")");
        }
        //if type there, but not diagnosis, throw error
        if (((summary.diagnosisList[i].type) !== undefined) && (summary.diagnosisList[i].diagnosis) === undefined) {
            let rowNum = i + 1;
            addToMissing("encounter diagnosis (row " + rowNum + ")");
        }
        //if both missing, throw general error
        if (((summary.diagnosisList[i].diagnosis) === undefined) && (summary.diagnosisList[i].type) === undefined) {
            let rowNum = i + 1;
            addToMissing("diagnosis");
        }
    }

    //procedure
    for (let i = 0; i < summary.procedureList.length; i++) {
        if (((summary.procedureList[i].procedure) !== undefined) && (summary.procedureList[i].type) === undefined) {
            let rowNum = i + 1;
            addToMissing("encounter procedure type (row " + rowNum + ")");
        }
        if (((summary.procedureList[i].procedure) === undefined) && (summary.procedureList[i].type) !== undefined) {
            let rowNum = i + 1;
            addToMissing("encounter procedure (row " + rowNum + ")");
        }
        //if both missing, not required
    }

    //services
    for (let i = 0; i < summary.servicesList.length; i++) {

        if ((i == 0) && ((summary.servicesList[i].productOrService) === undefined) && ((summary.servicesList[i].estimatedDateOfService) === undefined)) {
            addToMissing("services");
            break;
        }
        if (((summary.servicesList[i].productOrService) === undefined)) {
            let rowNum = i + 1;
            addToMissing("service (product or service - row " + rowNum + ")");
            addToMissing("service (unit price - row " + rowNum + ")");
            addToMissing("service (net - row " + rowNum + ")");
        }
        if (((summary.servicesList[i].estimatedDateOfService) === undefined)) {
            let rowNum = i + 1;
            addToMissing("service (estimate date - row " + rowNum + ")");
        }
    }



    const SummaryText = props => (
        <div>
            <Typography variant="subtitle1" component="h3" className={classes.card}>
                {props.content}
            </Typography>
        </div>
    )
    function addToMissing(item) {
        missingItems.push(item)
    }

    const card = (
        <React.Fragment>
            <CardContent justifyContent="left" className={classes.card}>
                <Grid container>
                    <Box sx={{ mb: 2 }}>
                        <b>
                            Patient Details:
                        </b>
                    </Box>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Patient:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={((summary.patientId) === undefined) ? "" : (summary.patientId)} />
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
                        <b>
                            Insurance Details:
                        </b>
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
                        <b>
                            Care Team Details:
                        </b>
                    </Box>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Billing:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography style={{ wordWrap: "break-word" }}>
                            {((summary.billingProvider) === undefined) ? "" : (summary.billingProvider)}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Submitting:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography style={{ wordWrap: "break-word" }}>
                            {((summary.submittingProvider) === undefined) ? "" : (summary.submittingProvider)}
                        </Typography>
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Practitioner Role:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={(summary.practitionerSelected[0].role === undefined) ? "" : (summary.practitionerSelected[0].role)} />
                    </Grid>
                </Grid>

                <Box sx={{ my: 2 }}>
                    <Divider />
                    <Divider light />
                </Box>

                <Grid container>
                    <Box sx={{ mb: 2 }}>
                        <b>
                            Service Details:
                        </b>
                    </Box>
                </Grid>


                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Type:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={(summary.gfeType === undefined) ? (addToMissing("gfe type")) : (summary.gfeType)} />
                    </Grid>
                </Grid>


                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Date:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        {(summary.servicesList[0].estimatedDateOfService === undefined) ? "" : (createDateList(summary.servicesList))}
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Priority:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <SummaryText content={(summary.priorityLevel === undefined) ? "" : (summary.priorityLevel.priority.coding[0].code)} />
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Diagnosis:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography style={{ wordWrap: "break-word" }}>
                            {(summary.diagnosisList[0].diagnosis === undefined) ? "" : createDiagnosisList(summary.diagnosisList)}
                        </Typography>
                    </Grid>
                </Grid>

                {(summary.procedureList[0].procedure !== undefined) ?

                    <Grid container>
                        <Grid item xs={6} >
                            <SummaryText content="Procedure:" class="label" />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography style={{ wordWrap: "break-word" }}>
                                {(createProcedureList(summary.procedureList))}
                            </Typography>
                        </Grid>
                    </Grid>
                    : null}


                <Grid container>
                    <Grid item xs={6} >
                        <SummaryText content="Services:" class="label" />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography style={{ wordWrap: "break-word" }}>
                            {(summary.servicesList[0].productOrService === undefined) ? "" : (createServiceList(summary.servicesList))}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>

        </React.Fragment >
    )




    return (
        <div>
            {alertDialog(missingItems)}

            <Card variant="outlined">{card}</Card>
        </div>
    )
}



