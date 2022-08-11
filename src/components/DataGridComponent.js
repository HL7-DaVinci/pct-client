import { useCallback } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@material-ui/icons/Add'
import { IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import * as React from 'react';
import { Grid, } from '@material-ui/core';

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

    return (
        <div style={props.style ? props.style : { width: 500 }}>
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