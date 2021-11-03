import React from 'react';

import { Grid, Typography, makeStyles, createStyles, FormControl, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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

    console.log("Settings dataServers:", props.dataServers);

    props.dataServers.map((item) => {
        console.log("dataServer entry: ", item);
        return item;
    });


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
                    <div >
                        <Grid container>
                            <Grid item xs={12} className={classes.input}>
                                <FormControl>
                                    <Typography>Provider data server:</Typography>
                                    <input list="data-server-list" id="provider-data-server" name="provider-data-server" defaultValue={props.selectedDataServer} onChange={handleDataServerChanges} />
                                    <datalist id="data-server-list">
                                        {props.dataServers.map((item) =>
                                            <option key={item.value} value={item.value} />
                                        )}
                                    </datalist>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} className={classes.input}>
                                <FormControl>
                                    <Typography>Payer GFE server:</Typography>
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
