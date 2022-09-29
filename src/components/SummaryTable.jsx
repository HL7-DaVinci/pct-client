import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";

export function SummaryTable({ headers, data }) {
  return (
    <TableContainer
      component={Box}
      sx={{
        backgroundColor: "#DCDCDC",
        border: "2px solid #C0C0C0",
        marginTop: "10px",
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
              <TableCell sx={{ border: "2px solid #C0C0C0" }} key={index}>
                {header.display}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={{ borderColor: "black" }}>
          {data.map((d) => (
            <TableRow key={d.id} sx={{ border: "2px solid #C0C0C0" }}>
              {headers.map((header, index) => (
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ border: "2px solid #C0C0C0" }}
                  key={index}
                >
                  {d[header.value]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
