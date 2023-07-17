import React from 'react';
import { Grid, Typography } from '@mui/material';
import jp from "jsonpath";

export default function SubmitterInfo(props) {

    function getSubmitterResource() {
        return jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")]')[0];
    }
    function getSubmittingProviderResource(eobResource) {
        return jp.query(props, "$..[?(@.fullUrl ==".concat("'", getSubmitterResource().provider.reference, "')].resource"))[0];
    }

    function getSubmittingProviderId() {

        //get the insurance url from insurance ref
        const submitterProviderURL = jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")].provider.reference')[0];

        //get the id of the provider organization using that url
        const fullString = "$..[?(@.fullUrl ==" + "'".concat(submitterProviderURL, "'", ")].resource.id");

        //returns string: submitter-org-1
        return jp.query(props, (fullString))[0];
    }
    return (
        <React.Fragment>
            <Grid style={{ marginTop: 10 }}>


                <Grid item>
                    <Grid container spacing={0}>
                        <Grid item xs={5}>
                            <Typography variant="h5" gutterBottom>
                                <b><u>GFE Submitter</u></b>
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Typography variant="body1" gutterBottom className={props.classes.spaceBelow}>
                        <b>Submitting Provider:</b> {props.getNameDisplay(getSubmittingProviderResource(jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")]')[0]))} ({getSubmittingProviderId()})
                    </Typography>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}