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





// function MyComponent(value) {
//     const [chosenVal, setChosenVal] = React.useState('');

//     console.log('this is the component value in component', value)
//     // const handleClick = useCallback((model) => {

//     //     //console.log(model)
//     //     // handle the click event
//     //     return model
//     // });

//     // return handleClick();
//     // //return //<MyChild onClick={handleClick} />;

// }

// function editCareTeamVal(value, column) {

//     console.log('this is the value selected', value);
//     console.log('this is the column its under', column);

//     ChangeValue(value)

// }

// const ChangeValue = (value) => {
//     const [chosenVal, setChosenVal] = React.useState('');

//     //setAge(event.target.value);
//     //console.log('here is the event', event.target.value);
//     //return event.target.value
//     //setChosenVal(event.target.value);
//     setChosenVal(value);
//     console.log('heres the hook chosen val', chosenVal);

// };





// const handleChange = (event) => {
//     //setAge(event.target.value);
//     //console.log('here is the event', event.target.value);
//     //return event.target.value
//     //setChosenVal(event.target.value);
//     const value = event.target.value
//     console.log('this is before send it to component', value)
//     //MyComponent(value);
//     editCareTeamVal(value, '');

// };




export const columns = props => [
    {


        field: 'role', headerName: 'Role',
        editable: true, type: 'singleSelect',
        valueOptions: ['Rendering', 'Attending', 'Operating', 'Primary', "Other Operating"], minWidth: 185,
        renderHeader: renderRequiredHeader,
        required: true,
        renderCell: (params) => {
            console.log(params)

            return (
                <FormControl fullWidth>

                    < Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        //value={handleEditRowsModelChange}
                        label="Age"
                    //onChange={handleChange}//props.edit(MyComponent())}
                    //onEditRowsModelChange={props.edit(MyComponent())}

                    >
                        <MenuItem value={'Rendering'}>Rendering</MenuItem>
                        <MenuItem value={'Attending'}>Attending</MenuItem>
                        <MenuItem value={'Operating'}>Operating</MenuItem>
                        <MenuItem value={'Primary'}>Primary</MenuItem>
                        <MenuItem value={'Other Operating'}>Other Operating</MenuItem>
                    </Select>
                </FormControl>
            );
        }
    },
    {
        field: 'provider', headerName: 'Provider', editable: true, type: 'singleSelect',
        valueOptions: props.providerList, minWidth: 185,
        renderHeader: renderRequiredHeader,
        required: true
    }
];





export default function CareTeam(props) {

    const [chosenVal, setChosenVal] = React.useState('');
    const [chosen, setChosen] = React.useState(false);
    const [editDone, setEdit] = React.useState(false);



    const handleChange = (event) => {
        //if (!chosen) {
        console.log(event.target.value);
        setChosenVal(event.target.value);
        console.log(chosenVal)
        //updateEdit();

    };


    const updateEdit = () => {

        console.log('here is the chosen val', chosenVal)


        var ob = {};
        ob["1"] = {};
        ob["1"]["role"] = {}
        ob["1"]["role"]["value"] = chosenVal;
        console.log('object before it goes to edit', ob);
        props.edit(ob);

        console.log('props here', props)
        console.log('edited value')
    };




    const ourColumns = [
        {
            field: 'role', headerName: 'Role',
            editable: true, type: 'singleSelect',
            valueOptions: ['Rendering', 'Attending', 'Operating', 'Primary', "Other Operating"], minWidth: 185,
            renderHeader: renderRequiredHeader,
            required: true,
            renderCell: (params) => {
                // console.log(params)
                // if (chosenVal != '') {
                //     var ob = {};
                //     ob["1"] = {};
                //     ob["1"]["role"] = {}
                //     ob["1"]["role"]["value"] = chosenVal;
                //     props.edit(ob);
                // }

                return (
                    <FormControl fullWidth>
                        < Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Age"
                            value={chosenVal}
                            onChange={e => setChosenVal(e.target.value)}
                        >
                            <MenuItem value={'Rendering'}>Rendering</MenuItem>
                            <MenuItem value={'Attending'}>Attending</MenuItem>
                            <MenuItem value={'Operating'}>Operating</MenuItem>
                            <MenuItem value={'Primary'}>Primary</MenuItem>
                            <MenuItem value={'Other Operating'}>Other Operating</MenuItem>
                        </Select>
                    </FormControl>
                );
            }
        },
        {
            field: 'provider', headerName: 'Provider', editable: true, type: 'singleSelect',
            valueOptions: props.providerList, minWidth: 185,
            renderHeader: renderRequiredHeader,
            required: true
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

    // const handleEditRowsModelChange = useCallback((model) => {
    //     console.log('going to props.edit', model)
    //     props.edit(model);
    //     console.log('here is the model', model);
    // }, []);

    const handleDeleteClick = (id) => (event) => {
        event.stopPropagation();
        props.delete(id);
    };


    updateEdit();



    //console.log(chosenVal)

    // if (editDone == false) { //if it hasn't been updated yet, then update it 
    //     updateEdit();
    //     setEdit(true);
    // } else {
    //     //setEdit()
    // }
    return (
        <div style={{ width: '100%' }}>
            {/* <DataGridComponent rows={props.rows} columns={columns(props)} edit={props.edit} add={props.addOne} delete={props.deleteOne} /> */}

            <div style={props.style ? props.style : { width: 500 }}>
                <Grid container>
                    <IconButton aria-label="Add" onClick={() => props.add()}>
                        <AddIcon />
                    </IconButton>

                    <DataGrid
                        autoHeight
                        columns={actionColumns.concat(ourColumns)}
                        rows={props.rows}
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


