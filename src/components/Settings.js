import React from 'react';

import { Grid, Typography, FormControl, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { createStyles, makeStyles } from "@mui/styles";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const useStyles = makeStyles((theme) =>
    createStyles({
        paper: {
            padding: theme.spacing(2),
            textAlign: 'left',
            backgroundColor: "inherit",
            maxWidth: 500
        },
        title: {
            backgroundColor: "#d7d3d3"
        },
        input: {
            fontSize: 14,
            '& input': {
                width: 400
            }
        }
    }),
);

export default function Settings(props) {

    const classes = useStyles();

    const handleDataServerChanges = e => {
        props.setSelectedDataServer(e.target.value);
        props.setDataServerChanged(true);
        props.resetState();
    }

    const handlePayerServerChanges = e => {
        props.setSelectedPayerServer(e.target.value);
        props.setPayerServerChanged(true);
        props.resetState();
    }

    return (
        <React.Fragment>
            <Accordion className={classes.paper} defaultExpanded={true}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    className={classes.title}
                >
                    <Typography>Client Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div>
                        <Grid container className={classes.input}>
                            <Grid item xs={12}>
                                <FormControl>
                                    <Typography>Provider Data Server:</Typography>
                                    <input list="data-servers" id="provider-data-server" defaultValue={props.selectedDataServer} onChange={handleDataServerChanges} />
                                    <datalist id="data-servers">
                                        {
                                            props.dataServers.map(item => <option key={item.value} value={item.value} />)
                                        }
                                    </datalist>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl>
                                    <Typography>Payer GFE Server:</Typography>
                                    <input list="payer-server-list" id="payer-gfe-server" name="payer-gfe-server" defaultValue={props.selectedPayerServer} onChange={handlePayerServerChanges} />
                                    <datalist id="payer-server-list">
                                        {props.payerServers.map((item) =>
                                            <option key={item.value} value={item.value} />
                                        )}
                                    </datalist>
                                </FormControl>
                            </Grid>

                        </Grid>
                    </div>
                </AccordionDetails>
            </Accordion>
        </React.Fragment>
    )
}
