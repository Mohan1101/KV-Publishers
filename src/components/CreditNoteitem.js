import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { BiTrash } from 'react-icons/bi';
import EditableField from './EditableField';
import { getDocs, collection, doc, updateDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

class CreditNoteItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inventoryData: [], // Initialize an empty array to store inventory data
      items: [], // Initialize an empty array to store credit note items
      showErrorModal: false,
      errorMessage: '',
      remainingQuantity: 0,
      isSubmitting: false,
    };
  }
  

  async componentDidMount() {
    try {
      // Fetch inventory products where Category is 'Inventory'
      const inventoryQuery = query(collection(db, 'GENERAL PRODUCTS'), where('Category', '==', 'Inventory'));
      const inventorySnapshot = await getDocs(inventoryQuery);
      const inventoryData = inventorySnapshot.docs.map((doc) => ({
        label: doc.id,
        value: doc.data().BookName,
        quantity: doc.data().Quantity,
        price: doc.data().SellingPrice,
      }));
  
      // Fetch distributor products where Distributorname is not 'NA'
      const distributorQuery = query(collection(db, 'GENERAL PRODUCTS'), where('Distributorname', '!=', 'NA'));
      const distributorSnapshot = await getDocs(distributorQuery);
      const distributorData = distributorSnapshot.docs.map((doc) => ({
        label: doc.id,
        value: doc.data().BookName,
        quantity: doc.data().Quantity,
        price: doc.data().SellingPrice,
      }));
  
      // Merge both inventory and distributor data
      const mergedData = [...inventoryData, ...distributorData];
  
      // Update state with merged data
      this.setState({ inventoryData: mergedData });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  



  handleDone = async () => {
    this.setState({ isSubmitting: true });
  
    for (const item of this.props.items) {
      const selectedItemId = item.name;
  
      if (selectedItemId) {
        try {
          const productRef = doc(db, 'GENERAL PRODUCTS', selectedItemId);
          const productSnapshot = await getDoc(productRef);
  
          if (productSnapshot.exists()) {
            const currentQuantity = productSnapshot.data().Quantity || 0;
            const enteredQuantity = parseInt(item.quantity, 10);

           
           console.log('Current Quantity:', currentQuantity);
            console.log('Entered Quantity:', enteredQuantity);

  
            const updatedQuantity = Number(currentQuantity) + enteredQuantity;
  
            // Update the quantity in the 'GENERAL PRODUCTS' collection
            await updateDoc(productRef, { Quantity: updatedQuantity });

            console.log(`Quantity updated for ${selectedItemId}. New quantity: ${updatedQuantity}`);
          } else {
            console.error(`Document does not exist for ${selectedItemId} in 'GENERAL PRODUCTS'.`);
          }
        } catch (error) {
          console.error(`Error updating quantity for ${selectedItemId}:`, error);
        }
      } else {
        console.error('Selected item ID is undefined.');
      }
    }
  
    this.setState({ isSubmitting: false });
    this.props.onItemsDone(true);
  };


  
  
  

  render() {
    
    var onItemizedItemEdit = this.props.onItemizedItemEdit;
    var currency = this.props.currency;
    var rowDel = this.props.onRowDel;
    var itemTable = this.props.items.map(function (item) {
      return (
        <ItemRow
          onItemizedItemEdit={onItemizedItemEdit}
          item={item}
          onDelEvent={rowDel.bind(this)}
          key={item.id}
          currency={currency}
          inventoryData={this.state.inventoryData}
     
        />
      );
    }, this);

    return (
      <div>
        <Table>
          <thead>
            <tr>
              <th>ITEM</th>
              <th>QTY</th>
              <th>PRICE/RATE</th>
              <th className="text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>{itemTable}</tbody>
        </Table>
        <p className="text-danger">Please add all items before clicking on Done, wrong entries cannot be reverted.</p>
        <Button className="fw-bold btn-secondary" onClick={this.props.onRowAdd}>
          Add Item
        </Button>
        <Button className="fw-bold btn-success ms-2" onClick={this.handleDone} disabled={this.state.isSubmitting}>
          {this.state.isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
        <Modal show={this.state.showErrorModal} onHide={() => this.setState({ showErrorModal: false })}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.errorMessage} No. of quantities left: {this.state.remainingQuantity}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.setState({ showErrorModal: false })}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

class ItemRow extends React.Component {
  onDelEvent() {
    this.props.onDelEvent(this.props.item);

  }



  render() {
    return (
      <tr>
        <td style={{ width: '100%' }}>
        <EditableField
            onItemizedItemEdit={this.props.onItemizedItemEdit}
            cellData={{
              type: 'select',
              name: 'name',
              placeholder: 'Select Item',
              options: this.props.inventoryData,
              value: this.props.item.name,
              id: this.props.item.id,

            }}

          />
        </td>
        <td style={{ minWidth: '120px' }}>
          <EditableField
            onItemizedItemEdit={this.props.onItemizedItemEdit}
            cellData={{
              type: 'number',
              name: 'quantity',
              min: 1,
              step: '1',
              value: this.props.item.quantity,
              id: this.props.item.id,
            }}
          />
        </td>
        <td style={{ minWidth: '130px' }}>
          <EditableField
            onItemizedItemEdit={this.props.onItemizedItemEdit}
            cellData={{
              leading: this.props.currency,
              type: 'number',
              name: 'price',
              min: 1,
              step: '0.01',
              precision: 2,
              textAlign: 'text-end',
              value: this.props.item.price = this.props.inventoryData.find((item) => item.label == this.props.item.name)?.price || 0,
              id: this.props.item.id,
            }}
          />
        </td>
        <td className="text-center" style={{ minWidth: '50px' }}>
          <BiTrash
            onClick={this.onDelEvent.bind(this)}
            style={{ height: '33px', width: '33px', padding: '7.5px' }}
            className="text-white mt-1 btn btn-danger"
          />
        </td>
      </tr>
    );
  }
}

export default CreditNoteItem;
