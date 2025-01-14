import React from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import jp from "jsonpath";

export default function SubmitterInfo(props) {

    function getSubmitterResource() {
        return jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")]')[0];
    }

    function getSubmittingProviderResource() {
        const submitterResource = getSubmitterResource();
        if (!submitterResource) {
            console.error("Submitter resource not found in AEOB bundle");
            return null;
        }
        return jp.query(props, "$..[?(@.fullUrl ==".concat("'", submitterResource.provider.reference, "')].resource"))[0];
    }

    function getSubmittingProviderId() {
        // Retrieve insurer reference from ExplanationOfBenefit
        const insurerQuery = '$..[?(@.resourceType == "ExplanationOfBenefit")].insurer.reference';
        const submitterProviderURL = jp.query(props, insurerQuery)[0];

        if (!submitterProviderURL) {
            console.warn("Insurer reference not found in ExplanationOfBenefit");
            return "Unknown Provider";
        }

        console.log("Submitter Provider URL:", submitterProviderURL);

        // Retrieve provider ID using the full URL
        const fullString = `$..[?(@.fullUrl == '${submitterProviderURL}')].resource.id`;
        const providerId = jp.query(props, fullString)[0];

        if (!providerId) {
            console.warn(`No provider organization found for URL: ${submitterProviderURL}`);
            return "Unknown Provider ID";
        }

        console.log("Provider ID:", providerId);
        return providerId;
    }
    return (
        <React.Fragment>
            <Grid direction="column" container style={{ marginTop: 10 }}> 
                <Grid>
                    <Typography variant="h5" gutterBottom>
                        <b><u>GFE Submitter</u></b>
                    </Typography>
                </Grid>                    
                
                <Grid>
                    <Typography variant="body1" gutterBottom className={props.classes.spaceBelow}>
                        <b>Submitting Provider:</b> {props.getNameDisplay(getSubmittingProviderResource())} ({getSubmittingProviderId()})
                    </Typography>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}