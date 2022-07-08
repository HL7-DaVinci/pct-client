import React from "react";

import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import moment from 'moment';
import jp from "jsonpath";
//returns 0 when item doesn't exist
//console.log("SHOULD RETURN NULL HERE", jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].ite').length)




function AEOBItemsTable({ title, data }) {

    //headers = [service, date, quantity...]
    let headers = [];

    const numItems = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item.length');

    //get the different item adjudication categories and put into "header" list
    for (let i = 0; i < numItems; i++) {
        const numAjudicationCategories = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].adjudication.length');
        for (let j = 0; j < numAjudicationCategories; j++) {

            const catSelected = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].adjudication[' + j + '].category.coding[0].display')[0];
            if (!headers.includes(catSelected)) {
                headers.push(catSelected);
            }
        }
    }



    const dataRows = [];
    let rows = [];

    //go through all items, and save data for each row
    for (let i = 0; i < numItems; i++) {
        const numAjudicationCategories = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].adjudication.length');

        let currentRow = [];

        for (let j = 0; j < numAjudicationCategories; j++) {

            const catSelected = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].adjudication[' + j + '].category.coding[0].display')[0];

            if (headers.includes(catSelected)) {
                const rowValueCurrency = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].adjudication[' + j + '].amount.currency')[0];
                const rowValueAmount = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].adjudication[' + j + '].amount.value')[0];

                if (rowValueCurrency == "USD" || rowValueCurrency == "") {
                    rowValueAmount = "$" + jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].adjudication[' + j + '].amount.value')[0].toFixed(2);

                }
                const rowValue = rowValueAmount + " " + rowValueCurrency;

                const object = {
                    [catSelected]: rowValue,
                }
                currentRow.push(object);
            }
        }

        //changes data structure from {a:1}, {b:2} to {a:1 ,b:2 }
        rows = Object.assign({}, ...currentRow);

        //add {a:1 ,b:2 } to a full array [{a: 1, b:2}, {a:1, b:2}] for mapping below
        dataRows.push(rows)
    }

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        {headers.map(header => (
                            <TableCell align="right">{header.toUpperCase()}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataRows.map((emp, index) => (
                        <TableRow key={index}>
                            {headers.map(header => (
                                <TableCell align="right">{emp[header]}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>


    );

}

export default AEOBItemsTable;
