import DataGridComponent, {renderRequiredHeader} from './DataGridComponent';
import { DiagnosisList, DiagnosisTypeList } from '../values/DiagnosisList';

export const columns = [
    {
        field: 'diagnosis', headerName: 'Diagnosis', editable: true, type: 'singleSelect', minWidth: 150,
        valueOptions: DiagnosisList.map(code => `${code.diagnosisCodeableConcept.coding[0].code} ${code.diagnosisCodeableConcept.coding[0].display}`),
        renderHeader: renderRequiredHeader,
        required: true
    },
    {
        field: 'type', headerName: 'Type', editable: true, type: 'singleSelect', minWidth: 150,
        valueOptions: DiagnosisTypeList.map(type => `${type.display}`),
        renderHeader: renderRequiredHeader,
        required: true
    }
];

export default function DiagnosisItem(props) {  
    return (
        <div>
        <DataGridComponent rows={props.rows} columns={columns} add={props.addOne} edit={props.edit} delete={props.deleteOne}/>
    </div>
    );
}