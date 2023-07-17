import * as React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

export default function ViewErrorDialog(props) {
    const handleClose = () => {
        props.setOpen(false);
    };
    return (
        <React.Fragment>
            <Dialog
                maxWidth="lg"
                open={props.open}
                onClose={handleClose}
            >
                <DialogTitle>Error occurred</DialogTitle>
                <DialogContent>
                    <Box
                        noValidate
                        component="form"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            m: 'auto',
                            width: 'fit-content',
                        }}
                    >
                        <div style={{ color: "red" }}>
                            <span>Request Validation Errors:</span>
                            <ul>
                                {
                                    (props.error.map(error => (
                                        <li>
                                            {error}
                                        </li>
                                    )))
                                }
                            </ul>
                        </div>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog >
        </React.Fragment >
    );
}