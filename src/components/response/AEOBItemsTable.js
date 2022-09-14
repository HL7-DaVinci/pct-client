import React from "react";

import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import jp from "jsonpath";


function AEOBItemsTable(aeobData) {

    const data = aeobData.props.aeob;

    //headers = [service, date, quantity...] holds adjudication categories' display titles
    let headers = [];

    const numItems = jp.query(data, 'item.length');

    //get the different item adjudication categories and put into "header" list
    for (let i = 0; i < numItems; i++) {
        const numAjudicationCategories = jp.query(data, 'item[' + i + '].adjudication.length');

        //service
        if (!headers.includes("service")) {
            headers.push("service");
        }

        //service description
        if (!headers.includes("service description")) {
            headers.push("service description");
        }

        //service date
        if (!headers.includes("service date")) {
            headers.push("service date");
        }

        //quantity
        if (!headers.includes("quantity")) {
            headers.push("quantity");
        }

        //goes thorugh the adjudication categories (paid to provider, submitted amount, eligible amount)
        for (let j = 0; j < numAjudicationCategories; j++) {
            const category = jp.query(data, 'item[' + i + '].adjudication[' + j + '].category.coding[0].display')[0];
            const catSelected = (category ? category.toLowerCase() : "");
            if (!headers.includes(catSelected)) {
                headers.push(catSelected);
            }
        }
    }


    const dataRows = [];
    let rows = [];

    //go through all items, and save data for each row
    for (let i = 0; i < numItems; i++) {
        const numAjudicationCategories = jp.query(data, 'item[' + i + '].adjudication.length');

        let currentRow = [];

        //service
        const service = (jp.query(data, 'item[' + i + '].productOrService.coding[0].code')[0]);
        const serviceObject = {
            ["service"]: service,
        }
        currentRow.push(serviceObject);

        //service description
        const serviceDescription = (jp.query(data, 'item[' + i + '].productOrService.coding[0].display')[0]);
        const serviceDescObject = {
            ["service description"]: serviceDescription,
        }
        currentRow.push(serviceDescObject);

        //service date
        const serviceDate = (jp.query(data, 'item[' + i + '].extension[0].valueDate')[0]);
        const serviceDateObject = {
            ["service date"]: serviceDate,
        }
        currentRow.push(serviceDateObject);

        //quantity assumed to be 1 if not given
        const quantity = (jp.query(data, 'item[' + i + '].quantity.value')[0] === undefined) ? "1" : jp.query(data, 'item[' + i + '].quantity.value')[0];
        const quantityObj = {
            ["quantity"]: quantity,
        }
        currentRow.push(quantityObj);


        //for each item, fills table according to the adjudication categories
        for (let j = 0; j < numAjudicationCategories; j++) {

            const catCodeSelected = jp.query(data, 'item[' + i + '].adjudication[' + j + '].category.coding[0].code')[0];
            const category = jp.query(data, 'item[' + i + '].adjudication[' + j + '].category.coding[0].display')[0];
            const catHeaderSelected = category ? category.toLowerCase() : "";

            if (headers.includes(catHeaderSelected) && (catCodeSelected === "paidtoprovider" || catCodeSelected === "submitted" || catCodeSelected === "eligible" || catCodeSelected === "coinsurance" || catCodeSelected === "copay" || catCodeSelected === "noncovered" || catCodeSelected === "deductible")) {
               // TODO : display other currencies for now, just assume it is USD
               // let rowValueCurrency = (jp.query(data, 'item[' + i + '].adjudication[' + j + '].amount.currency')[0] === undefined) ? "USD" : jp.query(data, 'item[' + i + '].adjudication[' + j + '].amount.currency')[0];
                let rowValueAmount = jp.query(data, 'item[' + i + '].adjudication[' + j + '].amount.value')[0];

                const rowValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rowValueAmount);
                const object = {
                    [catHeaderSelected]: rowValue,
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
