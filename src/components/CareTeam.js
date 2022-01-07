import DataGridComponent, {renderRequiredHeader} from './DataGridComponent';

export const columns = providerOptions => [
    {
        field: 'role', headerName: 'Role', editable: true, type: 'singleSelect',
        valueOptions: ['Rendering', 'Attending', 'Operating', 'Primary', "Other Operating"], 
        renderHeader: renderRequiredHeader,
        required: true
    },
    {
        field: 'provider', headerName: 'Provider', editable: true, type: 'singleSelect',
        valueOptions: providerOptions, minWidth: 120,
        renderHeader: renderRequiredHeader,
        required: true
    }
];

export default function CareTeam(props) {
    

    return (
        <div style={{ width: '100%' }}>
            <DataGridComponent rows={props.rows} columns={columns(props.providerList)} edit={props.edit} add={props.addOne} delete={props.deleteOne}/>
        </div>
    )
}