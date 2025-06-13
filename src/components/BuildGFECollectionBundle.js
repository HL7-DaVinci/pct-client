//import buildGFERequest from "./BuildGFERequest";
//import { v4 } from "uuid";
const buildGFECollectionBundle = (gfe_bundles, bundleResources) => {
  
  const collection_bundle = {
    resourceType: "Bundle",
    id: "collection-bundle-transaction",
    type: "collection",
    entry: [],
  };

  collection_bundle.meta = {
    profile: ["http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-collection-bundle"],
    lastUpdated: new Date().toISOString(),
  };

  collection_bundle.identifier = {
    system: "http://example.org/documentIDs",
    value: "collection-bundle-A12345",
  };

  collection_bundle.timestamp = new Date().toISOString();

  // Add Patient, Coverage, payer, and submitter to Collection Bundle
  bundleResources.forEach((resource) => {
    if('type' in resource && (resource.type === 'patient' || resource.type === 'coverage' || resource.type === 'payer' || resource.type === 'submitter'))
    {
      collection_bundle.entry.push({
        fullUrl: resource.fullUrl,
        resource: resource.entry,
      });
    }
  });
  
  gfe_bundles.forEach((gfe_bundle) => {
        collection_bundle.entry.push({
            fullUrl: `http://example.org/fhir/Bundle/` + gfe_bundle.id,
            resource: gfe_bundle,
        });
    });

  return collection_bundle;
};

export default buildGFECollectionBundle;
