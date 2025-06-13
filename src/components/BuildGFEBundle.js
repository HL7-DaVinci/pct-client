import buildGFERequest from "./BuildGFERequest";
import { v4 } from "uuid";
import buildGFEBundleSummary from "./BuildGFEBundleSummary";
const buildGFEBundle = (input) => {
  const GFEClaim = buildGFERequest(input);
  /*
  const collection_bundle = {
    resourceType: "Bundle",
    id: "collection-bundle-transaction",
    type: "collection",
    entry: [],
  };

  collection_bundle.meta = {
    lastUpdated: new Date().toISOString(),
  };

  collection_bundle.identifier = {
    system: "http://example.org/documentIDs",
    value: "collection-bundle-A12345",
  };

  collection_bundle.timestamp = new Date().toISOString();
*/
  const gfe_bundle = {
    resourceType: "Bundle",
    id: `${v4()}`,
    type: "collection",
    entry: [],
  };

  gfe_bundle.meta = {
    profile: ["http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-bundle"],
    lastUpdated: new Date().toISOString(),
  };

  gfe_bundle.identifier = {
    system: "http://example.org/documentIDs",
    value: "gfe-bundle-A12345",
  };

  gfe_bundle.timestamp = new Date().toISOString();

  gfe_bundle.entry.push({
    fullUrl: `http://example.org/fhir/Claim/PCT-Good-Faith-Estimate-${v4()}`,
    resource: GFEClaim,
  });

  // Do not include the submitter in the individual GFE Bundle
  input.bundleResources.forEach((resource) => {
    if(!('type' in resource && resource.type === 'submitter'))
    {
      gfe_bundle.entry.push({
        fullUrl: resource.fullUrl,
        resource: resource.entry,
      });
    }
  });
/*
  // Add Patient, Coverage, payer, and submitter to Collection Bundle
  input.bundleResources.forEach((resource) => {
    if('type' in resource && (resource.type === 'patient' || resource.type === 'coverage' || resource.type === 'payer' || resource.type === 'submitter'))
    {
      collection_bundle.entry.push({
        fullUrl: resource.fullUrl,
        resource: resource.entry,
      });
    }
  });
  

  collection_bundle.entry.push({
    fullUrl: `http://example.org/fhir/Bundle/PCT-GFE-Bundle-${v4()}`,
    resource: gfe_bundle,
  });

  return collection_bundle;
  */
  const gfeSummary = buildGFEBundleSummary(gfe_bundle);

  gfe_bundle.entry.push({
    fullUrl: `http://example.org/fhir/Claim/${gfeSummary.id}`,
    resource: gfeSummary,
  });

 return gfe_bundle;
};

export default buildGFEBundle;
