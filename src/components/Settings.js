import React, { useContext } from 'react';

import { Autocomplete, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { createStyles, makeStyles } from "@mui/styles";
import { AppContext } from '../Context';

const useStyles = makeStyles((theme) =>
    createStyles({
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

    const {
        coordinationServers,
        coordinationServer,
        setCoordinationServer,
        dataServers,
        dataServer,
        setDataServer,
        payerServers,
        payerServer,
        setPayerServer
    } = useContext(AppContext);

    const handleCoordinationServerChanges = (newValue) => {
        setCoordinationServer(newValue);
        localStorage.setItem("pct-selected-coordination-server", newValue);
        // props.setCoordinationServerChanged(true);
        if (props.resetState) {
            props.resetState();
        }
    }

    const handleDataServerChanges = (newValue) => {
        console.log("handleDataServerChanges", newValue);
        setDataServer(newValue);
        localStorage.setItem("pct-selected-data-server", newValue);
        // props.setDataServerChanged(true);
        if (props.resetState) {
            props.resetState();
        }
    }

    const handlePayerServerChanges = (newValue) => {
        setPayerServer(newValue);
        localStorage.setItem("pct-selected-payer-server", newValue);
        // props.setPayerServerChanged(true);
        if (props.resetState) {
            props.resetState();
        }
    }


    return (
        <Grid container 
            spacing={2}
            margin={2}
            direction="row"
            >
            <Grid size={4}>
                <Autocomplete 
                    freeSolo
                    disableClearable
                    options={coordinationServers.map((option) => option.value)}
                    value={coordinationServer}
                    onChange = {(e, newValue) => handleCoordinationServerChanges(newValue)}
                    onInputChange= {(e, newValue) => handleCoordinationServerChanges(newValue)}
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label="Coordination Platform Server" 
                            margin="normal"
                            variant="outlined"
                        />
                    )}
                />
            </Grid>
            <Grid size={4}>
                <Autocomplete 
                    freeSolo
                    disableClearable
                    options={dataServers.map((option) => option.value)}
                    value={dataServer}
                    onChange = {(e, newValue) => handleDataServerChanges(newValue)}
                    onInputChange= {(e, newValue) => handleDataServerChanges(newValue)}
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label="Provider Data Server" 
                            margin="normal"
                            variant="outlined"
                        />
                    )}
                />
            </Grid>
            <Grid size={4}>
                <Autocomplete 
                    freeSolo
                    disableClearable
                    options={payerServers.map((option) => option.value)}
                    value={payerServer}
                    onChange = {(e, newValue) => handlePayerServerChanges(newValue)}
                    onInputChange= {(e, newValue) => handlePayerServerChanges(newValue)}
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label="Payer GFE Data Server" 
                            margin="normal"
                            variant="outlined"
                        />
                    )}
                />
            </Grid>
        </Grid>
    )
}
