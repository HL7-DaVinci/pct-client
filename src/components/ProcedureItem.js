import DataGridComponent, { renderRequiredHeader } from './DataGridComponent';
import { DiagnosisList, DiagnosisTypeList } from '../values/DiagnosisList';
import { ProcedureList, ProcedureTypeList } from '../values/ProcedureList';


export const columns = [
    {
        field: 'procedure', headerName: 'Procedure', editable: true, type: 'singleSelect', minWidth: 150,
        valueOptions: ProcedureList.map(code => `${code.diagnosisCodeableConcept.coding[0].code} ${code.diagnosisCodeableConcept.coding[0].display}`),
        renderHeader: renderRequiredHeader,
        required: true
    },
    {
        field: 'type', headerName: 'Type', editable: true, type: 'singleSelect', minWidth: 150,
        valueOptions: ProcedureTypeList.map(type => `${type.display}`),
        renderHeader: renderRequiredHeader,
        required: true
    }
];

export default function ProcedureItem(props) {
    return (
        <div>
            <DataGridComponent rows={props.rows} columns={columns} add={props.addOne} edit={props.edit} delete={props.deleteOne} />
        </div>
    );
}