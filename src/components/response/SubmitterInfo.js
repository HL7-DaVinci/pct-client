import React from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import jp from "jsonpath";

export default function SubmitterInfo(props) {

    function getSubmitterResource() {
        const eobs = jp.query(props, '$..[?(@.resourceType == "ExplanationOfBenefit")]');
        // Filter out any ExplanationOfBenefit entries that are summaries (e.g., those with type.coding.code = "estimate-summary")
        const filtered = eobs.filter(e => !(e.type?.coding?.some(coding => coding.code === "estimate-summary")));
        return filtered[0];
    }

    function getSubmittingProviderResource() {
        const submitterResource = getSubmitterResource();
        if (!submitterResource || !submitterResource.provider || !submitterResource.provider.reference) {
            console.error("Submitter resource or provider reference not found in AEOB bundle");
            return undefined;
        }
        const providerRef = submitterResource.provider.reference;
        const entries = jp.query(props, "$..entry[*]");
        // Match relative/absolute mismatch
        const match = entries.find(e => e.fullUrl === providerRef) || entries.find(e => e.fullUrl && e.fullUrl.endsWith(providerRef));
        if (!match) {
            console.warn("[getSubmittingProviderResource] No resource found for provider.reference:", providerRef);
            return undefined;
        }
        return match.resource;
    }

    function getSubmittingProviderId() {
        const submitterResource = getSubmitterResource();
        const submitterProviderURL = submitterResource?.provider?.reference;
        if (!submitterProviderURL) {
            console.warn("Provider reference not found in ExplanationOfBenefit");
            return "Unknown Provider";
        }
        const entries = jp.query(props, "$..entry[*]");
        const match = entries.find(e => e.fullUrl === submitterProviderURL) ||
            entries.find(e => e.fullUrl && e.fullUrl.endsWith(submitterProviderURL));
        if (!match || !match.resource || !match.resource.id) {
            console.warn(`No provider organization found for URL: ${submitterProviderURL}`);
            return "Unknown Provider ID";
        }
        return match.resource.id;
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