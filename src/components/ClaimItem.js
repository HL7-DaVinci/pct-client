import DataGridComponent, { renderRequiredHeader } from "./DataGridComponent";
import { PlaceOfServiceList } from "../values/PlaceOfService";
import { ProcedureCodes } from "../values/ProcedureCode";
import * as React from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

export default function ClaimItem({ edit, rows, addOne, deleteOne }) {
  const [chosenVal, setChosenVal] = React.useState("");
  const [columnVal, setColumnVal] = React.useState("");
  const [dateValue, setDateValue] = React.useState("");
  const [endDateValue, setEndDateValue] = React.useState("");
  const [currentRow, setCurrentRow] = React.useState("");

  const handleChange = (event) => {
    setChosenVal(event.target.value);
  };
  const handleChangeType = (callType) => {
    setColumnVal(callType);
  };
  const handleChangeDate = (newValue) => {
    setDateValue(newValue);
  };
  const handleChangeEndDate = (newValue) => {
    setEndDateValue(newValue);
  };

  const updateParentEdit = () => {
    var ob = {};
    var num = currentRow;
    ob[num] = {};
    ob[num][columnVal] = {};
    ob[num][columnVal]["value"] = chosenVal;
    edit(ob);
  };
  const updateEditChosenDate = () => {
    var ob = {};
    var num = currentRow;
    ob[num] = {};
    ob[num]["estimatedDateOfService"] = {};
    ob[num]["estimatedDateOfService"]["value"] = dateValue;
    edit(ob);
  };
  
  const updateEditChosenEndDate = () => {
    var ob = {};
    var num = currentRow;
    ob[num] = {};
    ob[num]["estimatedEndDateOfService"] = {};
    ob[num]["estimatedEndDateOfService"]["value"] = endDateValue;
    edit(ob);
  };

  const updateProductServiceRow = (params) => {
    //sets in focus the item that you are editing
    if (params.hasFocus === true) {
      setCurrentRow(params.id);
    }
    //if the price is undefined (case where you add one), sets focus to the new row
    if (params.row.unitPrice === undefined) {
      setCurrentRow(params.id);
    }
  };
  //listens for change in the column and chosen value
  React.useEffect(updateParentEdit, [columnVal, chosenVal, currentRow, edit]);
  React.useEffect(updateEditChosenDate, [dateValue, currentRow, edit]);
  React.useEffect(updateEditChosenEndDate, [endDateValue, currentRow, edit]);

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
      field: "productOrService",
      headerName: "Product Or Service",
      editable: true,
      type: "singleSelect",
      valueOptions: ProcedureCodes.map(
        (code) => `${code.code}: ${code.display}`
      ),
      minWidth: 185,
      renderHeader: renderRequiredHeader,
      required: true,
      renderCell: (params) => {
        return (
          <FormControl fullWidth>
            <Select
              autoFocus={true}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="product or service"
              value={params.formattedValue}
              onChange={(event) => {
                updateProductServiceRow(params);
                handleChange(event);
                handleChangeType("productOrService");
              }}
            >
              {makeMenuItem(params.colDef.valueOptions)}
            </Select>
          </FormControl>
        );
      },
    },
    {
      field: "estimatedDateOfService",
      headerName: "Estimate Date",
      minWidth: 185,
      renderHeader: renderRequiredHeader,
      required: true,
      renderCell: (params) => {
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              inputFormat="MM/dd/yyyy"
              onChange={(event) => {
                handleChangeDate(event);
                updateProductServiceRow(params);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        );
      },
    },
    {
      field: "estimatedEndDateOfService",
      headerName: "Estimate End Date",
      minWidth: 185,
      renderHeader: renderRequiredHeader,
      required: false,
      renderCell: (params) => {
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              inputFormat="MM/dd/yyyy"
              onChange={(event) => {
                handleChangeEndDate(event);
                updateProductServiceRow(params);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        );
      },
    },
    {
      field: "unitPrice",
      headerName: "Unit Price",
      type: "number",
      minWidth: 120,
      renderHeader: renderRequiredHeader,
      required: true,
      valueGetter: (value, row) => {
        if (row.productOrService) {
          const productOrService = ProcedureCodes.find(
            (code) =>
              `${code.code}: ${code.display}` === row.productOrService
          );
          if (productOrService.unitPrice !== undefined) {
            row.unitPrice = productOrService.unitPrice;
            return row.unitPrice;
          }
        }
      },
    },
    {
      field: "quantity",
      headerName: "Quantity",
      editable: true,
      type: "number",
      minWidth: 120,
      renderHeader: renderRequiredHeader,
      required: true,
      valueGetter: (value, row) => {
        if (row.quantity === undefined) {
          row.quantity = 1;
          return row.quantity;
        } else {
          return row.quantity;
        }
      },
    },
    {
      field: "net",
      headerName: "Net",
      type: "number",
      renderHeader: renderRequiredHeader,
      required: false, //false since always loads with productOrService
      valueGetter: (value, row) => {
        if (row.unitPrice) {
          if (row.quantity === undefined) {
            row.quantity = 1;
            return row.unitPrice * row.quantity;
          } else {
            return row.unitPrice * row.quantity;
          }
        }
      },
    },
    {
      field: "placeOfService",
      headerName: "Place Of Service",
      editable: true,
      type: "singleSelect",
      valueOptions: PlaceOfServiceList.map((pos) => pos.display),
      minWidth: 185,
      required: false,
      renderCell: (params) => {
        return (
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="place of service"
              value={
                params.formattedValue === undefined ? "" : params.formattedValue
              }
              onChange={(event) => {
                handleChange(event);
                handleChangeType("placeOfService");
                updateProductServiceRow(params);
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
        style={{ display: "flex", width: "65vw", flexGrow: 1 }}
        rows={rows}
        columns={ourColumns}
        add={addOne}
        edit={edit}
        delete={deleteOne}
      />
    </div>
  );
}
