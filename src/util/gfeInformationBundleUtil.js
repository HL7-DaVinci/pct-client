import { FHIRClient, getAccessToken } from "../api";

/**
 * Finds the gfe-information-bundle input on a Task and resolves its value
 * (valueAttachment inline data, or valueReference to another resource),
 * then hands the resulting Bundle to setInfoBundle.
 *
 * @param {object} task - FHIR Task resource (Coordination or Contributor task)
 * @param {string} server - FHIR server base to resolve valueReference against
 * @param {(bundle: object|undefined) => void} setInfoBundle - state setter
 */
export function loadInformationBundle(task, server, setInfoBundle) {
    const infoBundleInput = (task?.input || []).find(
        (input) => input.type?.coding?.[0]?.code === "gfe-information-bundle"
    );

    // valueAttachment: data + contentType are both mandatory per profile
    const loadFromAttachment = (attachment) => {
        try {
            const decoded = atob(attachment.data);
            setInfoBundle(JSON.parse(decoded));
        } catch (e) {
            console.error("Error parsing GFE Information Bundle attachment", e);
            setInfoBundle(undefined);
        }
    };

    // valueReference: reference is mandatory, may be relative/absolute/internal (urn:uuid:)
    const loadFromReference = (reference) => {
        const ref = reference.reference;

        FHIRClient(server, getAccessToken("cp"))
            .request(ref)
            .then((resource) => {
                setInfoBundle(resource);
            })
            .catch((e) => {
                console.error("Error resolving GFE Information Bundle valueReference", e);
                setInfoBundle(undefined);
            });
    };

    if (infoBundleInput?.valueAttachment) {
        loadFromAttachment(infoBundleInput.valueAttachment);
    } else if (infoBundleInput?.valueReference) {
        loadFromReference(infoBundleInput.valueReference);
    } else {
        setInfoBundle(undefined);
    }
}