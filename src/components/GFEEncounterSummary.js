import React from 'react';
import { FormLabel, FormControl, Grid, Typography, CardContent, Card, Box } from '@mui/material'
import { createStyles, makeStyles } from "@mui/styles";
import DiagnosisItem, { columns as DiagnosisColumns } from './DiagnosisItem';



const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            minWidth: "50vw",
            textAlign: "left",
            marginLeft: 0,
            color: theme.palette.text.secondary,
            backgroundColor: "#D3D3D3"
        }
    }),

);


export default function GFEEncounterSummary(props) {
    const classes = useStyles();
    const { summary } = props;

    const SummaryText = props => (
        <div>
            <Typography variant="subtitle1" component="h3" className={classes.card}>
                {props.content}
            </Typography>
        </div>
    )

    const addOneDiagnosisItem = () => {
        let valid = true, msg = undefined;
        if (this.state.careTeamList.length > 0) {
            const requiredColumns = DiagnosisColumns.filter(column => column.required);
            const fields = this.extractFieldNames(requiredColumns);
            msg = `Complete adding existing diagnosis before adding a new one! ${fields} are required fields.`;
            valid = this.state.diagnosisList.every(item => {
                return requiredColumns.every(column => item[column.field] !== undefined);
            })
        }
        if (valid) {
            const newId = this.state.diagnosisList.length + 1;
            this.setState({
                diagnosisList: [...this.state.diagnosisList, { id: newId }]
            });
        } else {
            alert(msg);
        }
    }

    const deleteOneDiagnosisItem = id => {
        this.setState({
            diagnosisList: this.state.diagnosisList.filter(item => item.id !== id)
        })
    }

    const editDiagnosisItem = model => {
        let id, fieldObject, fieldName, fieldValueObject, fieldValue;
        for (let prop in model) {
            id = prop;
            fieldObject = model[id];
        }
        if (fieldObject) {
            for (let name in fieldObject) {
                fieldName = name;
            }
            fieldValueObject = fieldObject[fieldName];
        }
        if (fieldValueObject) {
            fieldValue = fieldValueObject.value;
        }
        if (id && fieldName && fieldValue) {
            this.setState({
                diagnosisList: this.state.diagnosisList.map(item => {
                    if (item.id === parseInt(id)) {
                        item[fieldName] = fieldValue;
                        return item;
                    } else {
                        return item;
                    }
                })
            });
        }
    }


    const card = (
        <React.Fragment>
            <CardContent justifyContent="left" className={classes.card}>
                <Grid container>
                    <Grid item xs={6} >
                        <Box sx={{ mb: 2 }}>
                            <SummaryText content="Service Details:" class="label" />
                        </Box>
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item xs={6} >
                        <FormControl>
                            <FormLabel>Diagnosis *</FormLabel>
                            <DiagnosisItem rows={summary.diagnosisList} />
                        </FormControl>
                    </Grid>
                </Grid>
            </CardContent>
        </React.Fragment >
    )

    return (
        <div>
            <Card variant="outlined">{card}</Card>
        </div>
    )
}



