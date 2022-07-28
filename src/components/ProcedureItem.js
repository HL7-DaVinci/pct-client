import DataGridComponent, { renderRequiredHeader } from './DataGridComponent';
import { DiagnosisList, DiagnosisTypeList } from '../values/DiagnosisList';
import { ProcedureList, ProcedureTypeList } from '../values/ProcedureList';

import * as React from 'react';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { useCallback } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@material-ui/icons/Add'
import { IconButton, Grid } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';


const emptyList = [];


export const columns = [
    {
        field: 'procedure', headerName: 'Procedure', editable: true, type: 'singleSelect', minWidth: 150,
        valueOptions: ProcedureList.map(code => `${""}`),
        renderHeader: renderRequiredHeader,
        required: true
    },
    {
        field: 'type', headerName: 'Type', editable: true, type: 'singleSelect', minWidth: 150,
        valueOptions: ProcedureTypeList.map(type => `${type.display}`),
        renderHeader: renderRequiredHeader,
        required: true
    }
];


export default function ProcedureItem(props) {


    const [chosenType, setChosenType] = React.useState('');
    const [chosenValProcedure, setChosenValProcedure] = React.useState('');

    const handleChange = (event) => {

        console.log.apply('heres the event', event)
        setChosenType(event.target.value);
    };

    const handleChangeProvider = (event) => {
        setChosenValProcedure(event.target.value);
    };

    const updateEdit = () => {
        var ob = {};
        var num = props.rows.length;
        ob[num] = {};
        ob[num]["diagnosis"] = {}
        ob[num]["diagnosis"]["value"] = chosenType;
        props.edit(ob);
    };

    const updateEditProvider = () => {
        var ob = {};
        var num = props.rows.length;
        ob[num] = {};
        ob[num]["type"] = {}
        ob[num]["type"]["value"] = chosenValProcedure;
        props.edit(ob);
    };

    //calls updateEdit when chosenVal changes
    React.useEffect(updateEdit, [chosenType]);
    React.useEffect(updateEditProvider, [chosenValProcedure]);


    //generates options shown in menu
    function makeMenuItem(listOfOptions) {
        return listOfOptions.map(el => {
            return <MenuItem value={el}>{el}</MenuItem>
        })
    }


    const ourColumns = [
        {
            field: 'procedure', headerName: 'Procedure',
            editable: true, type: 'singleSelect',
            valueOptions: ProcedureList.map(code => `${""}`), minWidth: 185,
            renderHeader: renderRequiredHeader,
            required: true,
            renderCell: (params) => {

                //setType("role")
                return (
                    <FormControl fullWidth>
                        < Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Age"
                            value={params.formattedValue}
                            onChange={handleChange}
                        >
                            {makeMenuItem(params.colDef.valueOptions)}
                        </Select>
                    </FormControl>
                );
            }
        },
        {
            field: 'type', headerName: 'Type', editable: true, type: 'singleSelect',
            valueOptions: ProcedureTypeList.map(type => `${type.display}`), minWidth: 185,
            renderHeader: renderRequiredHeader,
            required: true,
            renderCell: (params) => {
                //set the type equal to 'provider' here
                //setType("provider")
                return (
                    <FormControl fullWidth>
                        < Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Age"
                            value={params.formattedValue}
                            onChange={handleChangeProvider}
                        >
                            {makeMenuItem(params.colDef.valueOptions)}
                        </Select>
                    </FormControl>
                );
            }
        }
    ];


    const actionColumns = [{
        field: 'actions',
        type: 'actions',
        width: 80,
        headerName: 'Actions',
        getActions: ({ id }) => [
            <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleDeleteClick(id)}
            />]
    }];

    const handleDeleteClick = (id) => (event) => {
        event.stopPropagation();
        props.deleteOne(id);
    };
    return (
        <div>
            <div style={props.style ? props.style : { width: 500 }}>
                <Grid container>
                    <IconButton aria-label="Add" onClick={() => props.addOne(props)}>
                        <AddIcon />
                    </IconButton>
                    <DataGrid
                        autoHeight
                        columns={actionColumns.concat(ourColumns)}
                        rows={props.rows}
                        disableColumnMenu={true}
                        disableColumnReorder={true}
                    />
                </Grid>
            </div >
            {/* <DataGridComponent rows={props.rows} columns={columns} add={props.addOne} edit={props.edit} delete={props.deleteOne} /> */}
        </div>
    );
}