import { useCallback } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@material-ui/icons/Add'
import { IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@mui/icons-material/Edit';

import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Multiselect } from "multiselect-react-dropdown";


import {

    Grid,

} from '@material-ui/core';
import { TableContainer } from '@mui/material';

export default function DataGridComponent(props) {
    const handleEditRowsModelChange = useCallback((model) => {
        props.edit(model);
    }, []);

    const handleDeleteClick = (id) => (event) => {
        event.stopPropagation();
        props.delete(id);
    };

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
    console.log('PROPS', props);

    function createTableColumns(listOfColumns) {
        return listOfColumns.map(el => {
            return <TableCell >{el.headerName} </TableCell>
        })
    }


    function multiSelectOptions(listOfOptions) {
        let arr = [];
        for (let i = 0; i < listOfOptions.length; i++) {
            arr.push({ id: i, key: listOfOptions[i], value: listOfOptions[i] })
        }
        return arr;
    }

    function createTableRows(listOfRows) {
        console.log(listOfRows)
        return listOfRows.map(el => {
            console.log('el', el.valueOptions)
            return <TableCell>
                < Multiselect
                    options={multiSelectOptions(el.valueOptions)}
                    displayValue="value"
                    singleSelect
                    onSelect={handleEditRowsModelChange}
                />
            </TableCell >
        })
    }

    return (

        <div style={props.style ? props.style : { width: 500 }}>

            {/*
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {createTableColumns(props.columns)}
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        <TableRow>
                            {createTableRows(props.columns)}
                        </TableRow>

                    </TableBody>
                </Table>
            </TableContainer>
        */}

            <Grid container>
                <IconButton aria-label="Add" onClick={() => props.add()}>
                    <AddIcon />
                </IconButton>

                <DataGrid
                    autoHeight
                    columns={actionColumns.concat(props.columns)}
                    rows={props.rows}
                    onEditRowsModelChange={handleEditRowsModelChange}
                    disableColumnMenu={true}
                    disableColumnReorder={true}
                />
            </Grid>
        </div >
    )
}

export function renderRequiredHeader(params) {
    return (
        <text>
            {params.colDef.headerName + ' *'}
        </text>
    );
}