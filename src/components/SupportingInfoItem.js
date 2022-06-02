import DataGridComponent, {renderRequiredHeader} from './DataGridComponent';
import { SupportingInfoType } from '../values/SupportingInfo';
import { PlaceOfServiceList } from '../values/PlaceOfService';

export const TypeOfBillColumns = [
    {
        field: 'category', headerName: 'Category', editable: true, type: 'singleSelect', minWidth: 150,
        valueOptions: SupportingInfoType.map(type => `${type.display}`), 
        renderHeader: renderRequiredHeader,
        required: true
    },
    {
        field: 'value', headerName: 'Information', editable: true, type: 'string', minWidth: 150, 
        renderHeader: renderRequiredHeader,
        required: true
    }
];

export const PlaceOfServiceColumns = [
    {
        field: 'category', headerName: 'Category', editable: true, type: 'singleSelect',minWidth: 150,
        valueOptions: SupportingInfoType.map(type => `${type.display}`), 
        renderHeader: renderRequiredHeader,
        required: true
    },
    {
        field: 'value', headerName: 'Information', editable: true, type: 'singleSelect',minWidth: 150,
        valueOptions: PlaceOfServiceList.map(pos => pos.display), 
        renderHeader: renderRequiredHeader,
        required: true
    }
];

export default function SupportingInfoItem(props) {  
    return (
        <div>
            <DataGridComponent rows={props.rows} columns={props.columns} add={props.addOne} edit={props.edit} delete={props.deleteOne}/>
        </div>
    )
};