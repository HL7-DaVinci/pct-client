import React from 'react';
import { Typography, CardContent, Card, Box } from '@material-ui/core'
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SummaryItem from "./SummaryItem";


function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`multiple-gfe-tabpanel-${index}`}
            aria-labelledby={`multiple-gfe-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

//creates tabs based on the GFE id's
function createTabs(tabsList) {
    let num = 0;
    const listOfGFEKeys = Object.keys(tabsList);

    return listOfGFEKeys.map(el => {
        num += 1;
        return <Tab label={el} key={num} />
    })
}

function retrieveRequestSummary(subjectInfo, gfeInfo) {
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
        practitionerSelected:
            gfeInfo.careTeamList,
        practitionerRoleSelected:
            gfeInfo.careTeamList,
        gfeType: '', //this.props.gfeType, //TODO
        diagnosisList: gfeInfo.diagnosisList,
        procedureList: gfeInfo.procedureList,
        servicesList: gfeInfo.claimItemList,
        priorityLevel:
            gfeInfo.selectedPriority,
        serviceDate: "", //this.state.selectedDate, //TODO
        submittingProvider: subjectInfo.selectedSubmitter,
        billingProvider:
            gfeInfo.selectedBillingProvider,
        gfeServiceId: gfeInfo.gfeServiceId,
    };
};

//creates summary page for each GFE to display under each GFE tab
function createSummaryForEach(props, value) {
    let num = -1;
    const listOfGFEIds = Object.keys(props.summaries);

    return listOfGFEIds.map(el => {
        num += 1;
        const currentSubjectData = props.summaries[el]
        const summary = retrieveRequestSummary(props.subject, currentSubjectData);

        return <TabPanel value={value} index={num}>
            {/* TODO */}
            {el}
            < SummaryItem summary={summary} />
        </TabPanel>

    })
}

export default function TotalSummaryGFEs(props) {
    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const summaryCard = (
        <React.Fragment>
            <CardContent justifyContent="left" >
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value} onChange={handleChange} aria-label="summary tabs for multiple gfes">
                            {createTabs(props.summaries)}
                        </Tabs>
                    </Box>
                    {createSummaryForEach(props, value)}
                </Box>
            </CardContent>
        </React.Fragment >
    )

    return (
        <div>
            <Card variant="outlined">{summaryCard}</Card>
        </div>
    )
}



