import * as React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Editor } from '@monaco-editor/react';

export default function ViewGFERequestDialog(props) {
    const [open, setOpen] = React.useState(false);
    const [request, setRequest] = React.useState(undefined);
    const [error, setError] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
        if (props.error === undefined) {
            setRequest(props.generateRequest());
        } else {
            setError(true);
            setRequest(props.error);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                Raw JSON{/*Review GFE Request*/}
            </Button>
            <Dialog
                maxWidth="lg"
                open={open}
                onClose={handleClose}
                fullWidth={true}
            >
                <DialogTitle>Review Generated Good Faith Estimate Request</DialogTitle>
                <DialogContent>
                    {/* {
                        error ? null : (<DialogContentText>
                            Review Generated GFE Request
                        </DialogContentText>)
                    } */}
                    
                        {
                            error ? (
                                <Box
                                    noValidate
                                    component="form"
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        m: 'auto',
                                        width: 'fit-content',
                                        height: "fit-content"
                                    }}
                                >
                                    <div style={{ color: "red" }}>
                                        <span>Request Validation Errors:</span>
                                        <ul>
                                            {
                                                request ? (request.map(error => (
                                                    <li>
                                                        {error}
                                                    </li>
                                                ))) : (props.error.map(error => (
                                                    <li>
                                                        {error}
                                                    </li>
                                                )))
                                            }
                                        </ul>

                                    </div>
                                </Box>
                            ) : (
                                <Editor 
                                    height="75vh"
                                    defaultLanguage="json"
                                    defaultValue={JSON.stringify(request, undefined, 2)}
                                    options={{readOnly: true}}
                                />
                            )
                        }
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog >
        </React.Fragment >
    );
}