import DataGridComponent from './DataGridComponent';
import { DiagnosisList, DiagnosisTypeList } from '../values/DiagnosisList';

export default function DiagnosisItem(props) {
    const columns = [
        {
            field: 'diagnosis', headerName: 'Diagnosis', editable: true, type: 'singleSelect',
            valueOptions: DiagnosisList.map(code => `${code.diagnosisCodeableConcept.coding[0].code} ${code.diagnosisCodeableConcept.coding[0].display}`)
        },
        {
            field: 'type', headerName: 'Type', editable: true, type: 'singleSelect',
            valueOptions: DiagnosisTypeList.map(type => `${type.display}`)
        }
    ];
    return (
        <div>
        <DataGridComponent rows={props.rows} columns={columns} add={props.addOne} edit={props.edit} delete={props.deleteOne}/>
    </div>
    );
}