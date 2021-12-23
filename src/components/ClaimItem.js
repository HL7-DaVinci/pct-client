import DataGridComponent from './DataGridComponent';
import { PlaceOfServiceList } from '../values/PlaceOfService';
import { ProcedureCodes } from '../values/ProcedureCode';

export default function ClaimItem(props) {
    const columns = [
        {
            field: 'productOrService', headerName: 'Product Or Service', editable: true, type: 'singleSelect',
            valueOptions: ProcedureCodes.map(code => `${code.code}: ${code.display}`)
        },
        {
            field: 'procedureType', headerName: 'Type', editable: true, type: 'singleSelect',
            valueOptions: ['primary', 'other']
        },
        {
            field: 'estimatedDateOfService', headerName: 'Estimate Date Of Service', editable: true, type: 'date',
            valueGetter: (params) => {
                return params.value;
            }
        },
        {
            field: 'placeOfService', headerName: "Place of Service", editable: true, type: "singleSelect",
            valueOptions: PlaceOfServiceList.map(pos => pos.name)
        },
        { field: 'revenue', headerName: 'Revenue Code', editable: true, type: 'singleSelect',
            valueOptions:['450', '0250', '030x', '0730', '0762']
        },
        { field: 'unitPrice', headerName: 'Unit Price', editable: true, type: 'number' },
        { field: 'quantity', headerName: 'Quantity', editable: true, type: 'number' },
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
            <DataGridComponent rows={props.rows} columns={columns} add={props.addOne} edit={props.edit} delete={props.deleteOne}/>
        </div>
    )
}
