import * as React from 'react';
import { AppBar, Box, Toolbar, Typography, makeStyles, createStyles, IconButton} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';

const useStyles = makeStyles((theme) =>
  createStyles({
    button: {
      marginLeft: "auto",
      "&:hover": {
        display: "block",
      }
    },
    hideSettings: {
      display: "none",
     }
  })
);

export default function MenuBar(props)  {
  const classes = useStyles(); 
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Patient Cost Transparency Client
            </Typography>
            <div className={classes.button}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={e => props.toggleSettings(!props.showSettings)}
              >
                <SettingsIcon />
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
      </Box>
    );
  }