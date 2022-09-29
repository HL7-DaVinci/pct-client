import * as React from "react";
import DataGridComponent, { renderRequiredHeader } from "./DataGridComponent";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

export default function CareTeam({
  edit,
  providerList,
  rows,
  addOne,
  deleteOne,
}) {
  const [chosenVal, setChosenVal] = React.useState("");
  const [columnVal, setColumnVal] = React.useState("");
  const [currentRow, setCurrentRow] = React.useState("");

  const updateProductServiceRow = (params) => {
    //sets in focus the item that you are editing
    if (params.hasFocus === true) {
      setCurrentRow(params.id);
    }
  };

  const handleChange = (event) => {
    setChosenVal(event.target.value);
  };

  const handleChangeType = (callType) => {
    setColumnVal(callType);
  };

  const updateParentEdit = () => {
    var ob = {};
    var num = currentRow;
    ob[num] = {};
    ob[num][columnVal] = {};
    ob[num][columnVal]["value"] = chosenVal;
    edit(ob);
  };

  //calls edit on the parent whenever a column or chosen value is changed
  React.useEffect(updateParentEdit, [columnVal, chosenVal, edit, currentRow]);

  //generates options shown in menu
  function makeMenuItem(listOfOptions) {
    return listOfOptions.map((el, index) => {
      return (
        <MenuItem value={el} key={index}>
          {el}
        </MenuItem>
      );
    });
  }

  const ourColumns = [
    {
      field: "role",
      headerName: "Role",
      editable: true,
      type: "singleSelect",
      valueOptions: [
        "Rendering",
        "Attending",
        "Operating",
        "Primary",
        "Other Operating",
      ],
      minWidth: 185,
      renderHeader: renderRequiredHeader,
      required: true,
      renderCell: (params) => {
        return (
          <FormControl fullWidth>
            <Select
              labelId="role-select"
              id="role-select"
              label="Role"
              value={params.value || ""}
              onChange={(event) => {
                updateProductServiceRow(params);
                handleChange(event);
                handleChangeType("role");
              }}
            >
              {makeMenuItem(params.colDef.valueOptions)}
            </Select>
          </FormControl>
        );
      },
    },
    {
      field: "provider",
      headerName: "Provider",
      editable: true,
      type: "singleSelect",
      valueOptions: providerList,
      minWidth: 185,
      renderHeader: renderRequiredHeader,
      required: true,
      renderCell: (params) => {
        return (
          <FormControl fullWidth>
            <Select
              labelId="provider-select"
              id="provider-select"
              label="provider"
              value={params.formattedValue || ""}
              onChange={(event) => {
                updateProductServiceRow(params);
                handleChange(event);
                handleChangeType("provider");
              }}
            >
              {makeMenuItem(params.colDef.valueOptions)}
            </Select>
          </FormControl>
        );
      },
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <DataGridComponent
        rows={rows}
        columns={ourColumns}
        add={addOne}
        edit={edit}
        delete={deleteOne}
      />
    </div>
  );
}
