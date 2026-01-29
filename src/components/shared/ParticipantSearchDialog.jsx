import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { searchCoordinationEntities } from "../../api";
import Pagination from '@mui/material/Pagination';

export default function ParticipantSearchDialog({ open, onClose, onSelect, coordinationServer, getResultDisplay, target }) {
    const [searchType, setSearchType] = useState("Practitioner");
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessages, setErrorMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    const totalPages = Math.ceil(searchResults.length / pageSize);
    const displayedData = searchResults.slice((page - 1) * pageSize, page * pageSize);

    // Reset page to 1 when searchResults change and page is out of range
    useEffect(() => {
        setPage(prevPage => (prevPage > totalPages && totalPages > 0 ? 1 : prevPage));
    }, [searchResults, totalPages]);

    useEffect(() => {
        if (!open) {
            setSearchText("");
            setSearchType("Practitioner");
            setSearchResults([]);
            setLoading(false);
            setErrorMessages([]);
            setPage(1);
        }
    }, [open]);

    const handleSearch = async () => {
        setLoading(true);
        setErrorMessages([]);
        try {
            const results = await searchCoordinationEntities(coordinationServer, searchType, searchText);
            setSearchResults(results);
            setPage(1); // reset to first page on new search
        } catch (e) {
            setErrorMessages([e.message || "An error occurred while searching."]);
            setSearchResults([]);
            setPage(1);
        }
        setLoading(false);
    };

    const handleSelect = (result) => {
        onSelect(result);
        onClose();
    };

    const handleDialogClose = () => {
        setSearchText("");
        setSearchResults([]);
        setLoading(false);
        setErrorMessages([]);
        onClose();
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <>
            <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>Search {target === 'requester' ? 'Requester' : target === 'contributor' ? 'Contributor' : 'Participant'}</DialogTitle>
                <DialogContent>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                        <FormLabel component="legend" style={{ marginRight: 16, whiteSpace: 'nowrap' }}>Select Type</FormLabel>
                        <RadioGroup
                            row
                            value={searchType}
                            onChange={e => setSearchType(e.target.value)}
                            name="search-type"
                            style={{ display: 'flex', flexDirection: 'row' }}
                        >
                            <FormControlLabel value="Practitioner" control={<Radio />} label="Practitioner" />
                            <FormControlLabel value="Organization" control={<Radio />} label="Organization" />
                        </RadioGroup>
                    </div>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={`Search by ID or Name`}
                        type="text"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        fullWidth
                        helperText="Partial matches on Name are supported. For ID, only exact matches are supported."
                    />
                    {errorMessages.length > 0 && (
                        <div style={{ color: 'red', marginTop: 12, marginBottom: 8 }}>
                            {errorMessages.map((msg, idx) => (
                                <div key={idx}>{msg}</div>
                            ))}
                        </div>
                    )}
                    {loading && (
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            <span>Searching...</span>
                        </div>
                    )}
                    {!loading && displayedData.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            {displayedData.map((result, idx) => (
                                <Button
                                    key={idx}
                                    fullWidth
                                    onClick={() => handleSelect(result)}
                                    style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{getResultDisplay(result)}</div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    )}
                    {!loading && displayedData.length === 0 && searchText.trim().length > 0 && errorMessages.length === 0 && (
                        <div style={{ marginTop: 16, textAlign: 'center', color: '#888' }}>
                            No results found.
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    {totalPages > 1 && (
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    )}
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button onClick={handleSearch} disabled={searchText.trim().length === 0} variant="contained">Search</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
