import * as React from 'react';

import DataGridComponent, { renderRequiredHeader } from './DataGridComponent';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { useCallback } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@material-ui/icons/Add'
import { IconButton, Grid } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';









//need function for GFERequestPanel
export const columns = props => [
    {
        field: 'role', headerName: 'Role',
        editable: true, type: 'singleSelect',
        valueOptions: ['Rendering', 'Attending', 'Operating', 'Primary', "Other Operating"], minWidth: 185,
        renderHeader: renderRequiredHeader,
        required: true,
    },
    {
        field: 'provider', headerName: 'Provider', editable: true, type: 'singleSelect',
        valueOptions: ['Rendering', 'Attending', 'Operating', 'Primary', "Other Operating"], minWidth: 185, //need to put in the correct doctors here for new rows added
        renderHeader: renderRequiredHeader,
        required: true
    }
];



export default function CareTeam(props) {

    const [chosenVal, setChosenVal] = React.useState('');
    const [chosenValProvider, setChosenValProvider] = React.useState('');

    const handleChange = (event) => {
        setChosenVal(event.target.value);
    };

    const handleChangeProvider = (event) => {
        setChosenValProvider(event.target.value);
    };

    const updateEdit = () => {
        var ob = {};
        var num = props.rows.length;
        ob[num] = {};
        ob[num]["role"] = {}
        ob[num]["role"]["value"] = chosenVal;
        props.edit(ob);
    };

    const updateEditProvider = () => {
        var ob = {};
        var num = props.rows.length;
        ob[num] = {};
        ob[num]["provider"] = {}
        ob[num]["provider"]["value"] = chosenValProvider;
        props.edit(ob);
    };

    //calls updateEdit when chosenVal changes
    React.useEffect(updateEdit, [chosenVal]);
    React.useEffect(updateEditProvider, [chosenValProvider]);


    //generates options shown in menu
    function makeMenuItem(listOfOptions) {
        return listOfOptions.map(el => {
            return <MenuItem value={el}>{el}</MenuItem>
        })
    }


    const ourColumns = [
        {
            field: 'role', headerName: 'Role',
            editable: true, type: 'singleSelect',
            valueOptions: ['Rendering', 'Attending', 'Operating', 'Primary', "Other Operating"], minWidth: 185,
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
            field: 'provider', headerName: 'Provider', editable: true, type: 'singleSelect',
            valueOptions: props.providerList, minWidth: 185,
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
        <div style={{ width: '100%' }}>
            <div style={props.style ? props.style : { width: 500 }}>
                <Grid container>
                    <IconButton aria-label="Add" onClick={() => props.addOne(props)}>
                        <AddIcon />
                    </IconButton>
                    <DataGrid
                        autoHeight
                        columns={actionColumns.concat(ourColumns)}
                        rows={props.rows}//sampleRows}
                        //onEditRowsModelChange={handleEditRowsModelChange}
                        //onChange={handleEditRowsModelChange}
                        disableColumnMenu={true}
                        disableColumnReorder={true}
                    />
                </Grid>
            </div >
        </div>
    )
}


