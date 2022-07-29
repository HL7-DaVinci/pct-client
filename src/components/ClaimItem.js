import DataGridComponent, { renderRequiredHeader } from './DataGridComponent';
import { PlaceOfServiceList } from '../values/PlaceOfService';
import { ProcedureCodes } from '../values/ProcedureCode';
import * as React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

//keep columns for GFERequestPanel
export const columns = [
    {
        field: 'productOrService', headerName: 'Product Or Service', editable: true, type: 'singleSelect', minWidth: 200,
        valueOptions: ProcedureCodes.map(code => `${code.code}: ${code.display}`),
        renderHeader: renderRequiredHeader,
        required: true
    },
    {
        field: 'estimatedDateOfService', headerName: 'Estimate Date', editable: true, type: 'date', minWidth: 250,
        renderHeader: renderRequiredHeader,
        required: true
    },
    {
        field: 'unitPrice', headerName: 'Unit Price', type: 'number', minWidth: 120,
        renderHeader: renderRequiredHeader,
        required: true,
        valueGetter: (params) => {
            if (params.row.productOrService) {
                const productOrService = ProcedureCodes.find(code => `${code.code}: ${code.display}` === params.row.productOrService);
                if (productOrService.unitPrice !== undefined) {
                    params.row.unitPrice = productOrService.unitPrice;
                    return params.row.unitPrice;
                }
            }
        }
    },
    {
        field: 'quantity', headerName: 'Quantity', editable: true, type: 'number', minWidth: 120,
        renderHeader: renderRequiredHeader,
        required: true,
        valueGetter: (params) => {
            if (params.row.quantity === undefined) {
                params.row.quantity = 1;
                return params.row.quantity;
            } else {
                return params.row.quantity;
            }
        }
    },
    {
        field: 'net', headerName: 'Net', type: 'number',
        renderHeader: renderRequiredHeader,
        valueGetter: (params) => {
            if (params.row.unitPrice) {
                if (params.row.quantity === undefined) {
                    params.row.quantity = 1;
                    return params.row.unitPrice * params.row.quantity;
                } else {
                    return params.row.unitPrice * params.row.quantity;
                }
            }
        }
    },
    {
        field: 'placeOfService', headerName: "Place of Service", editable: true, type: "singleSelect", minWidth: 200,
        valueOptions: PlaceOfServiceList.map(pos => pos.display)
    }
];

export default function ClaimItem(props) {

    const [chosenVal, setChosenVal] = React.useState("");
    const [columnVal, setColumnVal] = React.useState("");
    const [dateValue, setDateValue] = React.useState("");


    const handleChange = (event) => {
        setChosenVal(event.target.value);
    };
    const handleChangeType = (callType) => {
        setColumnVal(callType);
    };
    const handleChangeDate = (newValue) => {
        setDateValue(newValue);
    };

    const updateParentEdit = () => {
        var ob = {};
        var num = props.rows.length;
        ob[num] = {};
        ob[num][columnVal] = {}
        ob[num][columnVal]["value"] = chosenVal;
        props.edit(ob);
    };
    const updateEditChosenDate = () => {
        var ob = {};
        var num = props.rows.length;
        ob[num] = {};
        ob[num]["estimatedDateOfService"] = {}
        ob[num]["estimatedDateOfService"]["value"] = dateValue;
        props.edit(ob);
    };

    //TODO: ensure change happens on both columnVal and chosenVal
    React.useEffect(updateParentEdit, [columnVal]);
    React.useEffect(updateEditChosenDate, [dateValue]);


    //generates options shown in menu
    function makeMenuItem(listOfOptions) {
        return listOfOptions.map(el => {
            return <MenuItem value={el}>{el}</MenuItem>
        })
    }


    const ourColumns = [
        {
            field: 'productOrService', headerName: 'Product Or Service',
            editable: true, type: 'singleSelect',
            valueOptions: ProcedureCodes.map(code => `${code.code}: ${code.display}`), minWidth: 185,
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
                            onChange={event => { handleChange(event); handleChangeType("productOrService") }}
                        >
                            {makeMenuItem(params.colDef.valueOptions)}
                        </Select>
                    </FormControl>
                );
            }
        },
        {
            field: 'estimatedDateOfService', headerName: 'Estimate Date',
            minWidth: 185,
            renderHeader: renderRequiredHeader,
            required: true,
            renderCell: (params) => {
                return (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DesktopDatePicker
                            inputFormat="MM/dd/yyyy"
                            value={params.formattedValue == undefined ? "" : params.formattedValue}
                            onChange={handleChangeDate}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                );
            }
        },
        {
            field: 'unitPrice', headerName: 'Unit Price', type: 'number', minWidth: 120,
            renderHeader: renderRequiredHeader,
            required: true,
            valueGetter: (params) => {
                if (params.row.productOrService) {
                    const productOrService = ProcedureCodes.find(code => `${code.code}: ${code.display}` === params.row.productOrService);
                    if (productOrService.unitPrice !== undefined) {
                        params.row.unitPrice = productOrService.unitPrice;
                        return params.row.unitPrice;
                    }
                }
            }
        },
        {
            field: 'quantity', headerName: 'Quantity', editable: true, type: 'number', minWidth: 120,
            renderHeader: renderRequiredHeader,
            required: true,
            valueGetter: (params) => {
                if (params.row.quantity === undefined) {
                    params.row.quantity = 1;
                    return params.row.quantity;
                } else {
                    return params.row.quantity;
                }
            }
        },
        {
            field: 'net', headerName: 'Net', type: 'number',
            renderHeader: renderRequiredHeader,
            valueGetter: (params) => {
                if (params.row.unitPrice) {
                    if (params.row.quantity === undefined) {
                        params.row.quantity = 1;
                        return params.row.unitPrice * params.row.quantity;
                    } else {
                        return params.row.unitPrice * params.row.quantity;
                    }
                }
            }
        },
        {
            field: 'placeOfService', headerName: 'Place Of Service',
            editable: true, type: 'singleSelect',
            valueOptions: PlaceOfServiceList.map(pos => pos.display), minWidth: 185,
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
                            onChange={event => { handleChange(event); handleChangeType("placeOfService") }}
                        >
                            {makeMenuItem(params.colDef.valueOptions)}
                        </Select>
                    </FormControl>
                );
            }
        },
    ];

    return (
        <div>
            <DataGridComponent style={{ display: 'flex', width: '65vw', flexGrow: 1 }} rows={props.rows} columns={ourColumns} add={props.addOne} edit={props.edit} delete={props.deleteOne} />
        </div>
    )
}
