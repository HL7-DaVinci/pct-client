import React from 'react';
import { Grid, Typography } from '@mui/material';
import jp from "jsonpath";

export default function SubmitterInfo(props) {

    function getSubmitterResource() {
        return jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")]')[0];
    }

    function getSubmittingProviderResource(eobResource) {
        const submitterResource = getSubmitterResource();
        if (!submitterResource) {
            console.error("Submitter resource not found in AEOB bundle");
            return null;
        }
        return jp.query(props, "$..[?(@.fullUrl ==".concat("'", submitterResource.provider.reference, "')].resource"))[0];
    }

    function getSubmittingProviderId() {
        // Retrieve the provider reference from ExplanationOfBenefit
        const eobQuery = '$..[?(@.resourceType == "ExplanationOfBenefit")].provider.reference';
        console.log("ExplanationOfBenefit Resources:", eobQuery);

        if (!eobQuery.length) {
            console.warn("No ExplanationOfBenefit resources found");
            return "Unknown Provider";
        }

        const submitterProviderURL = jp.query(props, eobQuery)[0];
        console.log("Submitter Provider URL:", submitterProviderURL);
        if (!submitterProviderURL) {
            console.warn("Provider reference not found in ExplanationOfBenefit");
            return "Unknown Provider";
        }

        // Construct query to fetch provider organization ID
        const fullString = `$..[?(@.fullUrl == '${submitterProviderURL}')].resource.id`;
        const providerId = jp.query(props, fullString)[0];

        if (!providerId) {
            console.warn(`No provider organization found for URL: ${submitterProviderURL}`);
            return "Unknown Provider ID";
        }

        return providerId;
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