import React from "react";

import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import jp from "jsonpath";


function AEOBItemsTable({ title, data }) {

    //headers = [service, date, quantity...]
    let headers = [];

    const numItems = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item.length');

    //get the different item adjudication categories and put into "header" list
    for (let i = 0; i < numItems; i++) {
        const numAjudicationCategories = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].adjudication.length');

        //service
        if (!headers.includes("Service")) {
            headers.push("Service");
        }

        //service description
        if (!headers.includes("Service Description")) {
            headers.push("Service Description");
        }

        //service date
        if (!headers.includes("Service Date")) {
            headers.push("Service Date");
        }

        //quantity
        if (!headers.includes("Quantity")) {
            headers.push("Quantity");
        }

        //goes thorugh the adjudication categories (paid to provider, submitted amount, eligible amount)
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

        //service
        const service = (jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].productOrService.coding[0].code')[0]);
        const serviceObject = {
            ["Service"]: service,
        }
        currentRow.push(serviceObject);

        //service description
        const serviceDescription = (jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].productOrService.coding[0].display')[0]);
        const serviceDescObject = {
            ["Service Description"]: serviceDescription,
        }
        currentRow.push(serviceDescObject);

        //service date
        const serviceDate = (jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].extension[0].valueDate')[0]);
        const serviceDateObject = {
            ["Service Date"]: serviceDate,
        }
        currentRow.push(serviceDateObject);

        //quantity
        const quantity = (jp.query(data, '$..[?(@.resourceType == "Claim")].item[' + i + '].quantity.value')[0]);
        const quantityObj = {
            ["Quantity"]: quantity,
        }
        currentRow.push(quantityObj);



        for (let j = 0; j < numAjudicationCategories; j++) {


            const catSelected = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].adjudication[' + j + '].category.coding[0].display')[0];
            if (headers.includes(catSelected) && (catSelected === "Paid to Provider" || catSelected === "Submitted Amount" || catSelected === "Eligible Amount")) {
                let rowValueCurrency = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].adjudication[' + j + '].amount.currency')[0];
                let rowValueAmount = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].adjudication[' + j + '].amount.value')[0];

                if (rowValueCurrency === "USD" || rowValueCurrency === "") {
                    rowValueAmount = jp.query(data, '$..[?(@.resourceType == "ExplanationOfBenefit")].item[' + i + '].adjudication[' + j + '].amount.value')[0].toFixed(2);
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
                            <TableCell align="left">{header.toUpperCase()}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataRows.map((emp, index) => (
                        <TableRow key={index}>
                            {headers.map(header => (
                                <TableCell align="left">{emp[header]}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>


    );

}

export default AEOBItemsTable;
