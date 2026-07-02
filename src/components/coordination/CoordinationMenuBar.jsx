import React, { useContext, useState} from 'react';
import { createStyles, makeStyles } from "@mui/styles";
import { AppBar, Badge, IconButton, Toolbar, Typography, Box, Menu, MenuItem, ListItemIcon } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { ManageAccounts, Settings, Logout } from '@mui/icons-material';
import { AppContext } from '../../Context';
import StatusLog from '../StatusLog';


const useStyles = makeStyles((theme) =>
  createStyles({
    buttons: {
      marginLeft: "auto",
      "&:hover": {
        display: "block",
      },
    }
  })
);

export default function CoordinationMenuBar(props) {
  const classes = useStyles();

  const { loginRole, requesterDisplayName, contributorDisplayName, accountSettingsError, setRequester, setContributor, setRequesterDisplayName, setContributorDisplayName } = useContext(AppContext);
    const roleLabel = loginRole === 'requester' ? 'Requester' : 'Contributor';
    const currentUser = loginRole === 'requester' ? requesterDisplayName : contributorDisplayName;
    const chipLabel = currentUser ? `${roleLabel}: ${currentUser}` : roleLabel;
    const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
    const handleAccountMenuOpen  = (e) => setAccountMenuAnchor(e.currentTarget);
    const handleAccountMenuClose = () => setAccountMenuAnchor(null);
    const handleSignOut = () => {
        handleAccountMenuClose();
        if (loginRole === 'requester') {
            setRequester("");
            setRequesterDisplayName("");
            localStorage.removeItem("pct-selected-requester");
            localStorage.removeItem("pct-selected-requester-display");
        } else {
            setContributor("");
            setContributorDisplayName("");
            localStorage.removeItem("pct-selected-contributor");
            localStorage.removeItem("pct-selected-contributor-display");
        }
        props.onSignOut?.();
        // Open Account Settings so user can rechoose
        if (props.toggleAccountSettings) {
            props.toggleAccountSettings(true);
        }
    };
  return (
    <AppBar position="static">
      <Toolbar>
        <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
          
          
          <Typography variant="h6" component="div">
            PCT Coordination Platform
          </Typography>
          <div className={classes.buttons} style={{
              display: "flex",
              alignItems: "center",
              marginLeft: 'auto',
              gap: "6px",
          }}>
              <Box
                  onClick={currentUser ? handleAccountMenuOpen : undefined}
                  sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#fff",
                      cursor: currentUser ? "pointer" : "default",
                      padding: "0 12px",
                      height: 40,
                      borderRadius: 1,
                      transition: "background-color 0.15s ease",
                      "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.08)",
                      },
                  }}
              >
                  <PersonIcon sx={{ fontSize: 24, color: "#90caf9" }} />
                  <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                      {chipLabel}
                  </Typography>
              </Box>
              {currentUser && (<Menu
                  anchorEl={accountMenuAnchor}
                  open={Boolean(accountMenuAnchor)}
                  onClose={handleAccountMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                  <MenuItem onClick={handleSignOut}>
                      <ListItemIcon>
                          <Logout fontSize="small" />
                      </ListItemIcon>
                      Sign Out
                  </MenuItem>
              </Menu>)}
            <StatusLog logs={props.statusLogs} setLogs={props.setStatusLogs} />

            <IconButton
              size="medium"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={(e) => props.toggleAccountSettings(!props.showAccountSettings)}>
                {
                  accountSettingsError ? 
                  <Badge variant="dot" color="error"><ManageAccounts titleAccess="Account Settings" /></Badge> 
                  : <ManageAccounts titleAccess="Account Settings" />
                }
            </IconButton>
            <IconButton
              size="medium"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={(e) => props.toggleSettings(!props.showSettings)}
            >
              <Settings titleAccess="Server Settings" />
            </IconButton>
          </div>
        
        </div>
      </Toolbar>
    </AppBar>
  );
}
