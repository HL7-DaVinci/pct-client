import React, { useContext, useState } from 'react';
import { Autocomplete, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, InputAdornment, IconButton, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Grid from '@mui/material/Grid2';
import { AppContext } from '../Context';


export default function Settings(props) {

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

    const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
    const [tokenValue, setTokenValue] = useState('');

    // Helper to check if selected payer server needs token
    const needsToken = (server) => server && !(server.includes('localhost') || server.includes('pct-payer'));

    const handleCoordinationServerChanges = (newValue) => {
        setCoordinationServer(newValue);
        localStorage.setItem("pct-selected-coordination-server", newValue);
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

    const handleTokenSave = () => {
        localStorage.setItem('payer-token', tokenValue);
        setTokenDialogOpen(false);
        setTokenValue('');
    };

    const handleTokenCancel = () => {
        setTokenDialogOpen(false);
        setTokenValue('');
    };

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
                            placeholder={needsToken(payerServer) ? 'needs token' : ''}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: needsToken(payerServer) ? (
                                    <InputAdornment position="end">
                                        <Tooltip title="Click to add or update auth token for this server.">
                                            <IconButton
                                                aria-label="add token"
                                                onClick={() => setTokenDialogOpen(true)}
                                                edge="end"
                                                size="small"
                                            >
                                                <LockIcon style={{ color: '#888' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                ) : params.InputProps.endAdornment,
                            }}
                            inputProps={{
                                ...params.inputProps,
                                style: needsToken(payerServer) ? { color: '#888' } : {},
                            }}
                        />
                    )}
                />
            </Grid>
            <Dialog open={tokenDialogOpen} onClose={handleTokenCancel}>
                <DialogTitle>Enter Auth Token for Payer Server</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Token"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={tokenValue}
                        onChange={e => setTokenValue(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleTokenCancel}>Cancel</Button>
                    <Button onClick={handleTokenSave} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}
