import * as React from 'react';
import DataGridComponent, { renderRequiredHeader } from './DataGridComponent';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


//keep columns for GFERequestPanel
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
        valueOptions: ['Rendering', 'Attending', 'Operating', 'Primary', "Other Operating"], minWidth: 185,
        renderHeader: renderRequiredHeader,
        required: true
    }
];


export default function CareTeam(props) {

    const [chosenVal, setChosenVal] = React.useState('');
    const [columnVal, setColumnVal] = React.useState('');

    const handleChange = (event) => {
        setChosenVal(event.target.value);
    };

    const handleChangeType = (callType) => {
        setColumnVal(callType);
    };

    const updateParentEdit = () => {
        var ob = {};
        var num = props.rows.length;
        ob[num] = {};
        ob[num][columnVal] = {}
        ob[num][columnVal]["value"] = chosenVal;
        props.edit(ob);
    };

    //TODO: ensure change happens on both typeVal and chosenVal
    React.useEffect(updateParentEdit, [columnVal]);

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
                return (
                    <FormControl fullWidth>
                        < Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Age"
                            value={params.formattedValue}
                            onChange={event => { handleChange(event); handleChangeType("role") }}
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
                return (
                    <FormControl fullWidth>
                        < Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Age"
                            value={params.formattedValue}
                            onChange={event => { handleChange(event); handleChangeType("provider") }}
                        >
                            {makeMenuItem(params.colDef.valueOptions)}
                        </Select>
                    </FormControl>
                );
            }
        }
    ];


    return (
        <div style={{ width: '100%' }}>
            <DataGridComponent rows={props.rows} columns={ourColumns} add={props.addOne} edit={props.edit} delete={props.deleteOne} />
        </div>
    )
}


