import React, { useContext, useState } from 'react';
import { Autocomplete, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, InputAdornment, IconButton, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Grid from '@mui/material/Grid2';
import { AppContext } from '../Context';
import { getSupportedSearchParams } from '../api';

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
    const [tokenDialogType, setTokenDialogType] = useState('');

    const needsToken = (server) => server && !(server.includes('localhost') || server.includes('pct-payer') || server.includes('pct-coordination-platform') || server.includes('pct-ehr'));

    const handleCoordinationServerChanges = async (newValue) => {
        if (newValue === coordinationServer) return;
        setCoordinationServer(newValue);
        localStorage.setItem("pct-selected-coordination-server", newValue);
        if (props.resetState) {
            props.resetState();
        }
        // Fetch new capability statement when CoordinationServer address is updated
        try {
            await getSupportedSearchParams(newValue, "Task", "cp");
        } catch (err) {
            console.error('Error fetching capability statement:', err);
        }
    }

    const handleDataServerChanges = async (newValue) => {
        if (newValue === dataServer) return;
        setDataServer(newValue);
        localStorage.setItem("pct-selected-data-server", newValue);
        // props.setDataServerChanged(true);
        if (props.resetState) {
            props.resetState();
        }
        // Fetch capability statement when EHR Server address is updated
        try {
            await  getSupportedSearchParams(newValue, "DocumentReference", "ehr");
        } catch (err) {
            console.error('Error fetching capability statement:', err);
        }
    }

    const handlePayerServerChanges = async (newValue) => {
        if (newValue === payerServer) return;
        setPayerServer(newValue);
        localStorage.setItem("pct-selected-payer-server", newValue);
        // props.setPayerServerChanged(true);
        if (props.resetState) {
            props.resetState();
        }
        // Fetch capability statement when Payer server address is updated
        try {
            await  getSupportedSearchParams(newValue, "DocumentReference", "payer");
        } catch (err) {
            console.error('Error fetching capability statement:', err);
        }
    }

    const handleCoordinationServerLockClick = () => {
        setTokenDialogType('cp');
        setTokenDialogOpen(true);
    };
    const handlePayerServerLockClick = () => {
        setTokenDialogType('payer');
        setTokenDialogOpen(true);
    };
    const handleEHRServerLockClick = () => {
        setTokenDialogType('ehr');
        setTokenDialogOpen(true);
    };

    const handleTokenSave = () => {
        switch (tokenDialogType) {
            case 'cp':
                localStorage.setItem('cp-token', tokenValue);
                break;
            case 'payer':
                localStorage.setItem('payer-token', tokenValue);
                break;
            case 'ehr':
                localStorage.setItem('ehr-token', tokenValue);
                break;
            default:
                break;
        }
        setTokenDialogOpen(false);
        setTokenValue('');
        setTokenDialogType('');
    };

    const handleTokenCancel = () => {
        setTokenDialogOpen(false);
        setTokenValue('');
        setTokenDialogType('');
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
                            placeholder={needsToken(coordinationServer) ? 'needs token' : ''}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: needsToken(coordinationServer) ? (
                                    <InputAdornment position="end">
                                        <Tooltip title="Click to add or update auth token for this server.">
                                            <IconButton
                                                aria-label="add token"
                                                onClick={handleCoordinationServerLockClick}
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
                                style: needsToken(coordinationServer) ? { color: '#888' } : {},
                            }}
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
                            placeholder={needsToken(dataServer) ? 'needs token' : ''}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: needsToken(dataServer) ? (
                                    <InputAdornment position="end">
                                        <Tooltip title="Click to add or update auth token for this server.">
                                            <IconButton
                                                aria-label="add token"
                                                onClick={handleEHRServerLockClick}
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
                                style: needsToken(dataServer) ? { color: '#888' } : {},
                            }}
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
                                                onClick={handlePayerServerLockClick}
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
            <Dialog open={tokenDialogOpen} onClose={handleTokenCancel}  maxWidth="sm" fullWidth>
                <DialogTitle>
                    {tokenDialogType === 'cp' ? 'Enter Auth Token for Coordination Platform Server' :
                        tokenDialogType === 'payer' ? 'Enter Auth Token for Payer Server' : 'Enter Auth Token for EHR Server'}
                </DialogTitle>
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
