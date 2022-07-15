import * as React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

export default function ViewGFERequestDialog(props) {
    const [open, setOpen] = React.useState(false);
    const [request, setRequest] = React.useState(undefined);
    const [error, setError] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
        const { valid, error } = props.valid()
        if (valid) {
            setRequest(props.generateRequest());
        } else {
            setError(true);
            setRequest(error);
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
            >
                <DialogTitle>Review Generated Good Faith Estimate Request</DialogTitle>
                <DialogContent>
                    {/* {
                        error ? null : (<DialogContentText>
                            Review Generated GFE Request
                        </DialogContentText>)
                    } */}
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
                        {
                            error ? (<div style={{ color: "red" }}>
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

                            </div>) : (
                                <div>
                                    <pre>{JSON.stringify(request, undefined, 2)}</pre>
                                </div>
                            )
                        }
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog >
        </React.Fragment >
    );
}