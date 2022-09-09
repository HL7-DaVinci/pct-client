import React from 'react';
import {
    Typography, Grid, Accordion, AccordionDetails, AccordionSummary
} from '@material-ui/core';
import Divider from '@mui/material/Divider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import moment from 'moment';
import CircleIcon from '@mui/icons-material/Circle';

export default function AEOBEntry(props) {

    function getDate() {
        const date = props.aeob.meta.lastUpdated;
        return moment(date).format('lll');
    }

    function getStatusIcon() {
        return props.aeob.outcome === "complete" ? (<CircleIcon sx={{ color: "green" }} />) : (<CircleIcon sx={{ color: "orange" }} />)
    }

    return (
        <React.Fragment>
            <Grid item>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Grid container direction='row' spacing={2}>
                            <Grid item>
                                <Typography><b>AEOB: </b>{props.aeob.id}</Typography>
                            </Grid>
                            
                            <Grid item>
                                <Grid container direction='row'>
                                    <Grid item>
                                        <Typography>Outcome: </Typography>
                                    </Grid>
                                    <Grid item>
                                        {getStatusIcon()}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails >
                        <Grid style={{ marginTop: 33 }}>
                            <Divider />
                            <Divider light />
                            <Divider />
                            <Divider light />

                            <Grid item>
                                <Grid container spacing={0}>
                                    <Grid item xs={4} >
                                        <Typography variant="h6" align='left' style={{ color: "#d7d3d3" }}>THIS IS NOT A BILL</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>ID:</b> {props.aeob.id}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>Created:</b> {getDate()}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" gutterBottom>
                                    <b>Outcome:</b> {props.aeob.outcome}
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
                                        {props.aeob.total.map((value, index) => {
                                            return <Grid item>
                                                <Typography variant="body1" gutterBottom>
                                                    <b>{value.category.coding[0].display}:</b> {new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(value.amount.value)} {value.amount.currency ? value.amount.currency : "USD"}
                                                </Typography>
                                            </Grid>
                                        })}
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item>
                                <Typography variant="h6" gutterBottom>
                                    <b>Items:</b>
                                </Typography>

                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </Grid>
        </React.Fragment>
    )
}