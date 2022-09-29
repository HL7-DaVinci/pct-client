import DataGridComponent, { renderRequiredHeader } from "./DataGridComponent";
import { ProcedureList, ProcedureTypeList } from "../values/ProcedureList";
import * as React from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

export default function ProcedureItem({ edit, rows, addOne, deleteOne }) {
  const [chosenVal, setChosenVal] = React.useState("");
  const [columnVal, setColumnVal] = React.useState("");
  const [currentRow, setCurrentRow] = React.useState("");

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

  React.useEffect(updateParentEdit, [columnVal, chosenVal, currentRow, edit]);

  const updateProductServiceRow = (params) => {
    //sets in focus the item that you are editing
    if (params.hasFocus === true) {
      setCurrentRow(params.id);
    }
  };

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
      field: "procedure",
      headerName: "Procedure",
      editable: true,
      type: "singleSelect",
      valueOptions: ProcedureList.map((code) => `${""}`),
      minWidth: 185,
      renderHeader: renderRequiredHeader,
      required: true,
      renderCell: (params) => {
        return (
          <FormControl fullWidth>
            <Select
              labelId="procedure-select"
              id="procedure-select"
              label="procedure"
              value={params.formattedValue}
              onChange={(event) => {
                updateProductServiceRow(params);
                handleChange(event);
                handleChangeType("procedure");
              }}
            >
              {makeMenuItem(params.colDef.valueOptions)}
            </Select>
          </FormControl>
        );
      },
    },
    {
      field: "type",
      headerName: "Type",
      editable: true,
      type: "singleSelect",
      valueOptions: ProcedureTypeList.map((type) => `${type.display}`),
      minWidth: 185,
      renderHeader: renderRequiredHeader,
      required: true,
      renderCell: (params) => {
        return (
          <FormControl fullWidth>
            <Select
              labelId="type-select"
              id="type-select"
              label="type"
              value={params.formattedValue}
              onChange={(event) => {
                updateProductServiceRow(params);
                handleChange(event);
                handleChangeType("type");
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
    <div>
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
