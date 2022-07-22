import { useCallback } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@material-ui/icons/Add'
import { IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import moment from "moment";


import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Multiselect } from "multiselect-react-dropdown";
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';





import { Grid, } from '@material-ui/core';
import { TableContainer } from '@mui/material';

export default function DataGridComponent(props) {

    // const [age, setAge] = React.useState('');



    const handleEditRowsModelChange = useCallback((model) => {
        console.log('going to props.edit', model)
        props.edit(model);
        console.log('here is the model', model);
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

    // function createTableColumns(listOfColumns) {
    //     return listOfColumns.map(el => {
    //         return <TableCell >{el.headerName} </TableCell>
    //     })
    // }


    // function multiSelectOptions(listOfOptions) {
    //     let arr = [];
    //     for (let i = 0; i < listOfOptions.length; i++) {
    //         arr.push({ id: i, key: listOfOptions[i], value: listOfOptions[i] })
    //     }

    //     return arr;
    // }

    // function getChoiceOptions(listOfOptions) {
    //     return listOfOptions.map(el => {
    //         return <MenuItem value={el}>{el}</MenuItem>
    //     })

    // }

    // function createTableRows(listOfRows, props) {

    //     // console.log('this is props', props)

    //     return listOfRows.map(el => {

    //         if (el.type == "date") {
    //             return <TableCell style={{ verticalAlign: 'top' }}><TextField
    //                 size='small'
    //                 id="date"
    //                 type="date"
    //                 defaultValue={moment().format("DD-MM-YYYY hh:mm:ss")}
    //                 sx={{ width: 220, height: 20 }}
    //                 InputLabelProps={{
    //                     shrink: true,
    //                 }
    //                 }
    //             />
    //             </TableCell>
    //         }

    //         if (el.valueOptions == undefined) {
    //             return <TableCell>{handleEditRowsModelChange()}</TableCell>
    //         }
    //         return <TableCell>
    //             <FormControl fullWidth>
    //                 < Select
    //                     // options={multiSelectOptions(el.valueOptions)}
    //                     // displayValue="value"
    //                     // singleSelect

    //                     labelId="demo-simple-select-label"
    //                     id="demo-simple-select"
    //                     //value={handleEditRowsModelChange}
    //                     label="Age"
    //                     onChange={handleEditRowsModelChange}
    //                 >
    //                     {getChoiceOptions(el.valueOptions)}
    //                 </Select>
    //             </FormControl>

    //         </TableCell >
    //     })
    // }

    { console.log('these are the rows', props.rows) }


    return (

        <div style={props.style ? props.style : { width: 500 }}>


            {/* <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {createTableColumns(props.columns)}
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        <TableRow>
                            {createTableRows(props.columns, props)}
                        </TableRow>

                    </TableBody>
                </Table>
            </TableContainer> */}




            {/* <Grid container>
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
            </Grid> */}


            <Grid container>
                <IconButton aria-label="Add" onClick={() => props.add()}>
                    <AddIcon />
                </IconButton>

                <DataGrid
                    autoHeight
                    columns={actionColumns.concat(props.columns)}
                    rows={props.rows}
                    onEditRowsModelChange={handleEditRowsModelChange}
                    onChange={handleEditRowsModelChange}
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