import * as React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

export default function ViewGFERequestDialog(props) {
    const [open, setOpen] = React.useState(false);
    const [request, setRequest] = React.useState(undefined);

    const handleClickOpen = () => {
        setOpen(true);
        if(props.valid()) {
            setRequest(props.generateRequest());
        } else {
            setRequest("Missing required fields. Fill out all the required fields, then try again");
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                Review GFE Request
            </Button>
            <Dialog
                maxWidth="lg"
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>Generated Good Faith Estimate Request</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Review Generated GFE Request
                    </DialogContentText>
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
                        <div>
                            <pre>{JSON.stringify(request, undefined, 2)}</pre>
                        </div>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}