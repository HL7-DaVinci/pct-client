import buildGFEComposition from "./BuildGFEComposition";
//import buildGFERequest from "./BuildGFERequest";
//import { v4 } from "uuid";
const buildGFEPacketBundle = (gfe_bundles, bundleResources) => {
  
  const document_bundle = {
    resourceType: "Bundle",
    id: "document-bundle-transaction",
    type: "document",
    entry: [],
  };

  document_bundle.meta = {
    profile: ["http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-packet"],
    lastUpdated: new Date().toISOString(),
  };

  document_bundle.identifier = {
    system: "http://example.org/documentIDs",
    value: "document-bundle-A12345",
  };

  document_bundle.timestamp = new Date().toISOString();

  // Add Patient, Coverage, payer, and submitter to document Bundle
  bundleResources.forEach((resource) => {
    if('type' in resource && (resource.type === 'patient' || resource.type === 'coverage' || resource.type === 'payer' || resource.type === 'submitter'))
    {
      document_bundle.entry.push({
        fullUrl: resource.fullUrl,
        resource: resource.entry,
      });
    }
  });

  gfe_bundles.forEach((gfe_bundle) => {
        document_bundle.entry.push({
            fullUrl: `http://example.org/fhir/Bundle/` + gfe_bundle.id,
            resource: gfe_bundle,
        });
    });

// create a Composition resource
const gfeComposition = buildGFEComposition(gfe_bundles);

// Add the Composition as the first entry in the packet bundle
  document_bundle.entry = [
    {
      fullUrl: `http://example.org/fhir/Composition/` + gfeComposition.id,
      resource: gfeComposition
    }
  ].concat(document_bundle.entry || []);

  return document_bundle;
};

export default buildGFEPacketBundle;
