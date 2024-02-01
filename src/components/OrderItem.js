import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { BiTrash } from 'react-icons/bi';
import EditableField from './EditableField';
import { getDocs, collection, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase'; // Import the initialized Firestore instance
import Modal from 'react-bootstrap/Modal';
import { updateMetadata } from 'firebase/storage';

class OrderItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inventoryData: [], // Initialize an empty array to store inventory data
      items: [],
    };
  }

  state = {
    // ... (Other state variables)
   
    showErrorModal: false,
    errorMessage: '',
    remainingQuantity: 0,
  };

  async componentDidMount() {
    try {
      // Create a query to fetch documents from 'GENERAL PRODUCTS' where 'Category' is 'Inventory'
      const q = query(collection(db, 'GENERAL PRODUCTS'), where('Category', '==', 'Inventory'));
  
      // Execute the query and get the snapshot
      const productsSnapshot = await getDocs(q);
  
      console.log('Products Snapshot:', productsSnapshot.docs); // Log the documents
  
      const inventoryData = productsSnapshot.docs.map((doc) => ({
        label: doc.id,
        value: doc.data().BookName,
        quantity: doc.data().Quantity,
        price: doc.data().SellingPrice,
      }));
  
      console.log('Inventory Data:', inventoryData);
  
      this.setState({ inventoryData });
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  }
  
  handleQuantityUpdate = (itemName, newItemLabel, newPrice) => {
    // Update the label (name) and price in the items array
    const updatedItems = this.state.items.map((item) =>
      item.label === itemName ? { ...item, label: newItemLabel, price: newPrice } : item
    );
    console.log(updatedItems);
  
    this.setState({ items: updatedItems });
  };

  

  
  

  handleDone = async () => {
    const updateItemState = (selectedBookId, enteredQuantity) => {
      this.setState((prevState) => {
        const updatedItems = prevState.items.map((item) => {
          if (item.name === selectedBookId) {
            return { ...item, quantity: enteredQuantity };
          }
          return item;
        });
        return { items: updatedItems };
      });
    };
  
    // Iterate through the items and update the quantity in the inventory
    console.log('Items:', this.props.items);
    for (const item of this.props.items) {
      const selectedBookId = item.name; // Use item.name as the identifier
  
      // Add a check to ensure that selectedBookId is defined
      if (selectedBookId) {
        try {
          // Fetch the quantity from 'GENERAL PRODUCTS' based on the selectedBookId
          const productRef = doc(db, 'GENERAL PRODUCTS', selectedBookId);
          const productSnapshot = await getDoc(productRef);
  
          if (productSnapshot.exists()) {
            const currentQuantity = productSnapshot.data().Quantity || 0;
            const enteredQuantity = parseInt(item.quantity, 10);
  
            if (enteredQuantity > currentQuantity) {
              // If the quantity is insufficient, show the error modal
              const remainingQuantity = currentQuantity;
              const bookName = productSnapshot.data().BookName || 'Unknown Book';
              console.error(`bookName: ${bookName}, remainingQuantity: ${remainingQuantity}`);
              this.setState({
                showErrorModal: true,
                errorMessage: `Insufficient quantity for ${bookName}.`,
                remainingQuantity,
              });
              return; // Stop further processing
            }
  
            // Update the quantity in the 'GENERAL PRODUCTS' collection
            const updatedQuantity = currentQuantity - enteredQuantity;
            await updateDoc(productRef, { Quantity: updatedQuantity });
            console.log(`Quantity updated for ${selectedBookId}. New quantity: ${updatedQuantity}`);
  
            // Update the state for the corresponding item
            updateItemState(selectedBookId, enteredQuantity);
          } else {
            console.error(`Document does not exist for ${selectedBookId} in 'GENERAL PRODUCTS'.`);
          }
        } catch (error) {
          console.error(`Error updating quantity for ${selectedBookId}:`, error);
        }
      } else {
        console.error('Selected book ID is undefined.');
      }
    }
  
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
          key={item.label}
          currency={currency}
          inventoryData={this.state.inventoryData}
          onQuantityUpdate={this.handleQuantityUpdate.bind(this)}
         
        />
      );
    }, this); // Pass 'this' as the second argument to ensure the correct context

    return (
      <div>
        <Table>
          <thead>
            <tr>
              <th>Books</th>
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
        <Button className="fw-bold btn-success ms-2" onClick={this.handleDone}>
          Done
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
    this.props.onQuantityUpdate(this.props.item.name, 0);
  }

  

  handleQuantityChange = (event) => {
    const newQuantity = event.target.value;
    const itemName = this.props.item?.name || '';

    // Call the parent component's quantity update handler
    this.props.onQuantityUpdate(itemName, newQuantity);
  };

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
            onChange={this.handleQuantityChange}
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
              value: this.props.item.price,
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

export default OrderItem;