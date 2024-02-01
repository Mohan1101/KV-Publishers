import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from 'react-bootstrap/Button';
import InputLabel from '@mui/material/InputLabel';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import OrderItem from './OrderItem';
import { db } from '../firebase/firebase'; // Replace with your actual Firebase db import path
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import OrderModal from './OrderModal';

class OrderForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            currency: '₹',
            currentDate: this.getCurrentDate(),
            invoiceNumber: 1,
            bdate: '',
            payment: '',
            ddDate: '',
            disthru: '',
            delNo: '',
            payment: '',
            Sref: '',
            Bref: '',
            destn: '',
            ddNo: '',
            dateOfIssue: '',
            billToNo: '',
            billToEmail: '',
            billToAddress: '',
            GSTNO: '',
            total: '0.00',
            subTotal: '0.00',
            discountRate: '',
            discountAmmount: '',
            bank: '',
            branch: '',
            AccNo: '',
            ifsc: '',
            Accname: '',
            tod: '',
            currentDate: this.getCurrentDate(),
            itemsDone: false,
            SchoolName: '',
            Email: '',
            Principal: '',
            Address: '',
            Contact: '',

            itemsDone: false,
            items: [
                {
                    id: 0,
                    name: '',
                    description: '',
                    price: '1.00',
                    quantity: 1
                }
            ],
            schools: [],



        };

        this.editField = this.editField.bind(this);
        this.handleSchoolChange = this.handleSchoolChange.bind(this);
    }

    getCurrentDate = () => {
        const currentDate = new Date();
        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const year = currentDate.getFullYear();
        return `${day}/${month}/${year}`;
    };

    handleItemsDone = (isDone) => {
        this.setState({ itemsDone: isDone });
    };

    async componentDidMount() {
        await this.fetchSchoolOptions();
        this.handleCalculateTotal();
    }

    componentDidMount() {
        this.fetchSchoolOptions();
    }

    fetchSchoolOptions = async () => {
        try {
            const schoolSnapshot = await db.collection('School').get();
            const schoolData = schoolSnapshot.docs.map((doc) => ({
                label: doc.id,
                value: doc.data().name,
            }));

            this.setState({ schools: schoolData }); // Update the state after fetching data
            console.log('School Data:', schoolData);
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

handleSchoolChange = async (e) => {
        const schoolName = e.target.value;

        try {
            const schoolDoc = await db.collection('School').doc(schoolName).get();

            if (schoolDoc.exists) {
                const schoolData = schoolDoc.data();

                this.setState({
                    SchoolName: schoolName,
                    Principal: schoolData.principalName || '',
                    Address: schoolData.address || '',
                    Contact: schoolData.contact || '',
                    Email: schoolData.email || '',
                });
            } else {
                console.error('Selected school does not exist:', schoolName);
            }
        } catch (error) {
            console.error('Error fetching school details:', error);
        }
    };


    handleRowDel(items) {
        var index = this.state.items.indexOf(items);
        this.state.items.splice(index, 1);
        this.setState(this.state.items);
    };

    handleAddEvent(evt) {
        var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
        var items = {
          id: id,
          name: '',
          price: '1.00',
          description: '',
          quantity: 1
        };
        this.state.items.push(items);
    
        this.setState(
          { items: this.state.items },
          () => this.handleCalculateTotal() // Recalculate the total after adding an item
        );
      }
      handleCalculateTotal() {
        this.setState(
          prevState => {
            const items = prevState.items;
            const subTotal = items.reduce(
              (total, item) =>
                total + parseFloat(item.price) * parseInt(item.quantity),
              0
            );
    
            const discountAmmount = parseFloat(
              subTotal * (prevState.discountRate / 100)
            ).toFixed(2);
            const total =
              subTotal - discountAmmount;
    
            return {
              subTotal: parseFloat(subTotal).toFixed(2),
              discountAmmount: discountAmmount,
              total: total
            };
          }
        );
      }
      handleChange = (event) => {
        this.setState({
          payment: event.target.checked ? event.target.name : ''
        });
      };

    onItemizedItemEdit(evt) {
        var item = {
            id: evt.target.id,
            name: evt.target.name,
            value: evt.target.value
        };
        var items = this.state.items.slice();
        var newItems = items.map(function (items) {
            for (var key in items) {
                if (key == item.name && items.id == item.id) {
                    items[key] = item.value;
                }
            }
            return items;
        });
        this.setState({ items: newItems });
        this.handleCalculateTotal();
    }

    editField = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
        this.handleCalculateTotal();
    };

    openModal = (event) => {
        event.preventDefault();
        this.handleCalculateTotal();
        this.setState({ isOpen: true });
    };

    closeModal = (event) => this.setState({ isOpen: false });

    render() {
        const { schools, SchoolName, Email, Principal, Address, Contact, bdate } = this.state;
        return (
            <Form onSubmit={this.openModal}>
                <Row>
                    <Col md={8} lg={9} className="scrollable-col">
                        <Card className="p-4 p-xl-5 my-3 my-xl-4">
                            <div className="d-flex flex-row align-items-start justify-content-between mb-3">
                                <div class="d-flex flex-column">
                                    <div className="d-flex flex-column">
                                        <div className="mb-2">
                                            <span className="fw-bold">Current Date:&nbsp;</span>
                                            <span className="current-date">{this.state.currentDate}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-row align-items-center">
                                    <span className="fw-bold me-2">Invoice&nbsp;Number:&nbsp;</span>
                                    <Form.Control type="number" value={this.state.invoiceNumber} name={"invoiceNumber"} onChange={(event) => this.editField(event)} min="1" style={{ maxWidth: '70px' }} required="required" />
                                </div>
                            </div>
                            <hr className="my-4" />
                            <Row className="mb-3">
                                <Col md={6} lg={6} className="scrollable-col" style={{ borderRight: '1px solid grey', paddingRight: '10px' }}>
                                    <Form.Label className="fw-bold">Shipping to:</Form.Label>
                                    <br/>
                                    <Select
                                        value={SchoolName}
                                        onChange={this.handleSchoolChange}
                                        className="mb-2"
                                        displayEmpty  // Add this prop to display the placeholder even when a value is selected
                                    >
                                        <MenuItem value="" disabled>
                                            Select School
                                        </MenuItem>
                                        {schools.map((school) => (
                                            <MenuItem key={school.label} value={school.value}>
                                                {school.value}
                                            </MenuItem>
                                        ))}
                                    </Select>


                                    <Form.Control placeholder="Principal" value={Principal} type="text" name="Principal" className="my-2" onChange={(event) => this.editField(event)} />
                                    <Form.Control placeholder="Address" value={Address} type="text" name="Address" className="my-2" onChange={(event) => this.editField(event)} />
                                    <Form.Control placeholder="Contact" value={Contact} type="text" name="Contact" className="my-2" onChange={(event) => this.editField(event)} />
                                    <Form.Control placeholder="Email" value={Email} type="email" name="Email" className="my-2" onChange={(event) => this.editField(event)} />
                                    <div className="d-flex flex-row align-items-center">
                                        <span className=" d-block me-2">Ordered Date:</span>
                                        <Form.Control type="date" value={bdate} name="bdate" onChange={(event) => this.editField(event)} style={{ paddingLeft: '20px', maxWidth: '230px' }} />
                                    </div>
                                </Col>
                                <Col md={6} lg={6} className="scrollable-col">
                                 <Row className="mx-2 mb-5">
                               
            
                                    <Form.Label className="fw-bold">References:</Form.Label>
                                    <Form.Control placeholder={"Supplier's ref"} rows={3} value={this.state.Sref} type="text" name="Sref" className="my-2" onChange={(event) => this.editField(event)} autoComplete="name" />
                                    <Form.Control placeholder={"Other Reference(s)"} value={this.state.Oref} type="text" name="Oref" className="my-2" onChange={(event) => this.editField(event)} autoComplete="email" />
                                    <hr className="my-4" />
                                    <Form.Control placeholder={"Buyer's Reference"} value={this.state.Bref} type="text" name="Bref" className="my-2" autoComplete="address" onChange={(event) => this.editField(event)} />
                                    <Form.Control placeholder={"Order No" } value={this.state.delNo} type="number" name="delNo" className="my-2" onChange={(event) => this.editField(event)} autoComplete="address" />
                                
                            </Row>
                            </Col>


                            </Row>
                            
                            <hr className="my-4" />
                            <Row>
                                <Col md={4} style={{ borderRight: '1px solid black' }}>
                                    <div><strong>Mode of Payment:</strong></div>
                                    <div className="btn-group btn-group-toggle" style={{ padding: '8px' }} data-toggle="buttons">
                                        <label className={`btn btn-secondary ${this.state.payment === 'NEFT' ? 'active' : ''}`}>
                                            <input type="radio" name="NEFT" autoComplete="off" onChange={this.handleChange} checked={this.state.payment === 'NEFT'} /> NEFT
                                        </label>
                                        <label className={`btn btn-secondary ${this.state.payment === 'RTGS' ? 'active' : ''}`}>
                                            <input type="radio" name="RTGS" autoComplete="off" onChange={this.handleChange} checked={this.state.payment === 'RTGS'} /> RTGS
                                        </label>
                                        <label className={`btn btn-secondary ${this.state.payment === 'MPS' ? 'active' : ''}`}>
                                            <input type="radio" name="MPS" autoComplete="off" onChange={this.handleChange} checked={this.state.payment === 'MPS'} /> MPS
                                        </label>
                                    </div>
                                    <div style={{ padding: '5px' }}><strong>Terms of Delivery:</strong></div>
                                    <Form.Control placeholder={""} value={this.state.tod} type="text" name="tod" className="my-2" onChange={(event) => this.editField(event)} autoComplete="email" />
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="fw-bold">Dispatch details:</Form.Label>
                                    <Form.Control placeholder={"Dispatch Document No."} rows={3} value={this.state.ddNo} type="text" name="ddNo" className="my-2" onChange={(event) => this.editField(event)} autoComplete="name" />
                                    <div className="d-flex flex-row align-items-center" style={{ paddingTop: '35px' }}>
                                    <span className=" d-block me-2">Dated:</span>
                                        <Form.Control type="date" value={this.state.ddDate}
                                         name={"bdate"} onChange={(event) => this.editField(event)} style={{
                                            paddingLeft: '20px',
                                            maxWidth: '230px'
                                        }} />
                                    </div>

                                </Col>
                                <Col md={4} style={{ borderLeft: '1px solid grey' }}>
                                    <Form.Label className="fw-bold">Route:</Form.Label>
                                    <Form.Control placeholder={"Dispatched Through"} rows={3} value={this.state.disthru} type="text" name="disthru" className="my-2" onChange={(event) => this.editField(event)} autoComplete="name" />
                                    <div style={{ paddingTop: '28px' }}>
                                        <Form.Control placeholder={"Destination"} value={this.state.destn} type="text" name="destn" className="my-2" onChange={(event) => this.editField(event)} autoComplete="email" />
                                    </div>
                                </Col>
                            </Row>
                            <hr className="my-4" />
                            <OrderItem
                                onItemizedItemEdit={this.onItemizedItemEdit.bind(this)}
                                onRowAdd={this.handleAddEvent.bind(this)}
                                onRowDel={this.handleRowDel.bind(this)}
                                currency={this.state.currency}
                                items={this.state.items}
                                onItemsDone={this.handleItemsDone} // Pass the callback function to InvoiceItem
                            />
                            <Row className="mt-4 justify-content-end">
                                <Col lg={6}>
                                    <div className="d-flex flex-row align-items-start justify-content-between">
                                        <span className="fw-bold">Subtotal:</span>
                                        <span>{this.state.currency}{this.state.subTotal}</span>
                                    </div>
                                    <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                                        <span className="fw-bold">Discount:</span>
                                        <span>
                                            <span className="small ">({this.state.discountRate || 0}%)</span>
                                            {this.state.currency}{this.state.discountAmmount || 0} </span>
                                    </div>
                                    <hr />
                                    <div className="d-flex flex-row align-items-start justify-content-between" style={{ fontSize: '1.125rem' }}>
                                        <span className="fw-bold">Total:</span>
                                        <span className="fw-bold">{this.state.currency}{this.state.total || 0}</span>
                                    </div>
                                </Col>
                            </Row>
                            <hr className="my-4" />
                        </Card>
                    </Col>
                    <Col md={4} lg={3} className="fixed-col">
                        <div className="sticky-top pt-md-3 pt-xl-4">
                            <Button
                                variant="primary"
                                type="submit"
                                className="d-block w-100 btn-secondary"
                                disabled={!this.state.itemsDone} // Disable the button if items are not done
                            >
                                Review Invoice
                            </Button>
                            <OrderModal
                                showModal={this.state.isOpen}
                                closeModal={this.closeModal}
                                info={this.state}
                                items={this.state.items}
                                currency='₹'
                                subTotal={this.state.subTotal}
                                taxAmount={this.state.taxAmount}
                                discountAmount={this.state.discountAmmount}
                                total={this.state.total}
                                schoolInfo={{
                                    SchoolName: this.state.SchoolName,
                                    Principal: this.state.Principal,
                                    Address: this.state.Address,
                                    Contact: this.state.Contact,
                                    Email: this.state.Email,
                                }}
                            />
                            <Form.Group className="my-3">
                                <Form.Label className="fw-bold">Discount rate:</Form.Label>
                                <InputGroup className="my-1 flex-nowrap">
                                    <Form.Control name="discountRate" type="number" value={this.state.discountRate} onChange={(event) => this.editField(event)} className="bg-white border" placeholder="0.0" min="0.00" step="0.01" max="100.00" />
                                    <InputGroup.Text className="bg-light fw-bold text-secondary small">% </InputGroup.Text>
                                </InputGroup>
                            </Form.Group>
                        </div>
                    </Col>
                </Row>
            </Form>
        );
    }
}

export default OrderForm;
