import DataGridComponent from './DataGridComponent';
import { SupportingInfoType } from '../values/SupportingInfo';
import { PlaceOfServiceList } from '../values/PlaceOfService';

export default function SupportingInfoItem(props) {
    const columns = props => {
        if(props.selectType === "typeofbill") {
            return ([
                {
                    field: 'category', headerName: 'Category', editable: true, type: 'singleSelect', minWidth: 150,
                    valueOptions: SupportingInfoType.map(type => `${type.display}`)
                },
                {
                    field: 'value', headerName: 'Information', editable: true, type: 'string', minWidth: 150
                }
            ]);
        } else if (props.selectType === "cmspos") {
            return (
                [
                    {
                        field: 'category', headerName: 'Category', editable: true, type: 'singleSelect',minWidth: 150,
                        valueOptions: SupportingInfoType.map(type => `${type.display}`)
                    },
                    {
                        field: 'value', headerName: 'Information', editable: true, type: 'singleSelect',minWidth: 150,
                        valueOptions: PlaceOfServiceList.map(pos => pos.name)
                    }
                ]
            );
        }
    }
    return (
        <div>
            <DataGridComponent rows={props.rows} columns={columns(props)} add={props.addOne} edit={props.edit} delete={props.deleteOne}/>
        </div>
    )
};