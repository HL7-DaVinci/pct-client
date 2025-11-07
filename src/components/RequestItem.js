import DataGridComponent, { renderRequiredHeader } from "./DataGridComponent";
import * as React from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {getExpandedValueset} from '../api';
import { useContext } from "react";
import { AppContext } from "../Context";
import {Box} from "@mui/material";

export default function RequestItem({ rows, setRows, addOne, edit, deleteOne, valueSetUrl }) {
    const appContext = useContext(AppContext);
    const [searchOpen, setSearchOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
    const [searchResults, setSearchResults] = React.useState([]);
    const [searchRowId, setSearchRowId] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [searchPerformed, setSearchPerformed] = React.useState(false);

    const handleSearchClick = (rowId) => {
        setSearchRowId(rowId);
        setSearchOpen(true);
        setSearchValue("");
        setSearchResults([]);
        setSearchPerformed(false);
    };

    const handleSearchClose = () => {
        setSearchOpen(false);
        setSearchValue("");
        setSearchResults([]);
        setSearchRowId(null);
        setSearchPerformed(false);
    };

    const handleSearchSubmit = async () => {
        setLoading(true);
        setSearchPerformed(true);
        try {
            const results = await getExpandedValueset(appContext.dataServer, valueSetUrl, searchValue);
            setSearchResults(results.filter(r =>
                r.code?.toLowerCase().includes(searchValue.toLowerCase()) ||
                r.display?.toLowerCase().includes(searchValue.toLowerCase())
            ));
        } catch (e) {
            setSearchResults([]);
        }
        setLoading(false);
    };

    const handleResultSelect = (result) => {
        if (searchRowId !== null) {
            setRows(prevRows => prevRows.map(row => {
                if (row.id === searchRowId) {
                    return { ...row, code: result.code || "", description: result.display || "", system: result.system || "", id: searchRowId };
                }
                return row;
            }));
        }
        handleSearchClose();
    };

    const columns = [
        {
            field: "description",
            headerName: "Description",
            renderHeader: renderRequiredHeader,
            minWidth:  150,
            flex: 1.0,
            editable: false,
            renderCell: (params) => (
                <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "center", height: "100%" }}>
                    <TextField
                        value={params.value || ""}
                        variant="outlined"
                        fullWidth
                        size="small"
                        InputProps={{ style: { background: '#fff', margin: 0, padding: 0 }, readOnly: true }}
                        sx={{ my: 'auto' }}
                    />
                    <IconButton
                        aria-label="search description"
                        onClick={() => handleSearchClick(params.id)}
                        size="small"
                        style={{ marginLeft: 4 }}
                    >
                        <SearchIcon fontSize="small" />
                    </IconButton>
                </div>
            ),
        },
        {
            field: "code",
            headerName: "Code",
            minWidth: 80,
            flex: 0.7,
            editable: false,
            renderCell: (params) => (
                <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "center", height: "100%" }}>
                    <TextField
                        value={params.value || ""}
                        variant="outlined"
                        fullWidth
                        size="small"
                        InputProps={{ style: { background: '#fff', margin: 0, padding: 0 }, readOnly: true }}
                        sx={{ my: 'auto' }}
                    />
                </div>
            ),
        },
        {
            field: "quantity",
            headerName: "Quantity",
            minWidth: 60,
            flex: 0.5,
            type: "number",
            editable: true,
            renderCell: (params) => (
                <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "center", height: "100%" }}>
                    <TextField
                        type="number"
                        value={params.value || 1}
                        onChange={(e) => edit(params.id, "quantity", Number(e.target.value))}
                        variant="outlined"
                        fullWidth
                        size="small"
                        inputProps={{ min: 1 }}
                        InputProps={{ style: { background: '#fff', margin: 0, padding: 0 } }}
                        sx={{ my: 'auto' }}
                    />
                </div>
            ),
        },
        {
            field: "spacer",
            headerName: "",
            minWidth: 32,
            flex: 0.2,
            sortable: false,
            filterable: false,
            editable: false,
            disableColumnMenu: true,
            renderCell: () => <div />
        },
    ];

    return (
        <div>
            <DataGridComponent
                style={{ width: "100%" }}
                rows={rows}
                columns={columns}
                add={addOne}
                edit={edit}
                delete={deleteOne}
                pageSize={100}
                rowsPerPageOptions={[100]}
                disableSelectionOnClick
                headerHeight={24}
            />
            <Dialog open={searchOpen} onClose={handleSearchClose} maxWidth="sm" fullWidth>
                <DialogTitle>Search Description or Code</DialogTitle>
                <Box sx={{ height: 3 }} />
                <DialogContent>
                    <TextField
                        label="Enter code or description"
                        value={searchValue}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                            setSearchPerformed(false);
                        }}
                        fullWidth
                        autoFocus
                        variant="outlined"
                        sx={{ mb: 2}}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearchSubmit();
                        }}
                        disabled={loading}
                        helperText="** Partial matches are supported."
                    />
                    {loading && <div>Searching...</div>}
                    {searchResults.length > 0 && (
                        <ul style={{ paddingLeft: 0 }}>
                            {searchResults.map((result, idx) => (
                                <li key={idx} style={{ listStyle: "none", margin: "8px 0" }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleResultSelect(result)}
                                        fullWidth
                                        style={{ color: '#000' }}
                                    >
                                        {result.code}: {result.display}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {!loading && searchPerformed && searchResults.length === 0 && searchValue && (
                        <div>No results found.</div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSearchClose} color="primary">Cancel</Button>
                    <Button onClick={handleSearchSubmit} disabled={loading || !searchValue} variant="contained">Search</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
