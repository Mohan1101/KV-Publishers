// import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import Table from 'react-bootstrap/Table';
// import Button from 'react-bootstrap/Button';
// import { BiTrash } from 'react-icons/bi';
// import EditableField from './EditableField';
// import { getDocs, collection, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
// import { db } from '../firebase/firebase'; // Import the initialized Firestore instance
// import Modal from 'react-bootstrap/Modal';
// import Spinner from 'react-bootstrap/Spinner';

// class OrderItem extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       inventoryData: [], // Initialize an empty array to store inventory data
//       items: [],
//       isSubmitting: false,
//       remainingQuantity: 0,
//       differenceQuantity:0,
//       showErrorModal: false,
//       errorMessage: '',
//     };
//   }



//   async componentDidMount() {
//     try {
//       // Create a query to fetch documents from 'GENERAL PRODUCTS' where 'Category' is 'Inventory'
//       const q = query(collection(db, 'GENERAL PRODUCTS'), where('Category', '==', 'Inventory'));
  
//       // Execute the query and get the snapshot
//       const productsSnapshot = await getDocs(q);
  
//       console.log('Products Snapshot:', productsSnapshot.docs); // Log the documents
  
//       const inventoryData = productsSnapshot.docs.map((doc) => ({
//         label: doc.id,
//         value: doc.data().BookName,
//         quantity: doc.data().Quantity,
//         price: doc.data().SellingPrice,
//       }));
  
//       console.log('Inventory Data:', inventoryData);
//       console.log('diff:', this.state.differenceQuantity);
  
//       this.setState({ inventoryData });
//     } catch (error) {
//       console.error('Error fetching inventory data:', error);
//     }
//   }
  
 
  

//   handleDone = async () => {
//     this.setState({ isSubmitting: true });
//     const updateItemState = (selectedBookId, enteredQuantity) => {
//       this.setState((prevState) => {
//         const updatedItems = prevState.items.map((item) => {
//           if (item.name === selectedBookId) {
//             return { ...item, quantity: enteredQuantity };
//           }
//           return item;
//         });
//         return { items: updatedItems };
//       });
//     };
  
//     // Iterate through the items and update the quantity in the inventory
//     console.log('Items:', this.props.items);
//     for (const item of this.props.items) {
//       const selectedBookId = item.name; // Use item.name as the identifier
  
//       // Add a check to ensure that selectedBookId is defined
//       if (selectedBookId) {
//         try {
//           // Fetch the quantity from 'GENERAL PRODUCTS' based on the selectedBookId
//           const productRef = doc(db, 'GENERAL PRODUCTS', selectedBookId);
//           const productSnapshot = await getDoc(productRef);
  
//           if (productSnapshot.exists()) {
//             const currentQuantity = productSnapshot.data().Quantity || 0;
//             const enteredQuantity = parseInt(item.quantity, 10);
  
//             if (enteredQuantity > currentQuantity) {
//               // If the quantity is insufficient, show the error modal
//               const remainingQuantity = currentQuantity;
//               const bookName = productSnapshot.data().BookName || 'Unknown Book';
//               console.error(`bookName: ${bookName}, remainingQuantity: ${remainingQuantity}`);
//               this.setState({
//                 showErrorModal: true,
//                 errorMessage: `Insufficient quantity for ${bookName}.`,
//                 remainingQuantity,
//               });
//               return; // Stop further processing
//             }
  
//             // Update the quantity in the 'GENERAL PRODUCTS' collection
//             const updatedQuantity = currentQuantity - enteredQuantity;
//             await updateDoc(productRef, { Quantity: updatedQuantity });
//             console.log(`Quantity updated for ${selectedBookId}. New quantity: ${updatedQuantity}`);
  
//             // Update the state for the corresponding item
//             updateItemState(selectedBookId, enteredQuantity);
//           } else {
//             console.error(`Document does not exist for ${selectedBookId} in 'GENERAL PRODUCTS'.`);
//           }
//         } catch (error) {
//           console.error(`Error updating quantity for ${selectedBookId}:`, error);
//         }
//       } else {
//         console.error('Selected book ID is undefined.');
//       }
//     }
//     this.setState({ isSubmitting: false });
//     this.props.onItemsDone(true);
//   };

//   handleModalClose = () => {
//     // Calculate the total difference between entered quantity and remaining quantity
//     const totalDifference = this.props.items.reduce((total, item) => {
//       const enteredQuantity = parseInt(item.quantity, 10);
//       const remainingQuantity = this.state.remainingQuantity;
//       return total + (enteredQuantity - remainingQuantity);
//     }, 0);
    
//     // Update the state for each item with the new values
//     const updatedItems = this.props.items.map((item) => ({
//       ...item,
//       quantity: this.state.remainingQuantity, // Update quantity to remaining quantity
//       pendingQuantity: totalDifference, // Update pendingQuantity to the total difference
//     }));
  
//     this.setState({
//       showErrorModal: false,
//       errorMessage: '',
//       remainingQuantity: 0,
//       differenceQuantity: totalDifference, // Set differenceQuantity as a single number
//       // Update the state for items with the new values
//       items: updatedItems,
//     }, () => {
//       // Log the updated difference after the state has been updated
//       console.log('updatedItems:', this.state.items);
//       console.log('difference:', this.state.differenceQuantity);
//       console.log('items:', this.props.items)
//     });
//     this.setState({ showErrorModal: false, isSubmitting: false });
//   };
  




  
   

//   render() {
//     var onItemizedItemEdit = this.props.onItemizedItemEdit;
//     var currency = this.props.currency;
//     var rowDel = this.props.onRowDel;
//     var itemTable = this.props.items.map(function (item) {
//       return (
//         <ItemRow
//           onItemizedItemEdit={onItemizedItemEdit}
//           item={item}
//           onDelEvent={rowDel.bind(this)}
//           key={item.label}
//           currency={currency}
//           inventoryData={this.state.inventoryData}
//           differenceQuantity={this.state.differenceQuantity}
//           remainingQuantity={this.state.remainingQuantity}

 
         
//         />
//       );
//     }, this); // Pass 'this' as the second argument to ensure the correct context

//     return (
//       <div>
//         <Table>
//           <thead>
//             <tr>
//               <th>Books</th>
//               <th>QTY</th> 
//               <th>PendingQTY</th>
//               <th>PRICE/RATE</th>
//               <th className="text-center">ACTION</th>
//             </tr>
//           </thead>
//           <tbody>{itemTable}</tbody>
//         </Table>
//         <p className="text-danger">Please add all items before clicking on Submit, wrong entries cannot be reverted.</p>
//         <Button className="fw-bold btn-secondary" onClick={this.props.onRowAdd}>
//           Add Item
//         </Button>
//         <Button className="fw-bold btn-success ms-2" onClick={this.handleDone} disabled={this.state.isSubmitting}>
//           {this.state.isSubmitting  ? (
//             <>
//               <Spinner animation="border" size="sm" className="me-2" />
//               Submitting...
//             </>
//           ) : (
//             'Submit'
//           )}
//         </Button>
        
//         <Modal show={this.state.showErrorModal} onHide={this.handleModalClose} className='p-2' >
//           <Modal.Header closeButton>
//             <Modal.Title>Error</Modal.Title>
//           </Modal.Header>
//           <Modal.Body className='my-3 fw-normal fs-5 text-danger'>
//             {this.state.errorMessage} No. of quantities left: {this.state.remainingQuantity}
//           </Modal.Body>
         
//         </Modal>
//       </div>
//     );
//   }
// }

// class ItemRow extends React.Component {
//   onDelEvent() {
//     this.props.onDelEvent(this.props.item);
//   }



//   render() {
//     return (
//       <tr>
//         <td style={{ width: '100%' }}>
//             <EditableField
//                 onItemizedItemEdit={this.props.onItemizedItemEdit}
//                 cellData={{
//                 type: 'select',
//                 name: 'name',
//                 placeholder: 'Select Item',
//                 options: this.props.inventoryData,
//                 value: this.props.item.name,
//                 id: this.props.item.id,
                
//                 }}
                
//             />
//         </td>
//         <td style={{ minWidth: '120px' }}>
//         <EditableField
//   onItemizedItemEdit={this.props.onItemizedItemEdit}
//   cellData={{
//     type: 'number',
//     name: 'quantity',
//     min: 1,
//     step: '1',
//     value: this.props.item.quantity !== undefined ? this.props.item.quantity : this.props.remainingQuantity,
//     id: this.props.item.id,
//   }}
// />

//         </td>
//         <td style={{ minWidth: '120px' }}>
//         <EditableField
//     onItemizedItemEdit={this.props.onItemizedItemEdit}
//     cellData={{
//         type: 'number',
//         name: 'pendingQuantity', // Ensure this matches the property name in your state
//         min: 0,
//         step: '1',
//         textAlign: 'text-end',
//         value: this.props.item.pendingQuantity = this.props.differenceQuantity,
//         id: this.props.item.id,
//         readOnly: true, // Make the field non-editable
//     }}
// />


// </td>
//         <td style={{ minWidth: '130px' }}>
//         <EditableField
//             onItemizedItemEdit={this.props.onItemizedItemEdit}
//             cellData={{
//               leading: this.props.currency,
//               type: 'number',
//               name: 'price',
//               min: 1,
//               step: '0.01',
//               precision: 2,
//               textAlign: 'text-end',
//               value: this.props.item.price = this.props.inventoryData.find((item) => item.label == this.props.item.name)?.price || 0,
//               id: this.props.item.id,
//             }}
          
            
//           />
//         </td>
//         <td className="text-center" style={{ minWidth: '50px' }}>
//           <BiTrash
//             onClick={this.onDelEvent.bind(this)}
//             style={{ height: '33px', width: '33px', padding: '7.5px' }}
//             className="text-white mt-1 btn btn-danger"
//           />
//         </td>
//       </tr>
//     );
//   }
// }

// export default OrderItem;


import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { BiTrash } from 'react-icons/bi';
import EditableField from './EditableField';
import { getDocs, collection, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase'; // Import the initialized Firestore instance
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

class OrderItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inventoryData: [], // Initialize an empty array to store inventory data
      items: [],
      isSubmitting: false,
      remainingQuantity: 0,
      differenceQuantity: 0,
      showErrorModal: false,
      errorMessage: '',
    };
  }



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
      console.log('diff:', this.state.differenceQuantity);

      this.setState({ inventoryData });
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  }




  handleDone = async () => {
    this.setState({ isSubmitting: true });
  
    // Iterate through the items and update the quantity in the inventory
    console.log('Items:', this.props.items);
  
    // Keep track of insufficient quantity errors
    let insufficientQuantityError = false;
  
    // Keep track of items that have already triggered an insufficient quantity error
    const itemsWithInsufficientQuantityError = new Set();
  
    for (const item of this.props.items) {
      const selectedBookId = item.name; // Use item.name as the identifier
      console.log('selectedBookId:', selectedBookId);
  
      // Skip items that have already triggered an insufficient quantity error
      if (itemsWithInsufficientQuantityError.has(selectedBookId)) {
        continue;
      }
  
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
              // If the quantity is insufficient, set the error flag but continue processing
              insufficientQuantityError = true;
              this.setState({ remainingQuantity: currentQuantity });
              const remainingQuantity = currentQuantity;
              const bookName = productSnapshot.data().BookName || 'Unknown Book';
              console.error(`bookName: ${bookName}, remainingQuantity: ${remainingQuantity}`);
              // Update the state for the corresponding item to mark it as having an insufficient quantity
              this.props.onItemizedItemEdit2(item.name, 'remainingQuantity', remainingQuantity);
  
              // Show the error modal for each item that falls under insufficient check
              this.setState({
                showErrorModal: true,
                errorMessage: `Insufficient quantity for ${bookName}. Quantity left: ${remainingQuantity}`,
                
              });
  
              // Add the item to the set of items with an insufficient quantity error
              itemsWithInsufficientQuantityError.add(selectedBookId);
  
              const totalDifference = enteredQuantity - remainingQuantity;
              console.log('totalDifference:', totalDifference);
              // Update the state for the corresponding item
              this.props.onItemizedItemEdit2(item.name, 'quantity', remainingQuantity);
              this.props.onItemizedItemEdit2(item.name, 'pendingQuantity', totalDifference);
            } else {
              // Update the quantity in the 'GENERAL PRODUCTS' collection
              const updatedQuantity = currentQuantity - enteredQuantity;
              await updateDoc(productRef, { Quantity: updatedQuantity });
              console.log(`Quantity updated for ${selectedBookId}. New quantity: ${updatedQuantity}`);
              // Update the state for the corresponding item
              this.props.onItemizedItemEdit2(item.name, 'quantity', enteredQuantity);
            }
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
  
    this.setState({ isSubmitting: false });
  
    this.props.onItemsDone(!insufficientQuantityError);
  };

  handleModalClose = () => {
    this.setState({ showErrorModal: false, errorMessage: '', remainingQuantity: 0 });
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
          differenceQuantity={this.state.differenceQuantity}
          remainingQuantity={this.state.remainingQuantity}



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
              <th>Available QTY</th>
              <th>PendingQTY</th>
              <th>PRICE/RATE</th>
              <th className="text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>{itemTable}</tbody>
        </Table>
        <p className="text-danger">Please add all items before clicking on Submit, wrong entries cannot be reverted.</p>
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

        <Modal show={this.state.showErrorModal} onHide={this.handleModalClose} className='p-2' >
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body className='my-3 fw-normal fs-5 text-danger'>
            {this.state.errorMessage} No. of quantities left: {this.state.remainingQuantity}
          </Modal.Body>

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
              id: this.props.item.name,

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
              id: this.props.item.name,
            }}
          />

        </td>
        <td style={{ minWidth: '120px' }}>
          <EditableField
            onItemizedItemEdit={this.props.onItemizedItemEdit}
            cellData={{
              type: 'number',
              name: 'remainingQuantity',
              min: 0,
              step: '1',
              value: this.props.item.remainingQuantity = this.props.remainingQuantity,
              id: this.props.item.name,
            }}
          />

        </td>
        <td style={{ minWidth: '120px' }}>
          <EditableField
            onItemizedItemEdit={this.props.onItemizedItemEdit}
            cellData={{
              type: 'number',
              name: 'pendingQuantity', // Ensure this matches the property name in your state
              min: 0,
              step: '1',
              textAlign: 'text-end',
              value: this.props.item.pendingQuantity,
              id: this.props.item.name,
              readOnly: true, // Make the field non-editable
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
              id: this.props.item.name,
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