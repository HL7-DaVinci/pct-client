import DataGridComponent from './DataGridComponent';

export default function CareTeam(props) {
    const columns = providerOptions => [
        {
            field: 'role', headerName: 'Role', editable: true, type: 'singleSelect',
            valueOptions: ['Rendering', 'Attending', 'Operating', 'Primary', "Other Operating"]
        },
        {
            field: 'provider', headerName: 'Provider', editable: true, type: 'singleSelect',
            valueOptions: providerOptions
        }
    ];

    return (
        <div style={{ width: '100%' }}>
            <DataGridComponent rows={props.rows} columns={columns(props.providerList)} edit={props.edit} add={props.addOne} delete={props.deleteOne}/>
        </div>
    )
}