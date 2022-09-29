import React from "react";
import { CardContent, Card, Box } from "@material-ui/core";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { TabPanel } from "./TabPanel";
import SummaryItem from "./SummaryItem";

//creates tabs based on the GFE id's
function createTabs(tabsList) {
  let num = 0;
  const listOfGFEKeys = Object.keys(tabsList);

  return listOfGFEKeys.map((el, index) => {
    num += 1;
    return <Tab label={`GFE ${index + 1}`} key={num} />;
  });
}

function retrieveRequestSummary(subjectInfo, gfeInfo, gfeId) {
  const displayableClaimItemList = gfeInfo.claimItemList.map((e) => {
    if (e.estimatedDateOfService) {
      e.estimatedDateOfService = e.estimatedDateOfService.toString();
    }
    return e;
  });
  return {
    patientId: subjectInfo.selectedPatient,
    coverageId: subjectInfo.selectedCoverage
      ? subjectInfo.selectedCoverage.id
      : undefined,
    payorId: subjectInfo.selectedPayor
      ? subjectInfo.selectedPayor.id
      : undefined,
    addressId: subjectInfo.selectedAddress,
    birthdate: subjectInfo.birthdate,
    gender: subjectInfo.gender,
    telephone: subjectInfo.telephone,
    subscriberId: subjectInfo.subscriber,
    memberId: subjectInfo.memberNumber,
    subscriberRelationship: subjectInfo.subscriberRelationship,
    coveragePlan: subjectInfo.coveragePlan,
    coveragePeriod: subjectInfo.coveragePeriod,
    practitionerSelected: gfeInfo.careTeamList,
    practitionerRoleSelected: gfeInfo.careTeamList,
    gfeType: subjectInfo.gfeType,
    diagnosisList: gfeInfo.diagnosisList,
    procedureList: gfeInfo.procedureList,
    servicesList: gfeInfo.claimItemList,
    priorityLevel: gfeInfo.selectedPriority,
    submittingProvider: subjectInfo.selectedSubmitter,
    billingProvider: gfeInfo.selectedBillingProvider,
    billingProviderName: gfeInfo.selectedBillingProviderName,
    submittingProviderName: subjectInfo.selectedSubmittingProviderName,
    gfeServiceId: gfeId,
    careTeamList: gfeInfo.careTeamList,
    claimItemList: displayableClaimItemList,
  };
}

//creates summary page for each GFE to display under each GFE tab
function createSummaryForEach(props, value) {
  let num = -1;
  const listOfGFEIds = Object.keys(props.summaries);

  return listOfGFEIds.map((el, index) => {
    num += 1;
    const currentSubjectData = props.summaries[el];
    const summary = retrieveRequestSummary(
      props.subject,
      currentSubjectData,
      el
    );

    return (
      <TabPanel value={value} index={num} key={index}>
        <SummaryItem summary={summary} />
      </TabPanel>
    );
  });
}

export default function TotalSummaryGFEs(props) {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const summaryCard = (
    <React.Fragment>
      <CardContent>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="summary tabs for multiple gfes"
            >
              {createTabs(props.summaries)}
            </Tabs>
          </Box>
          {createSummaryForEach(props, value)}
        </Box>
      </CardContent>
    </React.Fragment>
  );

  return (
    <div>
      <Card variant="outlined">{summaryCard}</Card>
    </div>
  );
}
