import React from 'react';
import {
    Typography, Grid
} from '@material-ui/core';
import Divider from '@mui/material/Divider';
import jp from "jsonpath";

export default function PatientInfo(props) {

    function getPatientResource() {
        return jp.query(props, "$..[?(@.fullUrl ==" + "'" + jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].patient.reference')[0] + "')].resource")[0];
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

    function getTelecomDisplay(telecomArray) {
        var returnString = "";

        if (Array.isArray(telecomArray)) {
            telecomArray.forEach(function (telecom) {
                returnString += telecom.value;
                if ('use' in telecom) {
                    returnString += " (" + telecom.use;
                    if ('system' in telecom) {
                        returnString += " " + telecom.system;
                    }
                    returnString += ")";
                }
                else if ('system' in telecom) {
                    returnString += "(" + telecom.system + ")";
                }
                returnString += "; ";
            });
        }
        else
            console.log(telecomArray);

        return returnString;
    }

    function getAddressDisplay(addressArray) {
        var returnString = "";

        if (Array.isArray(addressArray)) {
            addressArray.forEach(function (address) {
                if ('text' in address) {
                    returnString += " " + address.text;
                }
                else {
                    returnString += "TODO Address without text";
                }
            });
        }
        else
            console.log(addressArray);

        return returnString;
    }

    function getCoverageResource() {
        return jp.query(props, "$..[?(@.fullUrl ==" + "'" + jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].insurance[0].coverage.reference')[0] + "')].resource")[0];
    }

    function getPayorResource() {
        return jp.query(props, "$..[?(@.fullUrl ==" + "'" + jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].insurer.reference')[0] + "')].resource")[0];
    }

    return (
        <React.Fragment>
            <Grid className={props.classes.info}>
                <Divider />
                <Divider light />
                <Grid item>
                    <Typography variant="h5" gutterBottom>
                        <b><u>Patient Information</u></b>
                    </Typography>
                </Grid>
                <Grid container direction="row" spacing={9} >
                    <Grid item>
                        <Grid container direction="column" >
                            <Grid item>
                                <Typography variant="h6" gutterBottom>
                                    <b>Demographics:</b>
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>Name:</b> {getHumanNameDisplay(getPatientResource().name[0])}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>Birthdate:</b> {getPatientResource().birthDate}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>Gender:</b> {getPatientResource().gender}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>Telephone:</b> {getTelecomDisplay(getPatientResource().telecom)}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>Address:</b> {getAddressDisplay(getPatientResource().address)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Grid container direction="column">
                            <Grid item>
                                <Typography variant="h6" gutterBottom>
                                    <b>Insurance:</b>
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>Payor:</b> {getPayorResource().name}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>Subscriber:</b> {getCoverageResource().subscriberId} ({getCoverageResource().relationship.coding[0].display})
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>Member ID:</b> {getCoverageResource().id}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>Plan:</b> {getCoverageResource().class[0].name}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>Coverage Period:</b> {getCoverageResource().period.start} to {getCoverageResource().period.end}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}