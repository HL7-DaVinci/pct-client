import DataGridComponent from './DataGridComponent';
import { PlaceOfServiceList } from '../values/PlaceOfService';
import { ProcedureCodes } from '../values/ProcedureCode';
import { RevenueCodeList } from '../values/RevenueCodeList';

export default function ClaimItem(props) {
    const columns = [
        {
            field: 'productOrService', headerName: 'Product Or Service', editable: true, type: 'singleSelect', minWidth: 200,
            valueOptions: ProcedureCodes.map(code => `${code.code}: ${code.display}`)
        },
        {
            field: 'procedureType', headerName: 'Type', editable: true, type: 'singleSelect',  minWidth: 100,
            valueOptions: ['primary', 'other']
        },
        {
            field: 'estimatedDateOfService', headerName: 'Estimate Date', editable: true, type: 'date',  minWidth: 200,
            valueGetter: (params) => {
                return params.value;
            }
        },
        {
            field: 'placeOfService', headerName: "Place of Service", editable: true, type: "singleSelect", minWidth: 200,
            valueOptions: PlaceOfServiceList.map(pos => pos.name)
        },
        { field: 'revenue', headerName: 'Revenue Code', editable: true, type: 'singleSelect', minWidth: 180,
            valueOptions: RevenueCodeList.map(code => `${code.display}`)
        },
        { field: 'unitPrice', headerName: 'Unit Price', editable: true, type: 'number',  minWidth: 120,},
        { field: 'quantity', headerName: 'Quantity', editable: true, type: 'number' , minWidth: 100,},
        {
            field: 'net', headerName: 'Net', type: 'number',
            valueGetter: (params) => {
                if (params.row.unitPrice && params.row.quantity) {
                    return params.row.unitPrice * params.row.quantity;
                }
            }
        },
    ]

    return (
        <div>
            <DataGridComponent style={{ display: 'flex', width: '300%', flexGrow: 1 }} rows={props.rows} columns={columns} add={props.addOne} edit={props.edit} delete={props.deleteOne}/>
        </div>
    )
}
