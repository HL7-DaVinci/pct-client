import React, { useState } from 'react';
import {
    Box, Typography, makeStyles, Grid, Button
} from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import Divider from '@mui/material/Divider';
import jp from "jsonpath";
import AEOBItemsTable from "./AEOBItemsTable";
import moment from 'moment';
import PatientInfo from './PatientInfo';
import SubmitterInfo from './SubmitterInfo';
import AEOBEntry from './AEOBEntry';

const useStyles = makeStyles({
    root: {
        backgroundColor: "#dadacc"
    },
    title: {
        fontSize: 14,
        fontWeight: "bold"
    },
    response: {
        textAlign: "left",
        fontSize: 14
    },
    content: {
        flexGrow: 1,
        overflow: 'auto',
        maxWidth: 1200,
        maxHeight: 400,
        marginLeft: 50
    },
    body: {
        marginTop: "12px"
    },
    blockHeader: {
        backgroundColor: "#d7d3d3",
        width: "100%"
    },
    header: {
        textAlign: "center",
        width: "100%"
    },
    error: {
        color: "red",
        textAlign: "center"
    },
    aeobResponse: {
        minWidth: "500px"
    },
    responseBody: {
        minHeight: "800px"
    },
    aeobInitialResponseText: {
        textAlign: "left",
        justifyContent: "space-between"
    },
    aeobInitialResponseButtonRawJSON: {
        alignContent: "right"
    },
    style: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    },
    aeobQueryButton: {
        marginTop: 20,
        alignItems: "right"
    },
    spaceTop: {
        marginTop: 40
    },
    spaceBelow: {
        marginBottom: 20
    },
    card: {
        minWidth: "70vw",
        textAlign: "left",
        marginLeft: 0,
        backgroundColor: "#D3D3D3"
    },
    info: {
        backgroundColor: "#EEEEEE"
    }
});

export default function AEOBBundle(props) {

    const classes = useStyles();

    const [currentTabIndex, setCurrentTabIndex] = useState(1);

    function getNameDisplay(resource) {
        var returnString = "";

        if (resource.constructor.name === 'Object' && resource !== null) {
            if (resource.resourceType === 'Organization')
                returnString = resource.name;
            else if (resource.resourceType === 'Patient' || resource.resourceType === 'Practitioner' || resource.resourceType === 'relatedPerson') {
                returnString = getHumanNameDisplay(resource.name[0]);
            }
            else {
                returnString = "Name for resource of type " & resource.resourceType & " is not supported.";
            }
        }

        return returnString;
    }

    function getHumanNameDisplay(humanName) {

        var returnString = "";

        if (humanName.constructor.name === 'Object' && humanName !== null) {
            if ('text' in humanName)
                returnString = humanName.text;
            else if ('family' in humanName) {
                returnString = humanName.family;
                if ('given' in humanName)
                    returnString += ", " + humanName.given[0];
                if (humanName.given.length > 1)
                    returnString += " " + humanName.given[1];
            }
        }
        else
            returnString = "Human Name for object of type " & typeof humanName & " is not supported.";
        return returnString;
    }

    // TODO - remove 
    function getDate() {
        const date = jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].meta.lastUpdated')[0];
        return moment(date).format('lll');

    }

    // TODO - remove 
    function calcCopay() {

        const copayPercentage = jp.query(props, '$..[?(@.resourceType == "Coverage")].costToBeneficiary[0].valueQuantity.value')[0];
        const copayDeci = copayPercentage / 100;
        const copayAmount = (copayDeci * jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].total[0].amount.value')[0]).toFixed(2);
        const currency = jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].total[0].amount.currency')[0];

        return copayAmount + " " + currency;
    }

    function getCoverageResource() {
        return jp.query(props, "$..[?(@.fullUrl ==" + "'" + jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].insurance[0].coverage.reference')[0] + "')].resource")[0];
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

    function getAEOBList() {
        const list = jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")]');
        return list;
    }

    return (
        <React.Fragment>
            <Grid container direction="column">
                <Grid container spacing={1}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Grid item md={4}>
                                <Typography variant="h5" gutterBottom>
                                    <b><u>Bundle</u></b>
                                </Typography>
                            </Grid>
                            <Grid item md={4}>
                                <Typography variant="body1" gutterBottom>
                                    ID: {jp.query(props, '$..[?(@.resourceType == "Bundle")].id')[0]}
                                </Typography>
                            </Grid>
                            <Grid item md={4}>
                                <Typography variant="body1" gutterBottom>
                                    Identifier: {jp.query(props, '$..[?(@.resourceType == "Bundle")].identifier.value')[0]}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Grid item alignItems="flex-end" xs={2}>
                            <Grid item>
                                <Button loading variant="contained" color="primary" type="show-raw-gfe" onClick={props.handleOpenAEOB}>
                                    Raw JSON
                                </Button>
                                <Dialog
                                    maxWidth="lg"
                                    open={props.openAEOB}
                                    onClose={props.handleCloseAEOB}
                                >
                                    <DialogTitle>Raw JSON of AEOB Response:</DialogTitle>
                                    <DialogContent>
                                        <Box
                                            noValidate
                                            component="form"
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                m: 'auto',
                                                width: 'fit-content',
                                                height: "fit-content"
                                            }}
                                        >
                                            <div>
                                                <pre>{JSON.stringify(props.receivedAEOBResponse, undefined, 2)}</pre>
                                            </div>
                                        </Box>
                                        <DialogActions>
                                            <Button onClick={props.handleCloseAEOBContent}>Close</Button>
                                        </DialogActions>
                                    </DialogContent>
                                </Dialog>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <PatientInfo props={props} classes={classes} />
                <SubmitterInfo props={props} classes={classes} getNameDisplay={getNameDisplay} />
                {
                    getAEOBList().map(item => {
                        return (
                            <AEOBEntry key={item.id} aeob={item} classes={classes} coverage={getCoverageResource()} />
                        )
                    })
                }

                <Grid style={{ marginTop: 33 }}>
                    <Divider />
                    <Divider light />
                    <Divider />
                    <Divider light />

                    <Grid item>
                        <Grid container spacing={0}>
                            <Grid item xs={5}>
                                <Typography variant="h5" gutterBottom>
                                    <b><u>Advanced Explanation of Benefits</u></b>
                                </Typography>

                            </Grid>
                            <Grid item xs={4} >
                                <Typography variant="h6" align='left' style={{ color: "#d7d3d3" }}>THIS IS NOT A BILL</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" gutterBottom>
                            <b>ID:</b> {jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].id')[0]}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" gutterBottom>
                            <b>Created:</b> {getDate()}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" gutterBottom>
                            <b>Outcome:</b> {jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].outcome')[0]}
                        </Typography>
                    </Grid>

                    <Grid container direction="row" spacing={9}>
                        <Grid item>
                            <Grid container direction="column" >
                                <Grid item>
                                    <Typography variant="h6" gutterBottom>
                                        <b>Totals:</b>
                                    </Typography>
                                </Grid>
                                {jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].total').map((value, index) => {
                                    return <Grid item>
                                        <Typography variant="body1" gutterBottom>
                                            <b>{value[0].category.coding[0].display}:</b> {value[0].amount.value} {value[0].amount.currency}
                                        </Typography>
                                    </Grid>
                                })}

                                <Grid item>
                                    <Typography variant="body1" gutterBottom className={classes.spaceBelow}>
                                        <b>Copay:</b> {calcCopay()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item>
                        <Typography variant="h6" gutterBottom>
                            <b>Items:</b>
                        </Typography>
                        <AEOBItemsTable title="Items" data={props} />

                    </Grid>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}