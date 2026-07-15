export const NOTIFICATION_HOOK_PATH = '/notification/subscription-hook';
export const LOCAL_PCT_NOTIFICATION_BASE_URL = 'http://localhost:8080';
export const PCT_NOTIFICATION_BASE_URL = 'https://pct-coordination-platform.davinci.hl7.org';
export const KNOWN_NOTIFICATION_ENDPOINTS = [
    `${LOCAL_PCT_NOTIFICATION_BASE_URL}${NOTIFICATION_HOOK_PATH}`,
    `${PCT_NOTIFICATION_BASE_URL}${NOTIFICATION_HOOK_PATH}`,
];

export const getNotificationFeedUrlForServer = (serverUrl) => {
    const normalized = (serverUrl || '').toLowerCase();
    const isLocal = normalized.includes('localhost') || normalized.includes('127.0.0.1');
    const baseUrl = isLocal ? LOCAL_PCT_NOTIFICATION_BASE_URL : PCT_NOTIFICATION_BASE_URL;
    return `${baseUrl}${NOTIFICATION_HOOK_PATH}`;
};

// Map subscription topic URLs to their FHIR profile URIs.
export const TOPIC_TO_PROFILE = {
    "http://hl7.org/fhir/us/davinci-pct/SubscriptionTopic/davinci-pct-gfe-coordination-task-notification":
        "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-task-update-subscription",
    "http://hl7.org/fhir/us/davinci-pct/SubscriptionTopic/davinci-pct-gfe-available-author-notification":
        "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-available-author-subscription",
    "http://hl7.org/fhir/us/davinci-pct/SubscriptionTopic/davinci-pct-gfe-available-subject-notification":
        "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-available-subject-subscription",
    "http://hl7.org/fhir/us/davinci-pct/SubscriptionTopic/davinci-pct-aeob-available-author-notification":
        "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-aeob-available-author-subscription",
    "http://hl7.org/fhir/us/davinci-pct/SubscriptionTopic/davinci-pct-aeob-available-subject-notification":
        "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-aeob-available-subject-subscription"
};

export const buildSubscriptionPayload = ({
    filterCriteria,
    notificationEndpoint,
    channelType = "rest-hook",
    reason = "Subscription for task notifications",
    status = "active",
    topicUrl
}) => {
    if (!topicUrl) {
        throw new Error("[buildSubscriptionPayload] Missing required parameter: topicUrl");
    }

    const primaryProfile = TOPIC_TO_PROFILE[topicUrl];

    if (!primaryProfile) {
        throw new Error(`[buildSubscriptionPayload] No profile mapping found for topicUrl: ${topicUrl}`);
    }

    const resolvedReason = typeof reason === "string" && reason.trim()
        ? reason.trim()
        : "Test PCT Subscriptions";

    return {
        resourceType: "Subscription",
        meta: {
            profile: [
                primaryProfile,
                "http://hl7.org/fhir/uv/subscriptions-backport/StructureDefinition/backport-subscription"
            ]
        },
        status,
        reason: resolvedReason,
        criteria: topicUrl,
        _criteria: {
            extension: [
                {
                    url: "http://hl7.org/fhir/uv/subscriptions-backport/StructureDefinition/backport-filter-criteria",
                    valueString: filterCriteria
                }
            ]
        },
        channel: {
            type: channelType,
            endpoint: notificationEndpoint,
            payload: "application/fhir+json",
            _payload: {
                extension: [
                    {
                        url: "http://hl7.org/fhir/uv/subscriptions-backport/StructureDefinition/backport-payload-content",
                        valueCode: "full-resource"
                    }
                ]
            }
        }
    };
};

export const parseNotification = (notification) => {
    const bundle = notification?.payload;
    if (!bundle) return null;
    const parametersEntry = bundle.entry?.find(e => e.resource?.resourceType === 'Parameters');
    const taskEntry = bundle.entry?.find(e => e.resource?.resourceType === 'Task');
    const docRefEntry = bundle.entry?.find(e => e.resource?.resourceType === 'DocumentReference');
    const params = parametersEntry?.resource?.parameter || [];
    const getParam = (name) => params.find(p => p.name === name);
    const getParamValue = (name) => {
        const p = getParam(name);
        return p?.valueCode ?? p?.valueString ?? undefined;
    };
    const subRef = getParam('subscription')?.valueReference?.reference;
    const notifEvent = getParam('notification-event');
    const focusRef = notifEvent?.part?.find(p => p.name === 'focus')?.valueReference?.reference;
    const task = taskEntry?.resource;
    const docRef = docRefEntry?.resource;
    return {
        timestamp: notification.timestamp,
        subscriptionRef: subRef,
        status: getParamValue('status'),
        type: getParamValue('type'),
        focusRef,
        taskId: task?.id,
        taskStatus: task?.status,
        taskOwner: task?.owner?.reference,
        taskRequester: task?.requester?.reference,
        taskProfile: task?.meta?.profile?.[0]?.includes('contributor') ? 'Contributor Task' : 'Coordination Task',
        docRefId: docRef?.id,
        docRefAuthor: docRef?.author?.[0]?.reference,
        docRefSubject: docRef?.subject?.reference,
        docRefType: docRef?.type?.coding?.[0]?.code,
        isAeob: !!docRef,
    };
};

export const isMyNotification = (notification, subscriptions) => {
    const parsed = parseNotification(notification);
    if (!parsed) return false;
    return subscriptions.some((sub) => parsed.subscriptionRef === `Subscription/${sub.id}`);
};

export const getTaskEventTemplates = (loginRole, requester, contributor) => {
    if (loginRole === 'requester' && requester) return [
        { label: 'Task status changes', criteria: `Task?requester=${requester}` },
        { label: 'Task created', criteria: `Task?requester=${requester}&status=requested` },
        { label: 'Task accepted', criteria: `Task?requester=${requester}&status=accepted` },
        { label: 'Task completed', criteria: `Task?requester=${requester}&status=completed` },
        { label: 'Task cancelled', criteria: `Task?requester=${requester}&status=cancelled` },
        { label: 'Task rejected', criteria: `Task?requester=${requester}&status=rejected` },
        { label: 'Task failed', criteria: `Task?requester=${requester}&status=failed` },
        { label: 'Custom', criteria: '' },
    ];
    if (loginRole === 'contributor' && contributor) return [
        { label: 'Task assigned', criteria: `Task?owner=${contributor}&status=requested` },
        { label: 'Task cancelled', criteria: `Task?owner=${contributor}&status=cancelled` },
        { label: 'Task failed', criteria: `Task?owner=${contributor}&status=failed` },
        { label: 'Task status changes', criteria: `Task?owner=${contributor}` },
        { label: 'Custom', criteria: '' },
    ];
    return [{ label: 'Custom', criteria: '' }];
};

export const getTaskTopicOptions = (loginRole, taskTopicOptions, taskUpdateTopic) => (
    loginRole === 'contributor'
        ? taskTopicOptions.filter((option) => option.topicUrl === taskUpdateTopic)
        : taskTopicOptions
);

export const findDuplicateSubscription = (existingSubscriptions, topicUrl, filterCriteria, endpoint) => {
    const normalize = (value) => value?.trim().toLowerCase();
    return existingSubscriptions.find((sub) => {
        const subCriteria = sub._criteria?.extension?.[0]?.valueString || '';
        return normalize(sub.criteria) === normalize(topicUrl)
            && normalize(subCriteria) === normalize(filterCriteria)
            && normalize(sub.channel?.endpoint) === normalize(endpoint);
    }) || null;
};

