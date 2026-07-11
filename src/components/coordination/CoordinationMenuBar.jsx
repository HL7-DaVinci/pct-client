import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createStyles, makeStyles } from "@mui/styles";
import { AppBar, Badge, IconButton, Toolbar, Typography, Box, Menu, MenuItem, ListItemIcon } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { ManageAccounts, Settings, Logout, Notifications } from '@mui/icons-material';
import { AppContext } from '../../Context';
import StatusLog from '../StatusLog';
import SubscriptionsDrawer from '../SubscriptionsDrawer';
import { getMySubscriptions } from '../../api';
import { parseNotification, getNotificationFeedUrlForServer } from '../../util/subscriptionUtils';

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
  const DEFAULT_POLLING_MS = 30000;
  const MIN_POLLING_MS = 5000;
  const MAX_POLLING_MS = 300000;
  const POLLING_STORAGE_KEY = 'pct-notification-polling-ms';
  const POLLING_CUSTOMIZED_KEY = 'pct-notification-polling-customized';
  const NOTIFICATION_FEED_URL_KEY = 'pct-notification-feed-url';

  const normalizePollingMs = (value) => {
    if (value === null || value === undefined || value === '') return DEFAULT_POLLING_MS;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_POLLING_MS;
    return Math.min(MAX_POLLING_MS, Math.max(MIN_POLLING_MS, Math.round(parsed)));
  };

  const { loginRole, coordinationServer,payerServer, requester, contributor, requesterDisplayName, contributorDisplayName, accountSettingsError, setRequester, setContributor, setRequesterDisplayName, setContributorDisplayName } = useContext(AppContext);
    const roleLabel = loginRole === 'requester' ? 'Requester' : 'Contributor';
    const currentUser = loginRole === 'requester' ? requesterDisplayName : contributorDisplayName;
    const activeActor = loginRole === 'requester' ? requester : contributor;
    const actorKey = `${loginRole || ''}|${activeActor || ''}`;
    const chipLabel = currentUser ? `${roleLabel}: ${currentUser}` : roleLabel;
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastSeen, setLastSeen] = useState(null);
    const unreadCountByActorRef = useRef({});
    const lastSeenByActorRef = useRef({});
    const activeActorKeyRef = useRef(actorKey);
    const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
    const [notificationPollingMs, setNotificationPollingMs] = useState(() => {
        const storedValue = localStorage.getItem(POLLING_STORAGE_KEY);
        const isCustomized = localStorage.getItem(POLLING_CUSTOMIZED_KEY) === 'true';
        const normalized = normalizePollingMs(storedValue);
        const isMissingOrInvalid = storedValue === null || storedValue === '' || !Number.isFinite(Number(storedValue));
        const isLegacyAutoMin = !isCustomized && Number(storedValue) === MIN_POLLING_MS;
        const initialValue = (isMissingOrInvalid || isLegacyAutoMin) ? DEFAULT_POLLING_MS : normalized;
        localStorage.setItem(POLLING_STORAGE_KEY, String(initialValue));
        return initialValue;
    });
    const [notificationFeedUrl, setNotificationFeedUrl] = useState(() => {
        const derived = getNotificationFeedUrlForServer(coordinationServer);
        localStorage.setItem(NOTIFICATION_FEED_URL_KEY, derived);
        return derived;
    });

    const handleNotificationPollingChange = useCallback((nextPollingMs) => {
        const normalized = normalizePollingMs(nextPollingMs);
        setNotificationPollingMs(normalized);
        localStorage.setItem(POLLING_STORAGE_KEY, String(normalized));
        localStorage.setItem(POLLING_CUSTOMIZED_KEY, 'true');
    }, []);

    const handleNotificationFeedUrlChange = useCallback((nextUrl) => {
        const normalized = (nextUrl || '').trim() || getNotificationFeedUrlForServer(coordinationServer);
        setNotificationFeedUrl(normalized);
        localStorage.setItem(NOTIFICATION_FEED_URL_KEY, normalized);
    }, [coordinationServer]);

    useEffect(() => {
        const derived = getNotificationFeedUrlForServer(coordinationServer);
        setNotificationFeedUrl(derived);
        localStorage.setItem(NOTIFICATION_FEED_URL_KEY, derived);
    }, [coordinationServer]);

    useEffect(() => {
        activeActorKeyRef.current = actorKey;
        setUnreadCount(unreadCountByActorRef.current[actorKey] || 0);
        setLastSeen(lastSeenByActorRef.current[actorKey] || null);
    }, [actorKey]);

    // Background fetch to compute unread badge count
    const computeUnread = useCallback(async () => {
        if (!coordinationServer) return;
        const requestActorKey = actorKey;
        try {
            //Fetches logged-in user's subscriptions from both cp, payer servers
            const [taskSubs, aeobSubs] = await Promise.all([
                getMySubscriptions(coordinationServer, loginRole, requester, contributor, 'cp'),
                loginRole === 'requester'
                    ? getMySubscriptions(payerServer, loginRole, requester, contributor, 'payer')
                    : Promise.resolve([])
            ]);
            const allSubs = [...taskSubs, ...aeobSubs];
            if (allSubs.length === 0) {
                unreadCountByActorRef.current[requestActorKey] = 0;
                if (activeActorKeyRef.current === requestActorKey) setUnreadCount(0);
                return;
            }

            //Fetches notifications from notification feed endpoint
            const res = await fetch(notificationFeedUrl);
            const data = await res.json();
            const allNotifs = data.notifications || [];
            const count = allNotifs.filter(n => {
                const parsed = parseNotification(n);
                if (!parsed) return false;
                const isMatch = allSubs.some(sub => parsed.subscriptionRef === `Subscription/${sub.id}`);
                if (!isMatch) return false;
                // If notification timestamp is older than last time user opened the bell. Already seen — skip
                if (lastSeen && new Date(n.timestamp) <= new Date(lastSeen)) return false;
                return true;
            }).length;
            unreadCountByActorRef.current[requestActorKey] = count;
            if (activeActorKeyRef.current === requestActorKey) setUnreadCount(count);
        } catch (e) {
            unreadCountByActorRef.current[requestActorKey] = 0;
            if (activeActorKeyRef.current === requestActorKey) setUnreadCount(0);
        }
    }, [loginRole, requester, contributor, actorKey, coordinationServer, payerServer, lastSeen, notificationFeedUrl]);

    useEffect(() => {
        computeUnread();
        const interval = setInterval(computeUnread, notificationPollingMs);
        return () => clearInterval(interval);
    }, [computeUnread, notificationPollingMs]);

    const handleBellClick = () => {
        setSubscriptionDialogOpen(true);
        // clear badge - user is viewing notifications. new arrivals while open will re-increment
        unreadCountByActorRef.current[actorKey] = 0;
        setUnreadCount(0);
        // Do NOT update lastSeen here; let close handle the cutoff from loaded notifications.
    };

    const handleBellClose = (seenCutoff) => {
        setSubscriptionDialogOpen(false);
        // Keep bell badge cleared while dialog is open/closing to avoid mixed signals.
        unreadCountByActorRef.current[actorKey] = 0;
        setUnreadCount(0);
        // Use the drawer's loaded notifications as the seen cutoff
        const cutoff = seenCutoff || new Date().toISOString();
        lastSeenByActorRef.current[actorKey] = cutoff;
        setLastSeen(cutoff);
    };

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
              <IconButton
                  size="medium"
                  edge="start"
                  color="inherit"
                  aria-label="notifications"
                  sx={{ mr: 2 }}
                  onClick={handleBellClick}
              >
                  <Badge badgeContent={unreadCount} color="error" max={99}>
                      <Notifications titleAccess="Notifications" />
                  </Badge>
              </IconButton>
          </div>
        
        </div>
      </Toolbar>
        <SubscriptionsDrawer
            open={subscriptionDialogOpen}
            onClose={handleBellClose}
            onUnreadCount={setUnreadCount}
            notificationPollingMs={notificationPollingMs}
            onNotificationPollingChange={handleNotificationPollingChange}
            notificationFeedUrl={notificationFeedUrl}
            onNotificationFeedUrlChange={handleNotificationFeedUrlChange}
        />
    </AppBar>
  );
}
