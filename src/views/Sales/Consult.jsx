import React, { Component } from 'react';

// jQuery plugin - used for DataTables.net
import $ from 'jquery';


import {
    Grid, Row, Col,
    FormGroup, ControlLabel, FormControl, HelpBlock, Form, InputGroup
} from 'react-bootstrap';

import Card from 'components/Card/Card.jsx';
import Table from 'components/Table/Table.jsx';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import Spinner from 'components/Spinner/Spinner.jsx';
var config = require("../../config.js");

class Consult extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pharmacies: [],
            dataTable: {
                headerRow: ["id", "Medicine", "Form", "Concentration", "PackageQtt", "MinQtt", "Qtt"],
                dataRows: []
            },
            singleSelect: null,
            lastSelected: null,
            loading: false,
        }
    }

    componentWillMount() {
        this.setState({ loading: true });
        fetch('https://lapr5-g6618-pharmacy-management.azurewebsites.net/api/pharmacy/' + localStorage.pharmacy_id, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: localStorage.getItem("token"),
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET
            },
        })
            .then(results => {
                return results.json();
            })
            .then(data => {


                this.setState({
                    pharmacies: [{
                        value: data._id,
                        label: data.name
                    }],
                    loading: false
                });
                console.log("state", this.state.pharmacies);
            });

    }

    componentDidUpdate() {
        if (this.state.singleSelect !== null && this.state.lastSelected !== this.state.singleSelect) {
            this.setState({ lastSelected: this.state.singleSelect, loading: true });
            fetch('https://lapr5-g6618-pharmacy-management.azurewebsites.net/api/pharmacy/' + this.state.singleSelect.value + "/sale", {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: localStorage.getItem("token"),
                    client_id: config.CLIENT_ID,
                    client_secret: config.CLIENT_SECRET
                },
            })
                .then(results => {
                    return results.json();
                })
                .then(data => {
                    try {
                        let rows = data.map((stock) => {
                            console.log("Stock", stock);
                            return [
                                stock._id,
                                stock.prescription.receiptId,
                                stock.prescription.prescriptionId,
                                stock.prescription.medicinePresentation.medicine,
                                stock.prescription.medicinePresentation.form,
                                stock.prescription.medicinePresentation.concentration,
                                stock.prescription.medicinePresentation.packageQtt,
                                stock.quantity,
                                stock.date
                            ];
                        });
                        console.log("DataRows", rows);
                        var stocks = {
                            headerRow: ["Id", "ReceiptID", "PrescriptionID", "Medicine", "Form", "Concentration", "Package Qtt", "Qtt", "Date"],
                            dataRows: rows
                        };
                        console.log("Data", data);
                        console.log("stocks", stocks);
                        this.setState({ dataTable: stocks, loading: false });

                    } catch (err) {
                        console.log("No logs");
                    }
                }
                );
        }

    }

    render() {
        var table = null;
        if (this.state.dataTable.dataRows.length !== 0) {
            table = <Table id="datatables" title="Sale Logs" content={this.state.dataTable} />
            console.log("Table", table);
        } else {
            table = <Spinner show={this.state.loading} />;
        }
        return (
            <div className="main-content">
                <Grid fluid>
                    <Row>
                        <Col md={12}>
                            <Card
                                title={<legend>Check Sale Logs</legend>}
                                content={
                                    <Form horizontal>
                                        <fieldset>
                                            <FormGroup>
                                                <ControlLabel className="col-sm-2">
                                                    Pharmacy
                                                    </ControlLabel>
                                                <Col md={4}>
                                                    <Select
                                                        placeholder="Select Pharmacy"
                                                        name="singleSelect"
                                                        value={this.state.singleSelect}
                                                        options={this.state.pharmacies}
                                                        onChange={(value) => this.setState({ singleSelect: value })}
                                                    />
                                                </Col>
                                            </FormGroup>
                                        </fieldset>
                                    </Form>
                                }
                            />

                        </Col>
                        {table}
                    </Row>
                </Grid>
            </div>
        );
    }
}
export default Consult;
