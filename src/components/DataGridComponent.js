import { useCallback } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@material-ui/icons/Add'
import { IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

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
        getActions: ({ id }) => [
            <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleDeleteClick(id)}
            />]
    }];

    return (
        <div style={props.style ? props.style : { display: 'flex', width: '100%' }}>
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
        </div>
    )
}