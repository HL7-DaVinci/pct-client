import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { IconButton } from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import * as React from "react";
import { Grid, Typography } from "@mui/material";

export default function DataGridComponent(props) {
  const handleDeleteClick = (id) => (event) => {
    event.stopPropagation();
    props.delete(id);
  };

  const actionColumns = [
    {
      field: "actions",
      type: "actions",
      width: 80,
      headerName: "Actions",
      getActions: ({ id }) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleDeleteClick(id)}
        />,
      ],
    },
  ];

  return (
    <div style={props.style ? props.style : { width: 500 }}>
      <Grid container>
        <IconButton aria-label="Add" onClick={() => props.add(props.columns)}>
          <AddIcon />
        </IconButton>
        <DataGrid
          autoHeight
          columns={actionColumns.concat(props.columns)}
          rows={props.rows}
          disableColumnMenu={true}
          disableColumnReorder={true}
          disableMultipleSelection={true}
        />
      </Grid>
    </div>
  );
}

export function renderRequiredHeader(params) {
  return (
    <Typography>
      {params.colDef.required
        ? params.colDef.headerName + " *"
        : params.colDef.headerName}
    </Typography>
  );
}
