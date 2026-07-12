import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Box, Typography, Tabs, Tab, IconButton, Button,
    TextField, Chip, CircularProgress, Tooltip, Collapse, MenuItem, Select, FormControl, InputLabel, Alert, Pagination, Snackbar
} from '@mui/material';
import { Close, Delete, DeleteSweep, Add, ExpandMore, ExpandLess, Refresh, NotificationsNone, Segment, ViewListTwoTone } from '@mui/icons-material';
import { AppContext } from '../Context';
import { getMySubscriptions, createSubscription, deleteSubscription, buildAuthHeaders } from '../api';
import {
    parseNotification,
    isMyNotification,
    getTaskEventTemplates,
    getTaskTopicOptions,
    findDuplicateSubscription,
    getNotificationFeedUrlForServer,
    KNOWN_NOTIFICATION_ENDPOINTS,
} from '../util/subscriptionUtils';

// --- Subscription Topics ---
const PCT_TASK_UPDATE_TOPIC  = 'http://hl7.org/fhir/us/davinci-pct/SubscriptionTopic/davinci-pct-gfe-coordination-task-notification';
const PCT_GFE_SUBJECT_TOPIC  = 'http://hl7.org/fhir/us/davinci-pct/SubscriptionTopic/davinci-pct-gfe-available-subject-notification';
const PCT_GFE_AUTHOR_TOPIC   = 'http://hl7.org/fhir/us/davinci-pct/SubscriptionTopic/davinci-pct-gfe-available-author-notification';
const PCT_AEOB_AUTHOR_TOPIC  = 'http://hl7.org/fhir/us/davinci-pct/SubscriptionTopic/davinci-pct-aeob-available-author-notification';
const PCT_AEOB_SUBJECT_TOPIC = 'http://hl7.org/fhir/us/davinci-pct/SubscriptionTopic/davinci-pct-aeob-available-subject-notification';


// --- App Defaults ---
const DEFAULT_PATIENT   = 'Patient/patient1001';
const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_POLLING_MS = 30000;
const MIN_POLLING_SECONDS = 5;
const MAX_POLLING_SECONDS = 300;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const TASK_CRITERIA_TOPICS = [
    { label: 'GFE Coordination Task Update', value: PCT_TASK_UPDATE_TOPIC },
    { label: 'GFE Available (Subject)',       value: PCT_GFE_SUBJECT_TOPIC },
    { label: 'GFE Available (Author)',        value: PCT_GFE_AUTHOR_TOPIC },
];
const AEOB_CRITERIA_TOPICS = [
    { label: 'AEOB Available (Author)',  value: PCT_AEOB_AUTHOR_TOPIC },
    { label: 'AEOB Available (Subject)', value: PCT_AEOB_SUBJECT_TOPIC },
];
const TASK_TOPIC_OPTIONS = [
    { label: 'GFE Coordination Task Update', topicUrl: PCT_TASK_UPDATE_TOPIC },
    { label: 'GFE Available (Subject)',       topicUrl: PCT_GFE_SUBJECT_TOPIC },
    { label: 'GFE Available (Author)',        topicUrl: PCT_GFE_AUTHOR_TOPIC },
];
const isLocalServer = (url) => url?.includes('localhost') || url?.includes('127.0.0.1');

const isKnownNotificationFeedHost = (url, knownUrl) => {
    try {
        return new URL(url).toString() === new URL(knownUrl).toString();
    } catch {
        return false;
    }
};

const AEOB_TOPIC_OPTIONS = [
    {
        label: 'AEOB available (by author)',
        topicUrl: PCT_AEOB_AUTHOR_TOPIC,
        getCriteria: (req) => `DocumentReference?author=${req}`,
    },
    {
        label: 'AEOB available (by subject/patient)',
        topicUrl: PCT_AEOB_SUBJECT_TOPIC,
        getCriteria: (req) => req
            ? `DocumentReference?subject=${DEFAULT_PATIENT}&author=${req}`
            : `DocumentReference?subject=${DEFAULT_PATIENT}`,
    },
];

// ─── Toast / Snackbar hook ───────────────────────────────────────────────────
function useToast() {
    const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
    const show = useCallback((message, severity = 'info') =>
        setToast({ open: true, message, severity }), []);
    const hide = useCallback(() => setToast(t => ({ ...t, open: false })), []);
    return { toast, show, hide };
}

function Toast({ toast, onClose }) {
    return (
        <Snackbar
            open={toast.open}
            autoHideDuration={4000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert onClose={onClose} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
                {toast.message}
            </Alert>
        </Snackbar>
    );
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmColor = 'primary' }) {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontSize: '1rem', fontWeight: 500 }}>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button size="small" onClick={onCancel}>Cancel</Button>
                <Button size="small" variant="contained" color={confirmColor} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── useConfirm hook ─────────────────────────────────────────────────────────
function useConfirm() {
    const [state, setState] = useState({ open: false, title: '', message: '', resolve: null, confirmLabel: 'Confirm', confirmColor: 'primary' });

    const confirm = useCallback((title, message, confirmLabel = 'Confirm', confirmColor = 'primary') =>
            new Promise(resolve => setState({ open: true, title, message, resolve, confirmLabel, confirmColor }))
        , []);

    const handleConfirm = () => {
        state.resolve(true);
        setState(s => ({ ...s, open: false }));
    };
    const handleCancel = () => {
        state.resolve(false);
        setState(s => ({ ...s, open: false }));
    };

    const ConfirmDialogNode = (
        <ConfirmDialog
            open={state.open}
            title={state.title}
            message={state.message}
            confirmLabel={state.confirmLabel}
            confirmColor={state.confirmColor}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { confirm, ConfirmDialogNode };
}

// ─── StatusChip ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
    const colorMap = {
        active: 'success', error: 'error', off: 'default',
        requested: 'info', 'in-progress': 'warning', accepted: 'success', completed: 'default',
    };
    return (
        <Chip label={status || 'unknown'} size="small" color={colorMap[status] || 'default'}
              sx={{ fontSize: '0.7rem', height: 20 }} />
    );
};

// ─── SubscriptionCard ─────────────────────────────────────────────────────────
function SubscriptionCard({ sub, onDelete, serverUrl, readOnly, notifCount = 0 }) {
    const [expanded, setExpanded] = useState(false);
    const filterCriteria = sub._criteria?.extension?.[0]?.valueString || sub.criteria || '—';
    const endpoint    = sub.channel?.endpoint || '';
    const channelType = sub.channel?.type || 'unknown';
    const isLocal     = isLocalServer(serverUrl);

    return (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* ID row with copy button and notification count */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            {sub.id ? `Subscription/${sub.id}` : 'No ID'}
                        </Typography>
                        {notifCount > 0 && (
                            <Chip
                                label={`${notifCount} notif${notifCount !== 1 ? 's' : ''}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontSize: '0.6rem', height: 16, ml: 0.5 }}
                            />
                        )}
                    </Box>
                    {/* Criteria row with copy button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {filterCriteria}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                    <Chip label={channelType} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                    <StatusChip status={sub.status} />
                    <IconButton size="small" onClick={() => setExpanded(e => !e)}>
                        {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                    {!readOnly && onDelete && (
                        <Tooltip title="Delete subscription">
                            <IconButton size="small" color="error" onClick={() => onDelete(sub.id, sub, filterCriteria, endpoint, isLocal, serverUrl)}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>
            <Collapse in={expanded}>
                <Box sx={{ px: 1.5, py: 1, backgroundColor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">Endpoint</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', wordBreak: 'break-all' }}>
                            {endpoint || '—'}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>Channel type</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{channelType}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>Filter criteria</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', wordBreak: 'break-all' }}>
                            {filterCriteria || '—'}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>Topic</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', wordBreak: 'break-all' }}>
                            {sub.criteria || '—'}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>Reason</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{sub.reason || '—'}</Typography>
                </Box>
            </Collapse>
        </Box>
    );
}

// ─── NewTaskSubscriptionForm ──────────────────────────────────────────────────
function NewTaskSubscriptionForm({ loginRole, requester, contributor, coordinationServer, onSave, onCancel, existingSubscriptions = [] }) {
    const templates       = getTaskEventTemplates(loginRole, requester, contributor);
    const taskTopicOptions = getTaskTopicOptions(loginRole, TASK_TOPIC_OPTIONS, PCT_TASK_UPDATE_TOPIC);
    const [selectedTopic, setSelectedTopic]     = useState(taskTopicOptions[0].label);
    const [selectedTemplate, setSelectedTemplate] = useState(templates[0].label);
    const [criteria, setCriteria]               = useState(templates[0].criteria);
    const [endpoint, setEndpoint]               = useState(() => getNotificationFeedUrlForServer(coordinationServer));
    const [useCustomEndpoint, setUseCustomEndpoint] = useState(false);
    const [reason, setReason]   = useState('');
    const [saving, setSaving]   = useState(false);
    const [error, setError]     = useState(null);

    const selectedTaskTopicUrl = taskTopicOptions.find(o => o.label === selectedTopic)?.topicUrl || PCT_TASK_UPDATE_TOPIC;
    const isTaskUpdateTopic    = selectedTaskTopicUrl === PCT_TASK_UPDATE_TOPIC;
    const defaultAuthorRef     = requester || contributor || '<author-reference>';

    const getRequiredTaskActor = () => {
        if (loginRole === 'requester' && requester) return { key: 'requester', value: requester };
        if (loginRole === 'contributor' && contributor) return { key: 'owner', value: contributor };
        return null;
    };

    const getCriteriaForTopic = (topicUrl) => {
        if (topicUrl === PCT_TASK_UPDATE_TOPIC) {
            const tpl = templates.find(t => t.label === selectedTemplate) || templates[0];
            return tpl?.label !== 'Custom' ? tpl?.criteria || '' : '';
        }
        if (topicUrl === PCT_GFE_SUBJECT_TOPIC) {
            const a = requester || contributor || '';
            return a
                ? `DocumentReference?subject=${DEFAULT_PATIENT}&author=${a}`
                : `DocumentReference?subject=${DEFAULT_PATIENT}`;
        }
        if (topicUrl === PCT_GFE_AUTHOR_TOPIC) {
            const a = requester || contributor || '';
            return a ? `DocumentReference?author=${a}` : 'DocumentReference?author=';
        }
        return '';
    };

    const handleTopicChange = (e) => {
        const label    = e.target.value;
        const topicUrl = taskTopicOptions.find(o => o.label === label)?.topicUrl || PCT_TASK_UPDATE_TOPIC;
        setSelectedTopic(label);
        setCriteria(getCriteriaForTopic(topicUrl));
        if (topicUrl !== PCT_TASK_UPDATE_TOPIC) setSelectedTemplate('Custom');
    };

    const handleTemplateChange = (e) => {
        const label = e.target.value;
        setSelectedTemplate(label);
        const tpl = templates.find(t => t.label === label);
        if (tpl?.label !== 'Custom') {
            setCriteria(tpl?.criteria || '');
            return;
        }
        const actor = getRequiredTaskActor();
        setCriteria(actor ? `Task?${actor.key}=${actor.value}` : '');
    };

    const handleSave = async () => {
        if (!criteria.trim()) { setError('Filter criteria is required.'); return; }
        if (!endpoint.trim()) { setError('Endpoint is required.'); return; }
        if (isTaskUpdateTopic) {
            const actor = getRequiredTaskActor();
            if (actor) {
                const [resource = '', query = ''] = criteria.split('?');
                if (resource.toLowerCase() !== 'task') {
                    setError('Task topic criteria must start with Task?.');
                    return;
                }
                const params = new URLSearchParams(query);
                const values = params.getAll(actor.key);
                if (!values.includes(actor.value)) {
                    setError(`Task criteria must include ${actor.key}=${actor.value} for your role.`);
                    return;
                }
            }
        }
        const dup = findDuplicateSubscription(existingSubscriptions, selectedTaskTopicUrl, criteria, endpoint);
        if (dup) { setError(`Duplicate subscription already exists (Subscription/${dup.id}).`); return; }
        setSaving(true); setError(null);
        const result = await createSubscription(
            coordinationServer,
            { filterCriteria: criteria, notificationEndpoint: endpoint, channelType: 'rest-hook', reason, topicUrl: selectedTaskTopicUrl },
            'cp'
        );
        setSaving(false);
        if (result.success) await onSave(result.resource);
        else setError(`Failed to create subscription (${result.status || 'unknown error'})`);
    };

    useEffect(() => {
        if (!useCustomEndpoint) setEndpoint(getNotificationFeedUrlForServer(coordinationServer));
    }, [coordinationServer, useCustomEndpoint]);

    return (
        <Box sx={{ border: '1px solid', borderColor: 'primary.light', borderRadius: 1, p: 1.5, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 500 }}>New task subscription</Typography>
            {error && <Alert severity="error" sx={{ mb: 1, py: 0 }}>{error}</Alert>}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Topic</InputLabel>
                <Select value={selectedTopic} label="Topic" onChange={handleTopicChange}>
                    {taskTopicOptions.map(o => <MenuItem key={o.label} value={o.label}>{o.label}</MenuItem>)}
                </Select>
            </FormControl>
            {isTaskUpdateTopic && (
                <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel>Event</InputLabel>
                    <Select value={selectedTemplate} label="Event" onChange={handleTemplateChange}>
                        {templates.map(t => <MenuItem key={t.label} value={t.label}>{t.label}</MenuItem>)}
                    </Select>
                </FormControl>
            )}
            <TextField fullWidth size="small" label="Filter criteria" value={criteria}
                       onChange={e => setCriteria(e.target.value)}
                       InputProps={{
                           readOnly: isTaskUpdateTopic
                               ? selectedTemplate !== 'Custom'
                               : true   // GFE/DocRef topics — always read-only, auto-filled by topic
                       }}
                       sx={{
                           mb: 1.5,
                           ...((isTaskUpdateTopic ? selectedTemplate !== 'Custom' : true) && {
                               '& .MuiInputBase-root': { backgroundColor: 'grey.100' }
                           })
                       }}
                       placeholder={isTaskUpdateTopic
                           ? `Task?${loginRole === 'requester' ? 'requester' : 'owner'}=...`
                           : selectedTaskTopicUrl === PCT_GFE_SUBJECT_TOPIC
                                ? `DocumentReference?subject=${DEFAULT_PATIENT}&author=${defaultAuthorRef}`
                               : `DocumentReference?author=${defaultAuthorRef}`}
                       // helperText removed — previously showed read-only/editable hint for task criteria
                       />
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Notification endpoint</InputLabel>
                <Select value={useCustomEndpoint ? 'custom' : endpoint} label="Notification endpoint"
                        onChange={e => {
                            if (e.target.value === 'custom') { setUseCustomEndpoint(true); setEndpoint(''); }
                            else { setUseCustomEndpoint(false); setEndpoint(e.target.value); }
                        }}>
                    {KNOWN_NOTIFICATION_ENDPOINTS.map(ep => <MenuItem key={ep} value={ep}>{ep}</MenuItem>)}
                    <MenuItem value="custom">Custom...</MenuItem>
                </Select>
            </FormControl>
            {useCustomEndpoint && (
                <TextField fullWidth size="small" label="Custom endpoint" value={endpoint}
                           onChange={e => setEndpoint(e.target.value)}
                           placeholder="https://your-endpoint/notification/subscription-hook" sx={{ mb: 1.5 }} />
            )}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Channel type</InputLabel>
                <Select value="rest-hook" label="Channel type" disabled>
                    <MenuItem value="rest-hook">REST Hook</MenuItem>
                </Select>
            </FormControl>
            <TextField fullWidth size="small" label="Reason (optional)" value={reason}
                       onChange={e => setReason(e.target.value)} sx={{ mb: 1.5 }} />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button size="small" onClick={onCancel} disabled={saving}>Cancel</Button>
                <Button size="small" variant="contained" onClick={handleSave} disabled={saving}>
                    {saving && <CircularProgress size={14} sx={{ mr: 1 }} />}Save
                </Button>
            </Box>
        </Box>
    );
}

// ─── NewAeobSubscriptionForm ──────────────────────────────────────────────────
function NewAeobSubscriptionForm({ requester, payerServer, onSave, onCancel, existingSubscriptions = [] }) {
    const [selectedTopic, setSelectedTopic] = useState(AEOB_TOPIC_OPTIONS[0].label);
    const [criteria, setCriteria]           = useState(AEOB_TOPIC_OPTIONS[0].getCriteria(requester));
    const [endpoint, setEndpoint]           = useState(() => getNotificationFeedUrlForServer(payerServer));
    const [useCustomEndpoint, setUseCustomEndpoint] = useState(false);
    const [reason, setReason]   = useState('');
    const [saving, setSaving]   = useState(false);
    const [error, setError]     = useState(null);
    const selectedAeobTopicUrl  = AEOB_TOPIC_OPTIONS.find(o => o.label === selectedTopic)?.topicUrl || PCT_AEOB_AUTHOR_TOPIC;

    const handleTopicChange = (e) => {
        const label = e.target.value;
        setSelectedTopic(label);
        const opt = AEOB_TOPIC_OPTIONS.find(o => o.label === label);
        if (opt) setCriteria(opt.getCriteria(requester));
    };

    const handleSave = async () => {
        if (!criteria.trim()) { setError('Filter criteria is required.'); return; }
        if (!endpoint.trim()) { setError('Endpoint is required.'); return; }
        const topicUrl = AEOB_TOPIC_OPTIONS.find(o => o.label === selectedTopic)?.topicUrl || PCT_AEOB_AUTHOR_TOPIC;
        const dup = findDuplicateSubscription(existingSubscriptions, topicUrl, criteria, endpoint);
        if (dup) { setError(`Duplicate subscription already exists (Subscription/${dup.id}).`); return; }
        setSaving(true); setError(null);
        const result = await createSubscription(
            payerServer,
            { filterCriteria: criteria, notificationEndpoint: endpoint, channelType: 'rest-hook', reason, topicUrl },
            'payer'
        );
        setSaving(false);
        if (result.success) await onSave(result.resource);
        else setError(`Failed to create subscription (${result.status || 'unknown error'})`);
    };

    useEffect(() => {
        if (!useCustomEndpoint) setEndpoint(getNotificationFeedUrlForServer(payerServer));
    }, [payerServer, useCustomEndpoint]);

    return (
        <Box sx={{ border: '1px solid', borderColor: 'primary.light', borderRadius: 1, p: 1.5, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 500 }}>New AEOB subscription</Typography>
            {error && <Alert severity="error" sx={{ mb: 1, py: 0 }}>{error}</Alert>}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Topic</InputLabel>
                <Select value={selectedTopic} label="Topic" onChange={handleTopicChange}>
                    {AEOB_TOPIC_OPTIONS.map(o => <MenuItem key={o.label} value={o.label}>{o.label}</MenuItem>)}
                </Select>
            </FormControl>
            <TextField fullWidth size="small" label="Filter criteria" value={criteria}
                       onChange={e => setCriteria(e.target.value)}
                       InputProps={{ readOnly: true }}
                       sx={{ mb: 1.5, '& .MuiInputBase-root': { backgroundColor: 'grey.100' } }}
                       placeholder={selectedAeobTopicUrl === PCT_AEOB_SUBJECT_TOPIC
                           ? `DocumentReference?subject=${DEFAULT_PATIENT}&author=${requester || '<requester-reference>'}`
                           : `DocumentReference?author=${requester || '<requester-reference>'}`}
                       helperText="Auto-filled based on topic and your login. Read-only." />
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Notification endpoint</InputLabel>
                <Select value={useCustomEndpoint ? 'custom' : endpoint} label="Notification endpoint"
                        onChange={e => {
                            if (e.target.value === 'custom') { setUseCustomEndpoint(true); setEndpoint(''); }
                            else { setUseCustomEndpoint(false); setEndpoint(e.target.value); }
                        }}>
                    {KNOWN_NOTIFICATION_ENDPOINTS.map(ep => <MenuItem key={ep} value={ep}>{ep}</MenuItem>)}
                    <MenuItem value="custom">Custom...</MenuItem>
                </Select>
            </FormControl>
            {useCustomEndpoint && (
                <TextField fullWidth size="small" label="Custom endpoint" value={endpoint}
                           onChange={e => setEndpoint(e.target.value)}
                           placeholder="https://your-endpoint/notification/subscription-hook" sx={{ mb: 1.5 }} />
            )}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Channel type</InputLabel>
                <Select value="rest-hook" label="Channel type" disabled>
                    <MenuItem value="rest-hook">REST Hook</MenuItem>
                </Select>
            </FormControl>
            <TextField fullWidth size="small" label="Reason (optional)" value={reason}
                       onChange={e => setReason(e.target.value)} sx={{ mb: 1.5 }} />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button size="small" onClick={onCancel} disabled={saving}>Cancel</Button>
                <Button size="small" variant="contained" onClick={handleSave} disabled={saving}>
                    {saving && <CircularProgress size={14} sx={{ mr: 1 }} />}Save
                </Button>
            </Box>
        </Box>
    );
}

// ─── NotificationCard ─────────────────────────────────────────────────────────
function NotificationCard({ notification, isNew = false, showSubRef = true, allSubscriptions = [] }) {
    const parsed = parseNotification(notification);
    if (!parsed) return null;
    const subId = parsed.subscriptionRef?.split('/')?.[1];
    const sub = allSubscriptions.find(s => s.id === subId);
    const topic = (sub?.criteria || '').toLowerCase();
    const notificationType = topic.includes('aeob')
        ? 'AEOB'
        : (topic.includes('gfe') && parsed.docRefId)
            ? 'GFE'
            : 'Task';
    const typeColor = notificationType === 'AEOB' ? 'secondary' : notificationType === 'GFE' ? 'info' : 'primary';
    const focusLabel = notificationType === 'Task' ? parsed.taskId : parsed.docRefId;
    return (
        <Box sx={{
            border: '1px solid',
            borderColor: isNew ? 'primary.main' : 'divider',
            borderLeft: '3px solid',
            borderLeftColor: isNew ? 'primary.main' : 'grey.400',
            borderRadius: 1, px: 1.5, py: 1, mb: 1,
            backgroundColor: isNew ? 'primary.50' : 'background.paper'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        {isNew && (
                            <Chip label="New" size="small" color="primary"
                                  sx={{ fontSize: '0.6rem', height: 16, fontWeight: 700 }} />
                        )}
                        <Chip label={notificationType} size="small"
                              color={typeColor} variant="outlined"
                              sx={{ fontSize: '0.65rem', height: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                            {parsed.timestamp ? new Date(parsed.timestamp).toLocaleString() : '—'}
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.25 }}>
                        {parsed.focusRef || focusLabel || '—'}
                    </Typography>
                </Box>
                {/* Right column — status chip + subscription ref */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    {(parsed.taskStatus || parsed.docRefType) && (
                        <StatusChip status={parsed.taskStatus || parsed.docRefType} />
                    )}
                    {showSubRef && parsed.subscriptionRef && (
                        <Typography variant="caption" color="text.disabled"
                                    sx={{ fontSize: '0.6rem', textAlign: 'right' }}>
                            {parsed.subscriptionRef}
                        </Typography>
                    )}
                </Box>
            </Box>
            <Box sx={{ mt: 0.75, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {parsed.taskRequester && (
                    <Box>
                        <Typography variant="caption" color="text.secondary">Requester</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{parsed.taskRequester}</Typography>
                    </Box>
                )}
                {parsed.taskOwner && (
                    <Box>
                        <Typography variant="caption" color="text.secondary">Owner</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{parsed.taskOwner}</Typography>
                    </Box>
                )}
                {parsed.docRefAuthor && (
                    <Box>
                        <Typography variant="caption" color="text.secondary">Author</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{parsed.docRefAuthor}</Typography>
                    </Box>
                )}
                {parsed.docRefSubject && (
                    <Box>
                        <Typography variant="caption" color="text.secondary">Subject</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{parsed.docRefSubject}</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

// ─── GroupedNotifications ─────────────────────────────────────────────────────
// Groups notifications by subscription ID and renders them under each subscription heading.
function GroupedNotifications({ notifications, allSubscriptions, lastOpenedAt  }) {
    const [expandedSubs, setExpandedSubs] = useState({});

    // Build a map: subscriptionRef → [notifications]
    const groups = notifications.reduce((acc, n) => {
        const parsed = parseNotification(n);
        const key = parsed?.subscriptionRef || 'unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(n);
        return acc;
    }, {});

    const toggleSub = (key) => setExpandedSubs(prev => ({ ...prev, [key]: !prev[key] }));

    // Find subscription label from allSubscriptions
    const getSubLabel = (subRef) => {
        const id  = subRef?.split('/')?.[1];
        const sub = allSubscriptions.find(s => s.id === id);
        if (!sub) return subRef || 'Unknown subscription';
        const criteria = sub._criteria?.extension?.[0]?.valueString || sub.criteria || '';
        return criteria || subRef;
    };

    return (
        <Box>
            {Object.entries(groups).map(([subRef, notifs]) => {
                const isExpanded = expandedSubs[subRef] !== false; // default expanded
                return (
                    <Box key={subRef} sx={{ mb: 2 }}>
                        {/* Subscription group header */}
                        <Box
                            onClick={() => toggleSub(subRef)}
                            sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                px: 1.5, py: 0.75, mb: 0.5,
                                backgroundColor: 'grey.100', borderRadius: 1,
                                cursor: 'pointer', userSelect: 'none',
                                '&:hover': { backgroundColor: 'grey.200' }
                            }}
                        >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {subRef}
                                </Typography>
                                <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>
                                    {getSubLabel(subRef)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                    label={`${notifs.length} notification${notifs.length !== 1 ? 's' : ''}`}
                                    size="small" color="primary" variant="outlined"
                                    sx={{ fontSize: '0.65rem', height: 18 }}
                                />
                                {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                            </Box>
                        </Box>
                        {/* Grouped Notifications under this subscription */}
                        <Collapse in={isExpanded}>
                            <Box sx={{ pl: 1 }}>
                                {notifs.map((n, i) => (
                                    <NotificationCard
                                        key={`${n.timestamp || 'notif'}-${i}`}
                                        notification={n}
                                        isNew={lastOpenedAt && n.timestamp > lastOpenedAt}
                                        showSubRef={false}
                                        allSubscriptions={allSubscriptions}
                                    />
                                ))}
                            </Box>
                        </Collapse>
                    </Box>
                );
            })}
        </Box>
    );
}

// ─── SubscriptionsTabContent ──────────────────────────────────────────────────
function SubscriptionsTabContent({
                                     subscriptions, loading, error, showNewForm, setShowNewForm,
                                     onDelete, onDeleteAll, deleteAllLoading,
                                     onAdminDeleteAll, adminDeleteAllLoading,
                                     newForm, currentUser, loginRole, serverUrl,
                                     allServerSubscriptions, allServerSubsLoading, onAdminFetch,
                                     criteriaTopics, serverLabel = 'Server', lastRefreshed,
                                     notifCountById = {},
                                 }) {
    const { confirm, ConfirmDialogNode } = useConfirm();
    const [adminEndpoint, setAdminEndpoint]     = useState('');
    const [useCustomEndpoint, setUseCustomEndpoint] = useState(false);
    const [adminCriteria, setAdminCriteria]     = useState('');
    const [adminFetchedSubs, setAdminFetchedSubs] = useState(null);
    const [adminFetching, setAdminFetching]     = useState(false);
    const [showAdminDelete, setShowAdminDelete] = useState(false);
    const [subsPage, setSubsPage]               = useState(1);

    const displaySubscriptions  = adminFetchedSubs ?? allServerSubscriptions;
    const currentSubscriptions  = currentUser ? subscriptions : (displaySubscriptions || []);
    const lastRefreshLabel      = lastRefreshed ? new Date(lastRefreshed).toLocaleString() : 'Never';
    const totalSubsPages        = Math.ceil(currentSubscriptions.length / DEFAULT_PAGE_SIZE);
    const paginatedSubscriptions = currentSubscriptions.slice(
        (subsPage - 1) * DEFAULT_PAGE_SIZE, subsPage * DEFAULT_PAGE_SIZE
    );
    const endpointOptions = Array.from(new Set(
        [...KNOWN_NOTIFICATION_ENDPOINTS, ...(allServerSubscriptions || []).map(s => s.channel?.endpoint)]
            .map(ep => ep?.trim()).filter(Boolean)
    ));

    useEffect(() => { setSubsPage(1); }, [currentUser, subscriptions, adminFetchedSubs, allServerSubscriptions]);
    useEffect(() => {
        if (!currentUser && serverUrl && !isLocalServer(serverUrl)) setShowAdminDelete(true);
    }, [currentUser, serverUrl]);

    // Wrapped delete that shows ConfirmDialog instead of window.confirm
    const handleDeleteWithConfirm = async (id, sub, filterCriteria, endpoint, isLocal, sUrl) => {
        const warning = !isLocal ? `⚠️ External server: ${sUrl}\n\n` : '';
        const ok = await confirm(
            `⚠️ Delete Subscription/${id} ?`,
            `${warning}Server\n${sUrl}\n\nEndpoint\n${endpoint || '—'}\n\nFilter criteria\n${filterCriteria || '—'}\n\nThis action cannot be undone.`,
            'Delete', 'error'
        );
        if (ok) onDelete(id);
    };

    const handleAdminFetch = async () => {
        if (!adminEndpoint.trim() && !adminCriteria.trim()) return;
        setAdminFetching(true);
        try {
            const result = await onAdminFetch(adminEndpoint, adminCriteria);
            setAdminFetchedSubs(result);
        } finally { setAdminFetching(false); }
    };

    const handleAdminDelete = async () => {
        if (!adminFetchedSubs?.length) return;
        const prev = adminFetchedSubs;
        setAdminFetchedSubs([]);
        const deleted = await onAdminDeleteAll(adminEndpoint, prev, adminCriteria);
        if (!deleted) setAdminFetchedSubs(prev);
    };

    const handleAdminSingleDelete = async (id, sub, filterCriteria, endpoint, isLocal, sUrl) => {
        const prev = adminFetchedSubs;
        const warning = !isLocal ? `⚠️ External server\n${sUrl}\n\n` : '';
        const ok = await confirm(
            `⚠️ Delete Subscription/${id} ?`,
            `${warning}Server\n${sUrl}\n\nEndpoint\n${endpoint || '—'}\n\nFilter criteria\n${filterCriteria || '—'}\n\nThis action cannot be undone.`,
            'Delete', 'error'
        );
        if (!ok) return;
        setAdminFetchedSubs(p => p?.filter(s => s.id !== id) ?? p);
        const deleted = await onDelete(id);
        if (deleted === false) setAdminFetchedSubs(prev);
    };

    const renderSubCard = (sub, isAdmin = false) => (
        <SubscriptionCard
            key={sub.id}
            sub={sub}
            onDelete={isAdmin ? handleAdminSingleDelete : handleDeleteWithConfirm}
            serverUrl={serverUrl}
            notifCount={notifCountById[sub.id] || 0}
        />
    );

    // Management view (no user logged in)
    if (!currentUser) {
        return (
            <Box sx={{ pt: 2 }}>
                {ConfirmDialogNode}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    No {loginRole} selected.{' '}
                    {isLocalServer(serverUrl)
                        ? <><strong>{serverLabel} server</strong> ({serverUrl}) — Showing all subscriptions.</>
                        : <>External <strong>{serverLabel} server</strong> ({serverUrl}). Use filters below to fetch.</>}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    Last refreshed: {lastRefreshLabel}
                </Typography>

                {!showAdminDelete && (
                    <Button size="small" variant="outlined" color="warning"
                            onClick={() => setShowAdminDelete(true)} sx={{ mb: 2 }}>
                        ⚠️ Admin: Filter subscriptions by endpoint or criteria
                    </Button>
                )}

                {showAdminDelete && (
                    <Box sx={{ border: '1px solid orange', borderRadius: 1, p: 1.5, mb: 2, backgroundColor: '#fff8e1' }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'warning.dark' }}>
                            ⚠️ Admin: Filter / Delete subscriptions
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Filter by endpoint, topic criteria, or both. At least one required.
                        </Typography>
                        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                            <InputLabel>Notification endpoint</InputLabel>
                            <Select value={useCustomEndpoint ? 'custom' : adminEndpoint} label="Notification endpoint"
                                    onChange={e => {
                                        const v = e.target.value;
                                        if (v === 'custom') { setUseCustomEndpoint(true); setAdminEndpoint(''); setAdminFetchedSubs(null); }
                                        else { setUseCustomEndpoint(false); setAdminEndpoint(v); setAdminFetchedSubs(null); }
                                    }}>
                                <MenuItem value="">(Any)</MenuItem>
                                {endpointOptions.map(ep => <MenuItem key={ep} value={ep}>{ep}</MenuItem>)}
                                <MenuItem value="custom">Custom...</MenuItem>
                            </Select>
                        </FormControl>
                        {useCustomEndpoint && (
                            <TextField fullWidth size="small" label="Custom endpoint" value={adminEndpoint}
                                       onChange={e => { setAdminEndpoint(e.target.value); setAdminFetchedSubs(null); }}
                                       placeholder="https://..." sx={{ mb: 1 }} />
                        )}
                        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                            <InputLabel>Topic criteria</InputLabel>
                            <Select value={adminCriteria} label="Topic criteria"
                                    onChange={e => { setAdminCriteria(e.target.value); setAdminFetchedSubs(null); }}>
                                <MenuItem value="">(Any)</MenuItem>
                                {criteriaTopics.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                        {adminFetchedSubs !== null && (
                            <Alert severity={adminFetchedSubs.length === 0 ? 'info' : 'warning'} sx={{ py: 0, mb: 1 }}>
                                {adminFetchedSubs.length === 0
                                    ? 'No subscriptions found matching filters.'
                                    : `Found ${adminFetchedSubs.length} subscription(s).`}
                            </Alert>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button size="small" onClick={() => {
                                setAdminEndpoint(''); setUseCustomEndpoint(false);
                                setAdminFetchedSubs(null); setAdminCriteria(''); setShowAdminDelete(false);
                            }}>Cancel</Button>
                            <Button size="small" variant="outlined" color="warning"
                                    disabled={(!adminEndpoint.trim() && !adminCriteria.trim()) || adminFetching}
                                    onClick={handleAdminFetch}>
                                {adminFetching ? <CircularProgress size={14} sx={{ mr: 1 }} /> : null}Fetch
                            </Button>
                            {adminFetchedSubs?.length > 0 && (
                                <Button size="small" variant="contained" color="error"
                                        disabled={adminDeleteAllLoading} onClick={handleAdminDelete}>
                                    {adminDeleteAllLoading ? <CircularProgress size={14} sx={{ mr: 1 }} /> : null}
                                    Delete {adminFetchedSubs.length}
                                </Button>
                            )}
                        </Box>
                    </Box>
                )}

                {allServerSubsLoading || adminFetching ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
                ) : currentSubscriptions.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        <NotificationsNone sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
                        <Typography variant="body2">
                            {adminFetchedSubs !== null ? 'No subscriptions match these filters.'
                                : isLocalServer(serverUrl) ? 'No subscriptions on this server.'
                                    : 'Use filters above and click Fetch.'}
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            {currentSubscriptions.length} subscription{currentSubscriptions.length !== 1 ? 's' : ''}
                            {adminFetchedSubs !== null ? ' matching filters' : ' on server'}
                        </Typography>
                        {paginatedSubscriptions.map(sub => renderSubCard(sub, true))}
                        {totalSubsPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                                <Pagination size="small" color="primary" count={totalSubsPages}
                                            page={subsPage} onChange={(_, p) => setSubsPage(p)} />
                            </Box>
                        )}
                    </>
                )}
            </Box>
        );
    }

    // User view (logged in)
    return (
        <Box sx={{ pt: 2 }}>
            {ConfirmDialogNode}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Last refreshed: {lastRefreshLabel}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {subscriptions.length > 0 && (
                        <Tooltip title="Delete my subscriptions">
                            <IconButton size="small" color="error" onClick={onDeleteAll} disabled={deleteAllLoading}>
                                {deleteAllLoading ? <CircularProgress size={14} /> : <DeleteSweep fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    )}
                    <Button size="small" variant="outlined" startIcon={<Add />}
                            onClick={() => setShowNewForm(f => !f)} sx={{ fontSize: '0.75rem' }}>
                        New
                    </Button>
                </Box>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
            {showNewForm && newForm}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
            ) : subscriptions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    <NotificationsNone sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
                    <Typography variant="body2">No subscriptions found.</Typography>
                    <Typography variant="caption">Create one to receive notifications.</Typography>
                </Box>
            ) : (
                <>
                    {paginatedSubscriptions.map(sub => renderSubCard(sub, false))}
                    {totalSubsPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                            <Pagination size="small" color="primary" count={totalSubsPages}
                                        page={subsPage} onChange={(_, p) => setSubsPage(p)} />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}

function TabPanel({ children, value, index }) {
    return value === index ? <>{children}</> : null;
}

// ─── Main SubscriptionsDrawer ──────────────────────────────────────────────────
export default function SubscriptionsDrawer({
    open,
    onClose,
    onUnreadCount,
    notificationPollingMs = DEFAULT_POLLING_MS,
    onNotificationPollingChange,
    notificationFeedUrl = '',
    onNotificationFeedUrlChange,
}) {
    const { loginRole, requester, contributor, coordinationServer, payerServer } = useContext(AppContext);
    const defaultNotificationFeedUrl = getNotificationFeedUrlForServer(coordinationServer);
    const [tab, setTab] = useState(0);
    const { toast, show: showToast, hide: hideToast } = useToast();
    const { confirm, ConfirmDialogNode } = useConfirm();

    // Task subscription state
    const [taskSubscriptions, setTaskSubscriptions]       = useState([]);
    const [taskLoading, setTaskLoading]                   = useState(false);
    const [taskError, setTaskError]                       = useState(null);
    const [showNewTaskForm, setShowNewTaskForm]           = useState(false);
    const [deleteAllTaskLoading, setDeleteAllTaskLoading] = useState(false);
    const [adminDeleteAllTaskLoading, setAdminDeleteAllTaskLoading] = useState(false);

    // AEOB subscription state
    const [aeobSubscriptions, setAeobSubscriptions]       = useState([]);
    const [aeobLoading, setAeobLoading]                   = useState(false);
    const [aeobError, setAeobError]                       = useState(null);
    const [showNewAeobForm, setShowNewAeobForm]           = useState(false);
    const [deleteAllAeobLoading, setDeleteAllAeobLoading] = useState(false);
    const [adminDeleteAllAeobLoading, setAdminDeleteAllAeobLoading] = useState(false);

    // Notification state
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading]   = useState(false);
    const [notifPage, setNotifPage]         = useState(1);
    const [notifLastRefreshed, setNotifLastRefreshed] = useState(null);

    // Management view state
    const [allTaskSubs, setAllTaskSubs]             = useState([]);
    const [allTaskSubsLoading, setAllTaskSubsLoading] = useState(false);
    const [allAeobSubs, setAllAeobSubs]             = useState([]);
    const [allAeobSubsLoading, setAllAeobSubsLoading] = useState(false);
    const [taskLastRefreshed, setTaskLastRefreshed] = useState(null);
    const [aeobLastRefreshed, setAeobLastRefreshed] = useState(null);
    const [aeobLoaded, setAeobLoaded]               = useState(false);
    const [allAeobLoaded, setAllAeobLoaded]         = useState(false);
    const [pollingSecondsDraft, setPollingSecondsDraft] = useState(String(Math.round((notificationPollingMs || DEFAULT_POLLING_MS) / 1000)));
    const [notificationFeedUrlDraft, setNotificationFeedUrlDraft] = useState(notificationFeedUrl || defaultNotificationFeedUrl);
    const [clearFeedLoading, setClearFeedLoading] = useState(false);
    const [groupBySubscription, setGroupBySubscription] = useState(false);
    const currentUser = loginRole === 'requester' ? requester : contributor;
    const actorKey = currentUser ? `${loginRole}|${currentUser}` : 'admin';
    const clearTargetUrl = (notificationFeedUrlDraft || '').trim() || defaultNotificationFeedUrl;
    const isTrustedClearTarget = isKnownNotificationFeedHost(clearTargetUrl, defaultNotificationFeedUrl);
    const canClearFeed = !currentUser
        && Boolean(clearTargetUrl)
        && isTrustedClearTarget;

    // Notification count per subscription ID
    const allSubscriptions = [...taskSubscriptions, ...aeobSubscriptions];
    const myNotifications  = notifications.filter(n => isMyNotification(n, allSubscriptions));

    const notifCountById = myNotifications.reduce((acc, n) => {
        const parsed = parseNotification(n);
        const id = parsed?.subscriptionRef?.split('/')?.[1];
        if (id) acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {});

    const orderedNotifications = [...myNotifications].reverse();
    const totalNotifPages      = Math.ceil(orderedNotifications.length / DEFAULT_PAGE_SIZE);
    const paginatedNotifications = orderedNotifications.slice(
        (notifPage - 1) * DEFAULT_PAGE_SIZE, notifPage * DEFAULT_PAGE_SIZE
    );

    const getSeenCutoffFromLoadedNotifications = useCallback(() => {
        const parsedTimestamps = myNotifications
            .map(n => n?.timestamp)
            .filter(Boolean)
            .map(ts => new Date(ts))
            .filter(d => !Number.isNaN(d.getTime()));
        if (parsedTimestamps.length === 0) return new Date().toISOString();
        return new Date(Math.max(...parsedTimestamps.map(d => d.getTime()))).toISOString();
    }, [myNotifications]);

    const handleDrawerClose = useCallback(() => {
        onClose?.(getSeenCutoffFromLoadedNotifications());
    }, [onClose, getSeenCutoffFromLoadedNotifications]);

    // Data loaders
    const handleAdminFetchTask = async (endpoint, criteria) => {
        const res  = await fetch(`${coordinationServer}/Subscription`, { headers: buildAuthHeaders('cp', coordinationServer) });
        const data = await res.json();
        return (data.entry || []).map(e => e.resource).filter(Boolean)
            .filter(s => (!endpoint || s.channel?.endpoint === endpoint) && (!criteria || s.criteria === criteria));
    };

    const handleAdminFetchAeob = async (endpoint, criteria) => {
        const res  = await fetch(`${payerServer}/Subscription`, { headers: buildAuthHeaders('payer', payerServer) });
        const data = await res.json();
        return (data.entry || []).map(e => e.resource).filter(Boolean)
            .filter(s => (!endpoint || s.channel?.endpoint === endpoint) && (!criteria || s.criteria === criteria));
    };

    const loadAllTaskSubscriptions = async () => {
        setAllTaskSubsLoading(true);
        try {
            const res  = await fetch(`${coordinationServer}/Subscription`, { headers: buildAuthHeaders('cp', coordinationServer) });
            const data = await res.json();
            setAllTaskSubs([...(data.entry || []).map(e => e.resource).filter(Boolean)]);
            setTaskLastRefreshed(new Date().toISOString());
        } catch { setAllTaskSubs([]); }
        finally { setAllTaskSubsLoading(false); }
    };

    const loadAllAeobSubscriptions = async () => {
        setAllAeobSubsLoading(true);
        try {
            const res  = await fetch(`${payerServer}/Subscription`, { headers: buildAuthHeaders('payer', payerServer) });
            const data = await res.json();
            setAllAeobSubs([...(data.entry || []).map(e => e.resource).filter(Boolean)]);
            setAeobLastRefreshed(new Date().toISOString());
            setAllAeobLoaded(true);
        } catch { setAllAeobSubs([]); }
        finally { setAllAeobSubsLoading(false); }
    };

    const loadTaskSubscriptions = async ({ silent = false, updateState = true } = {}) => {
        if (!silent) { setTaskLoading(true); setTaskError(null); }
        try {
            const subs = await getMySubscriptions(coordinationServer, loginRole, requester, contributor, 'cp');
            if (updateState) { setTaskSubscriptions([...subs]); setTaskLastRefreshed(new Date().toISOString()); }
            return subs;
        } catch (e) {
            if (!silent) setTaskError('Failed to load task subscriptions.');
            return [];
        } finally { if (!silent) setTaskLoading(false); }
    };

    const loadAeobSubscriptions = async ({ silent = false, updateState = true } = {}) => {
        if (!silent) { setAeobLoading(true); setAeobError(null); }
        try {
            const subs = await getMySubscriptions(payerServer, loginRole, requester, contributor, 'payer');
            if (updateState) {
                setAeobSubscriptions([...subs]);
                setAeobLastRefreshed(new Date().toISOString());
                setAeobLoaded(true);
            }
            return subs;
        } catch (e) {
            if (!silent) setAeobError('Failed to load AEOB subscriptions.');
            return [];
        } finally { if (!silent) setAeobLoading(false); }
    };

    const refreshTaskSubscriptionsAfterCreate = async (createdSub) => {
        if (!currentUser) { await loadAllTaskSubscriptions(); return; }
        if (createdSub?.id)
            setTaskSubscriptions(prev => prev.some(s => s.id === createdSub.id) ? prev : [createdSub, ...prev]);
        await delay(1000);
        const subs = await loadTaskSubscriptions({ silent: true, updateState: false });
        if (!createdSub?.id || subs.some(s => s.id === createdSub.id)) {
            setTaskSubscriptions([...subs]);
            setTaskLastRefreshed(new Date().toISOString());
        }
    };

    const refreshAeobSubscriptionsAfterCreate = async (createdSub) => {
        if (!currentUser) { await loadAllAeobSubscriptions(); return; }
        if (createdSub?.id)
            setAeobSubscriptions(prev => prev.some(s => s.id === createdSub.id) ? prev : [createdSub, ...prev]);
        await delay(1000);
        const subs = await loadAeobSubscriptions({ silent: true, updateState: false });
        if (!createdSub?.id || subs.some(s => s.id === createdSub.id)) {
            setAeobSubscriptions([...subs]);
            setAeobLastRefreshed(new Date().toISOString());
        }
    };

    const loadNotifications = async () => {
        setNotifLoading(true);
        try {
            const feedUrl = notificationFeedUrl || defaultNotificationFeedUrl;
            const res   = await fetch(feedUrl, { headers: getNotificationFeedHeaders(feedUrl) });
            const data  = await res.json();
            const notifs = data.notifications || [];
            setNotifications(notifs);
            setNotifLastRefreshed(new Date().toISOString());
            return notifs;
        } catch { setNotifications([]); return []; }
        finally { setNotifLoading(false); }
    };
    const lastOpenedAtByActorRef = React.useRef({});
    const currentActorLastOpenedAt = lastOpenedAtByActorRef.current[actorKey] || null;
    useEffect(() => {
        if (open) {
            lastOpenedAtByActorRef.current[actorKey] = new Date().toISOString();
            onUnreadCount?.(0);
            if (!currentUser) {
                if (isLocalServer(coordinationServer)) loadAllTaskSubscriptions();
                else setAllTaskSubs([]);
                setAllAeobSubs([]);
                setAllAeobLoaded(false);
                setTab(0);
            } else {
                if (loginRole === 'requester') {
                    Promise.all([loadTaskSubscriptions(), loadAeobSubscriptions(), loadNotifications()]).then(([taskSubs, aeobSubs, notifs]) => {
                        const allSubs = [...taskSubs, ...aeobSubs];
                        const hasUnread = notifs.some(n => isMyNotification(n, allSubs));
                        setTab(allSubs.length === 0 ? 0 : hasUnread ? 2 : 0);
                    });
                } else {
                    Promise.all([loadTaskSubscriptions(), loadNotifications()]).then(([taskSubs, notifs]) => {
                        const hasUnread = notifs.some(n => isMyNotification(n, taskSubs));
                        setTab(taskSubs.length === 0 ? 0 : hasUnread ? 2 : 0);
                    });
                }
            }
        }
    }, [open, loginRole, requester, contributor, actorKey]);

    useEffect(() => {
        if (!open || tab !== 1) return;
        if (currentUser) {
            if (loginRole === 'contributor') return;
            if (!aeobLoading && !aeobLoaded) loadAeobSubscriptions();
            return;
        }
        if (isLocalServer(payerServer) && !allAeobSubsLoading && !allAeobLoaded) loadAllAeobSubscriptions();
    }, [open, tab, currentUser, loginRole, payerServer, aeobLoading, aeobLoaded, allAeobSubsLoading, allAeobLoaded]);

    useEffect(() => {
        if (!open) { setShowNewTaskForm(false); setShowNewAeobForm(false); setTab(0); }
    }, [open]);

    useEffect(() => {
        if (!open || !currentUser) return;
        const pollingInterval = setInterval(loadNotifications, notificationPollingMs || DEFAULT_POLLING_MS);
        return () => clearInterval(pollingInterval);
    }, [open, currentUser, loginRole, requester, contributor, notificationPollingMs, notificationFeedUrl]);

    useEffect(() => { setNotifPage(1); }, [myNotifications.length]);
    useEffect(() => {
        setPollingSecondsDraft(String(Math.round((notificationPollingMs || DEFAULT_POLLING_MS) / 1000)));
    }, [notificationPollingMs]);
    useEffect(() => {
        setNotificationFeedUrlDraft(notificationFeedUrl || defaultNotificationFeedUrl);
    }, [notificationFeedUrl, defaultNotificationFeedUrl]);

    const applyPollingInterval = () => {
        const parsed = Number(pollingSecondsDraft);
        if (!Number.isFinite(parsed)) {
            setPollingSecondsDraft(String(Math.round((notificationPollingMs || DEFAULT_POLLING_MS) / 1000)));
            return;
        }
        const clamped = Math.min(MAX_POLLING_SECONDS, Math.max(MIN_POLLING_SECONDS, Math.round(parsed)));
        setPollingSecondsDraft(String(clamped));
        onNotificationPollingChange?.(clamped * 1000);
    };

    const applyNotificationFeedUrl = () => {
        const normalized = (notificationFeedUrlDraft || '').trim() || defaultNotificationFeedUrl;
        setNotificationFeedUrlDraft(normalized);
        onNotificationFeedUrlChange?.(normalized);
    };

    const getNotificationFeedHeaders = (url) => buildAuthHeaders('cp', url);

    const fetchNotificationCount = async (url) => {
        try {
            const res = await fetch(url, { headers: getNotificationFeedHeaders(url) });
            if (!res.ok) return null;
            const data = await res.json();
            return Array.isArray(data?.notifications) ? data.notifications.length : 0;
        } catch {
            return null;
        }
    };

    const clearNotificationFeed = async (url) => {
        const response = await fetch(url, { method: 'DELETE', headers: getNotificationFeedHeaders(url) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
    };

    const handleClearNotificationFeed = async () => {
        const targetUrl = clearTargetUrl;
        if (!targetUrl) {
            showToast('Notification feed URL is required.', 'error');
            return;
        }
        if (!isTrustedClearTarget) {
            showToast('Clearing is disabled for external feeds.', 'warning');
            return;
        }

        const notificationCount = await fetchNotificationCount(targetUrl);
        if (notificationCount == null) {
            showToast('Unable to read notification feed. Verify Feed URL/server and try again.', 'error');
            return;
        }
        if (notificationCount === 0) {
            showToast('No notifications in feed. Nothing to clear.', 'info');
            return;
        }

        const ok = await confirm(
            'Clear all Notification Feed ?',
            <>
                {'⚠️ This will DELETE '}
                <strong>{String(notificationCount)}</strong>
                {' notifications from:\n'}
                {targetUrl}
                {'\n\nThis cannot be undone.'}
            </>,
            'Clear feed',
            'error'
        );
        if (!ok) return;

        setClearFeedLoading(true);
        try {
            await clearNotificationFeed(targetUrl);
            setNotifications([]);
            setNotifPage(1);
            setNotifLastRefreshed(new Date().toISOString());
            onUnreadCount?.(0);
            lastOpenedAtByActorRef.current[actorKey] = new Date().toISOString();
            showToast('Notification feed cleared.', 'success');
        } catch (e) {
            showToast(`Failed to clear feed (${e?.message || 'unknown error'}).`, 'error');
        } finally {
            setClearFeedLoading(false);
        }
    };

    // Task handlers
    const handleDeleteTask = async (id) => {
        if (currentUser) setTaskSubscriptions(prev => prev.filter(s => s.id !== id));
        else setAllTaskSubs(prev => prev.filter(s => s.id !== id));
        try {
            await deleteSubscription(coordinationServer, id, 'cp');
            showToast('Subscription deleted.', 'success');
            return true;
        } catch (e) {
            if (currentUser) await loadTaskSubscriptions(); else await loadAllTaskSubscriptions();
            showToast('Failed to delete subscription. List restored.', 'error');
            return false;
        }
    };

    const handleDeleteAllTask = async () => {
        const isLocal = isLocalServer(coordinationServer);
        if (!isLocal) {
            const ok = await confirm('External server warning',
                `⚠️ You are connected to an external server:\n${coordinationServer}\n\nProceed with caution.`,
                'Proceed', 'warning');
            if (!ok) return;
        }
        const safeSubs    = taskSubscriptions.filter(s => isLocalServer(s.channel?.endpoint));
        const skippedSubs = taskSubscriptions.filter(s => !isLocalServer(s.channel?.endpoint));
        if (safeSubs.length === 0) { showToast('No subscriptions pointing to a local endpoint. Nothing deleted.', 'info'); return; }
        if (skippedSubs.length > 0) {
            await confirm('Skipping external endpoint subscriptions',
                `${skippedSubs.length} subscription(s) point to external endpoints and will be skipped:\n\n${
                    skippedSubs.map(s => `Subscription/${s.id} → ${s.channel?.endpoint}`).join('\n')}`,
                'OK', 'info');
        }
        const ids = safeSubs.map(s => `Subscription/${s.id} → ${s.channel?.endpoint}`).join('\n');
        const ok  = await confirm('Delete Task Subscriptions ?',
            `⚠️ Delete ${safeSubs.length} subscription(s)?\n\n${ids}\n\nThis cannot be undone.`, 'Delete', 'error');
        if (!ok) return;
        const safeIds = new Set(safeSubs.map(s => s.id));
        setDeleteAllTaskLoading(true);
        try {
            setTaskSubscriptions(prev => prev.filter(s => !safeIds.has(s.id)));
            await Promise.all(safeSubs.map(s => deleteSubscription(coordinationServer, s.id, 'cp')));
            showToast(`Deleted ${safeSubs.length} subscription(s).`, 'success');
        } catch (e) {
            await loadTaskSubscriptions();
            showToast('Some subscriptions may not have been deleted. Please refresh and verify.', 'error');
        } finally { setDeleteAllTaskLoading(false); }
    };

    const handleAdminDeleteAllTask = async (endpoint, preFetchedSubs, criteria) => {
        if (!preFetchedSubs?.length) { showToast('No task subscriptions found to delete.', 'info'); return false; }
        const ids        = preFetchedSubs.map(s => `Subscription/${s.id}`).join('\n');
        const filterDesc = [endpoint && `endpoint: ${endpoint}`, criteria && `criteria: ${criteria}`].filter(Boolean).join(', ');
        const ok = await confirm('Admin: Delete Task Subscriptions ?',
            `⚠️ Delete ${preFetchedSubs.length} subscription(s) on ${coordinationServer}\nFilter: ${filterDesc}\n\n${ids}\n\nThis cannot be undone.`,
            'Delete', 'error');
        if (!ok) return false;
        setAdminDeleteAllTaskLoading(true);
        try {
            const matchingIds = new Set(preFetchedSubs.map(s => s.id));
            if (currentUser) setTaskSubscriptions(prev => prev.filter(s => !matchingIds.has(s.id)));
            else setAllTaskSubs(prev => prev.filter(s => !matchingIds.has(s.id)));
            await Promise.all(preFetchedSubs.map(s => deleteSubscription(coordinationServer, s.id, 'cp')));
            showToast(`Deleted ${preFetchedSubs.length} subscription(s).`, 'success');
            return true;
        } catch (e) {
            if (currentUser) await loadTaskSubscriptions(); else await loadAllTaskSubscriptions();
            showToast('Some subscriptions may not have been deleted. Please refresh and verify.', 'error');
            return false;
        } finally { setAdminDeleteAllTaskLoading(false); }
    };

    // AEOB handlers
    const handleDeleteAeob = async (id) => {
        if (currentUser) setAeobSubscriptions(prev => prev.filter(s => s.id !== id));
        else setAllAeobSubs(prev => prev.filter(s => s.id !== id));
        try {
            await deleteSubscription(payerServer, id, 'payer');
            showToast('Subscription deleted.', 'success');
            return true;
        } catch (e) {
            if (currentUser) await loadAeobSubscriptions(); else await loadAllAeobSubscriptions();
            showToast('Failed to delete subscription. List restored.', 'error');
            return false;
        }
    };

    const handleDeleteAllAeob = async () => {
        const isLocal = isLocalServer(payerServer);
        if (!isLocal) {
            const ok = await confirm('External payer server warning',
                `⚠️ Connected to external payer server:\n${payerServer}\n\nProceed with caution.`, 'Proceed', 'warning');
            if (!ok) return;
        }
        const safeSubs    = aeobSubscriptions.filter(s => isLocalServer(s.channel?.endpoint));
        const skippedSubs = aeobSubscriptions.filter(s => !isLocalServer(s.channel?.endpoint));
        if (safeSubs.length === 0) { showToast('No AEOB subscriptions pointing to a local endpoint. Nothing deleted.', 'info'); return; }
        if (skippedSubs.length > 0) {
            await confirm('Skipping external endpoint subscriptions',
                `${skippedSubs.length} subscription(s) will be skipped:\n\n${
                    skippedSubs.map(s => `Subscription/${s.id} → ${s.channel?.endpoint}`).join('\n')}`, 'OK', 'info');
        }
        const ids = safeSubs.map(s => `Subscription/${s.id} → ${s.channel?.endpoint}`).join('\n');
        const ok  = await confirm('Delete AEOB Subscriptions ?',
            `⚠️ Delete ${safeSubs.length} AEOB subscription(s)\n\n${ids}\n\nThis cannot be undone.`, 'Delete', 'error');
        if (!ok) return;
        const safeIds = new Set(safeSubs.map(s => s.id));
        setDeleteAllAeobLoading(true);
        try {
            setAeobSubscriptions(prev => prev.filter(s => !safeIds.has(s.id)));
            await Promise.all(safeSubs.map(s => deleteSubscription(payerServer, s.id, 'payer')));
            showToast(`Deleted ${safeSubs.length} AEOB subscription(s).`, 'success');
        } catch (e) {
            await loadAeobSubscriptions();
            showToast('Some subscriptions may not have been deleted. Please refresh and verify.', 'error');
        } finally { setDeleteAllAeobLoading(false); }
    };

    const handleAdminDeleteAllAeob = async (endpoint, preFetchedSubs, criteria) => {
        if (!preFetchedSubs?.length) { showToast('No AEOB subscriptions found to delete.', 'info'); return false; }
        const ids        = preFetchedSubs.map(s => `Subscription/${s.id}`).join('\n');
        const filterDesc = [endpoint && `endpoint: ${endpoint}`, criteria && `criteria: ${criteria}`].filter(Boolean).join(', ');
        const ok = await confirm('Admin: Delete AEOB Subscriptions ?',
            `⚠️ Delete ${preFetchedSubs.length} AEOB subscription(s) on ${payerServer}\n\nFilter: ${filterDesc}\n\n${ids}\n\nThis cannot be undone.`,
            'Delete', 'error');
        if (!ok) return false;
        setAdminDeleteAllAeobLoading(true);
        try {
            const matchingIds = new Set(preFetchedSubs.map(s => s.id));
            if (currentUser) setAeobSubscriptions(prev => prev.filter(s => !matchingIds.has(s.id)));
            else setAllAeobSubs(prev => prev.filter(s => !matchingIds.has(s.id)));
            await Promise.all(preFetchedSubs.map(s => deleteSubscription(payerServer, s.id, 'payer')));
            showToast(`Deleted ${preFetchedSubs.length} AEOB subscription(s).`, 'success');
            return true;
        } catch (e) {
            if (currentUser) await loadAeobSubscriptions(); else await loadAllAeobSubscriptions();
            showToast('Some subscriptions may not have been deleted. Please refresh and verify.', 'error');
            return false;
        } finally { setAdminDeleteAllAeobLoading(false); }
    };

    // Render
    return (
        <>
            <Toast toast={toast} onClose={hideToast} />
            {ConfirmDialogNode}
            <Dialog open={open} onClose={handleDrawerClose} maxWidth="sm" fullWidth
                    PaperProps={{ sx: { height: '80vh', display: 'flex', flexDirection: 'column' } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1rem' }}>
                        {currentUser ? 'Subscriptions & Notifications' : 'Subscription/Notification Management'}
                    </Typography>
                    <IconButton size="small" onClick={handleDrawerClose}><Close fontSize="small" /></IconButton>
                </DialogTitle>

                {currentUser && (
                    <Box sx={{ px: 3, py: 1, backgroundColor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">
                            {loginRole === 'requester' ? 'Requester' : 'Contributor'}: <strong>{currentUser}</strong>
                        </Typography>
                    </Box>
                )}

                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Tab label="Task subscriptions" sx={{ fontSize: '0.8rem', minHeight: 40 }} />
                    <Tab label="AEOB subscriptions" disabled={!!(currentUser && loginRole === 'contributor')} sx={{ fontSize: '0.8rem', minHeight: 40 }} />
                    {!currentUser && <Tab label="Notification settings" sx={{ fontSize: '0.8rem', minHeight: 40 }} />}
                    {currentUser && (
                        <Tab
                            label={`Notifications${myNotifications.length > 0 ? ` (${myNotifications.length})` : ''}`}
                            sx={{ fontSize: '0.8rem', minHeight: 40 }}
                        />
                    )}
                </Tabs>

                <DialogContent sx={{ flex: 1, overflow: 'auto', px: 2, py: 0 }}>

                    <TabPanel value={tab} index={0}>
                        <SubscriptionsTabContent
                            subscriptions={taskSubscriptions} loading={taskLoading} error={taskError}
                            showNewForm={showNewTaskForm} setShowNewForm={setShowNewTaskForm}
                            onDelete={handleDeleteTask} onDeleteAll={handleDeleteAllTask}
                            deleteAllLoading={deleteAllTaskLoading}
                            onAdminDeleteAll={handleAdminDeleteAllTask}
                            adminDeleteAllLoading={adminDeleteAllTaskLoading}
                            currentUser={currentUser} loginRole={loginRole}
                            serverUrl={coordinationServer}
                            allServerSubscriptions={allTaskSubs} allServerSubsLoading={allTaskSubsLoading}
                            onAdminFetch={handleAdminFetchTask}
                            criteriaTopics={TASK_CRITERIA_TOPICS} serverLabel="Coordination"
                            lastRefreshed={taskLastRefreshed}
                            notifCountById={notifCountById}
                            newForm={
                                <NewTaskSubscriptionForm
                                    loginRole={loginRole} requester={requester} contributor={contributor}
                                    coordinationServer={coordinationServer}
                                    existingSubscriptions={taskSubscriptions}
                                    onSave={async (sub) => { setShowNewTaskForm(false); await refreshTaskSubscriptionsAfterCreate(sub); showToast('Subscription created.', 'success'); }}
                                    onCancel={() => setShowNewTaskForm(false)}
                                />
                            }
                        />
                    </TabPanel>

                    <TabPanel value={tab} index={1}>
                        {currentUser && loginRole === 'contributor' ? (
                            <Typography variant="body2" color="text.secondary" sx={{ pt: 2 }}>
                                AEOB subscriptions are only available for requesters.
                            </Typography>
                        ) : (
                            <SubscriptionsTabContent
                                subscriptions={aeobSubscriptions} loading={aeobLoading} error={aeobError}
                                showNewForm={showNewAeobForm} setShowNewForm={setShowNewAeobForm}
                                onDelete={handleDeleteAeob} onDeleteAll={handleDeleteAllAeob}
                                deleteAllLoading={deleteAllAeobLoading}
                                onAdminDeleteAll={handleAdminDeleteAllAeob}
                                adminDeleteAllLoading={adminDeleteAllAeobLoading}
                                currentUser={currentUser} loginRole={loginRole}
                                serverUrl={payerServer}
                                allServerSubscriptions={allAeobSubs} allServerSubsLoading={allAeobSubsLoading}
                                onAdminFetch={handleAdminFetchAeob}
                                criteriaTopics={AEOB_CRITERIA_TOPICS} serverLabel="Payer"
                                lastRefreshed={aeobLastRefreshed}
                                notifCountById={notifCountById}
                                newForm={
                                    <NewAeobSubscriptionForm
                                        requester={requester} payerServer={payerServer}
                                        existingSubscriptions={aeobSubscriptions}
                                        onSave={async (sub) => { setShowNewAeobForm(false); await refreshAeobSubscriptionsAfterCreate(sub); showToast('Subscription created.', 'success'); }}
                                        onCancel={() => setShowNewAeobForm(false)}
                                    />
                                }
                            />
                        )}
                    </TabPanel>

                    {!currentUser && (
                        <TabPanel value={tab} index={2}>
                            <Box sx={{ pt: 2 }}>
                                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.25, mb: 1, backgroundColor: 'grey.50' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '0.9rem' }}>Notification settings</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                        Configure refresh frequency and feed endpoint.
                                    </Typography>

                                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.25, backgroundColor: '#fff', mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, fontWeight: 600 }}>
                                            Refresh interval
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.25 }}>
                                            <TextField
                                                size="small"
                                                type="number"
                                                label="Seconds"
                                                value={pollingSecondsDraft}
                                                onChange={(e) => setPollingSecondsDraft(e.target.value)}
                                                onBlur={applyPollingInterval}
                                                inputProps={{ min: MIN_POLLING_SECONDS, max: MAX_POLLING_SECONDS }}
                                                sx={{ width: 128 }}
                                            />
                                            <Button size="small" variant="outlined" onClick={applyPollingInterval} sx={{ mb: '2px' }}>
                                                Apply
                                            </Button>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.85 }}>
                                            Controls how often notification count and list refresh automatically.
                                        </Typography>
                                    </Box>

                                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.25, backgroundColor: '#fff' }}>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, fontWeight: 600 }}>
                                            Notification feed URL
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.25 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Feed URL"
                                                value={notificationFeedUrlDraft}
                                                onChange={(e) => setNotificationFeedUrlDraft(e.target.value)}
                                                onBlur={applyNotificationFeedUrl}
                                                placeholder={defaultNotificationFeedUrl}
                                            />
                                            <Button size="small" variant="outlined" onClick={applyNotificationFeedUrl} sx={{ mb: '2px' }}>
                                                Apply
                                            </Button>
                                        </Box>
                                    </Box>

                                    <Box sx={{ border: '1px solid', borderColor: 'error.light', borderRadius: 1, p: 1.25, backgroundColor: '#fff', mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, fontWeight: 600 }}>
                                            Clear Notification feed
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
                                            Feed URL: {clearTargetUrl || '—'}
                                        </Typography>
                                        {!isTrustedClearTarget && (
                                            <Alert severity="warning" sx={{ py: 0, mb: 1 }}>
                                                Custom/external host detected. Clearing is disabled for external feeds.
                                            </Alert>
                                        )}
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={handleClearNotificationFeed}
                                                disabled={!canClearFeed || clearFeedLoading}
                                            >
                                                {clearFeedLoading ? <CircularProgress size={14} sx={{ mr: 1 }} /> : null}
                                                Clear notification feed (DELETE)
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </TabPanel>
                    )}

                    {currentUser && (
                        <TabPanel value={tab} index={2}>
                            <Box sx={{ pt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {myNotifications.length} notification{myNotifications.length !== 1 ? 's' : ''}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Last refreshed: {notifLastRefreshed ? new Date(notifLastRefreshed).toLocaleString() : 'Never'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {/* Group toggle */}
                                        <Tooltip title={groupBySubscription ? 'Show flat list' : 'Group by subscription'}>
                                            <IconButton size="small"
                                                        onClick={() => setGroupBySubscription(g => !g)}
                                                        color={groupBySubscription ? 'primary' : 'default'}>
                                                <Segment fontSize="small" />  {/* or any grouping icon */}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Refresh">
                                            <IconButton size="small" onClick={loadNotifications} disabled={notifLoading}>
                                                <Refresh fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                {notifLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : myNotifications.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                        <NotificationsNone sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
                                        <Typography variant="body2">No notifications received yet.</Typography>
                                    </Box>
                                ) : groupBySubscription ? (
                                    <GroupedNotifications
                                        notifications={orderedNotifications}
                                        allSubscriptions={allSubscriptions}
                                        lastOpenedAt={currentActorLastOpenedAt}
                                    />
                                ) : (
                                    orderedNotifications.map((n, i) => (
                                        <NotificationCard
                                            key={`${n.timestamp || 'notif'}-${i}`}
                                            notification={n}
                                            isNew={!!(currentActorLastOpenedAt && n.timestamp > currentActorLastOpenedAt)}
                                            showSubRef={true}
                                            allSubscriptions={allSubscriptions}
                                        />
                                    ))
                                )}
                            </Box>
                        </TabPanel>
                    )}

                </DialogContent>
            </Dialog>
        </>
    );
}
