import DataGridComponent, { renderRequiredHeader } from './DataGridComponent';
import { PlaceOfServiceList } from '../values/PlaceOfService';
import { ProcedureCodes } from '../values/ProcedureCode';

export const columns = [
    {
        field: 'productOrService', headerName: 'Product Or Service', editable: true, type: 'singleSelect', minWidth: 200,
        valueOptions: ProcedureCodes.map(code => `${code.code}: ${code.display}`),
        renderHeader: renderRequiredHeader,
        required: true
    },
    {
        field: 'estimatedDateOfService', headerName: 'Estimate Date', editable: true, type: 'date', minWidth: 120,
        valueGetter: (params) => {

            return params.value;
        },
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
    return (
        <div>
            <DataGridComponent style={{ display: 'flex', width: '65vw', flexGrow: 1 }} rows={props.rows} columns={columns} add={props.addOne} edit={props.edit} delete={props.deleteOne} />
        </div>
    )
}
