import React from 'react';
import {
    Typography, Grid, Accordion, AccordionDetails, AccordionSummary
} from '@material-ui/core';
import Divider from '@mui/material/Divider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import moment from 'moment';
import AEOBItemsTable from "./AEOBItemsTable";
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
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    style={{ backgroundColor: "#EEEEEE" }}
                >
                    <Grid container direction='row' spacing={2}>
                        <Grid item>
                            <Typography><b>AEOB: </b>{props.aeob.id}</Typography>
                        </Grid>

                        <Grid item>
                            <Grid container direction='row' spacing={1}>
                                <Grid item>
                                    <Typography><b>Outcome: </b></Typography>
                                </Grid>
                                <Grid item>
                                    {props.aeob.outcome}
                                </Grid>
                                <Grid item>
                                    {getStatusIcon()}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails style={{ backgroundColor: "#EEEEEE" }} >
                    <Grid style={{ marginTop: 33 }}>
                        <Divider />
                        <Divider light />
                        <Divider />
                        <Divider light />

                        <Grid item>
                            <Typography variant="h6" align='center' style={{ color: "#b7b7b7" }}>THIS IS NOT A BILL</Typography>
                        </Grid>
                        <br></br>
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
                        <br></br>

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
                        <br></br>

                        <Grid item>
                            <Typography variant="h6" gutterBottom>
                                <b>Items:</b>
                                <AEOBItemsTable props={props} />
                            </Typography>

                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </React.Fragment>
    )
}