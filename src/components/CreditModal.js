import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { BiPaperPlane, BiCloudDownload } from "react-icons/bi";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { storage, db } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';


async function GenerateInvoice(downloadCallback) {
  const element = document.getElementById('invoiceCapture');
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/jpeg', 0.7);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  if (downloadCallback) {
    downloadCallback(pdf.output('blob'));
  }
}


function convertToIndianWords(amount) {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const scales = ["", "Thousand", "Lakh", "Crore"];

  const words = [];

  if (amount === 0) {
    return "Zero Rupees";
  }

  let scaleIndex = 0;

  while (amount > 0) {
    const hundredPart = amount % 1000;
    if (hundredPart > 0) {
      const hundredPartWords = [];

      if (hundredPart >= 100) {
        hundredPartWords.push(ones[Math.floor(hundredPart / 100)]);
        hundredPartWords.push("Hundred");
      }

      const tensPart = hundredPart % 100;
      if (tensPart > 0) {
        if (tensPart < 20) {
          hundredPartWords.push(ones[tensPart]);
        } else {
          hundredPartWords.push(tens[Math.floor(tensPart / 10)]);
          hundredPartWords.push(ones[tensPart % 10]);
        }
      }

      if (scaleIndex > 0) {
        hundredPartWords.push(scales[scaleIndex]);
      }

      words.unshift(...hundredPartWords);
    }

    amount = Math.floor(amount / 1000);
    scaleIndex++;
  }

  words.push("Rupees");
  return words.join(" ");
}


class CreditModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,  // Add a saving state
    };
  }

  uploadToFirebase = async () => {
    this.setState({ saving: true }); 
    GenerateInvoice(async (pdfBlob) => {
      const pdfFileName = `Order-${Date.now()}.pdf`;
      const storageRef = ref(storage, pdfFileName);
      const { SchoolName, Principal, Address, Contact, Email } = this.props.schoolInfo;
  
      try {
        // Upload compressed PDF to Firebase Storage
        await uploadBytes(storageRef, pdfBlob);
        console.log('Compressed PDF uploaded to Firebase Storage');
  
        const downloadURL = await getDownloadURL(storageRef);
  
        // Create a new document in the 'Orders' collection with relevant fields, excluding 'Products'
        const ordersCollectionRef = collection(db, 'Credit');

try {
  // Using addDoc to create a new document
  const orderDocRef = await addDoc(ordersCollectionRef, {
    Amount: `${this.props.currency} ${this.props.total}`,
    Downloadablelink: downloadURL,
    Products: this.props.items.map(item => ({
      name: item.name,
      quantity: item.quantity
    })),
    SchoolName,
    Principal,
    Address,
    Contact,
    Email,
    Date: this.props.info.currentDate,
    // Add more fields as needed
  });

  console.log('Document created successfully:', orderDocRef.id);
} catch (error) {
  console.error('Error creating document:', error);
}


  
  
  
        // Redirect to the desired URL after successful upload
        window.location.assign('https://kvpublication-daat.web.app/');
  
      } catch (error) {
        console.error('Error uploading compressed PDF to Firebase Storage:', error);
      }
      finally {
        this.setState({ saving: false });  // Reset saving state to false
      }
    });
  };
  
  



 // Update the downloadInvoice function to initiate the download
 downloadInvoice = () => {
  // Call the existing function to generate the invoice without uploading
  GenerateInvoice((pdfBlob) => {
    // Create a temporary anchor tag
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(pdfBlob);

    // Set the download attribute with the desired file name
    downloadLink.download = 'CreditNote.pdf';

    // Trigger a click on the anchor tag to initiate the download
    downloadLink.click();
  });
};


  render() {
    const { SchoolName, Principal, Address, Contact, Email } = this.props.schoolInfo;
    return (
      <div>
        <Modal show={this.props.showModal} onHide={this.props.closeModal} size="lg" centered >
          <div id="invoiceCapture">
            <div className="p-4">
              <Row className="mb-0">
                <Col md={6} style={{ border: '1px solid black', padding: '5px' }} >
                  
                  <div className="fw-bold d-flex flex-column">
                    <p>Credit to:</p>
                    <p className=" ">School Name:&nbsp; {SchoolName}</p>
                    <p className=" ">Principal Name: &nbsp;{Principal}</p>
                    
                    <p className=" ">Address: &nbsp;{Address}</p>
                    
                    <p className=" ">Contact: &nbsp; {Contact}</p>
                    
                    <p className=" ">Email: &nbsp; {Email}</p>

                    
                    <p className=" ">Ordered Date: {this.props.info.bdate}
                    </p>
                  </div>
                </Col>

                <Col md={6} style={{ border: '1px solid black', padding: '5px' }} >
                  <div className='fw-bold'>

                    <p>From</p>
                    <p>KV PUBLISHERS</p>
                    <p>No:57, MGR SALAI</p>
                    <p>ARCOT - 632503</p>
                    <p>RANIPET,TAMILNADU.</p>
                    <p>PH: 04172-233850/234850</p>
                    <p>CELL: 9445222850/9443490174</p>
                    <p>E-mail:kvpublishers@yahoo.com</p>
                  </div>
                </Col>
              </Row>
              <Row className="mb-0">
              <Col md={6} >
                  <Row className="mb-0">
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Invoice No.:</div>
                      <div>1</div>
                    </Col>
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Dated:</div>
                      <div>{this.props.info.currentDate}</div>
                    </Col>
                  </Row>
                 
                 
                
                </Col>
                <Col md={6} >
                  
                 
                  <Row className="mb-0">
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Despatch Document No.:</div>
                      <div>{this.props.info.ddNo || '-'}</div>
                    </Col>
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Dated:</div>
                      <div>{this.props.info.ddDate || '-'}</div>
                    </Col>
                  </Row>
                 
                  
                </Col>
              </Row>

              <Row className="mb-0">
                <Col md={6} style={{ border: '1px solid black', padding: '3px' }}>
                  <div>DESCRIPTION</div>
                </Col>
                <Col style={{ border: '1px solid black', padding: '3px' }}>
                  <div>QTY</div>
                </Col>
                <Col style={{ border: '1px solid black', padding: '3px' }}>
                  <div>PRICE</div>
                </Col>
                <Col style={{ border: '1px solid black', padding: '3px' }}>
                  <div>Discount</div>
                </Col>
                <Col style={{ border: '1px solid black', padding: '3px' }} >
                  <div>AMOUNT</div>
                </Col>
              </Row>

              {this.props.items.map((item, i) => (
                <Row key={i} style={{ height: '30px' }} >
                  <Col md={6} style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>
                    {item.name}
                  </Col>
                  <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>
                    {item.quantity}
                  </Col>
                  <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>
                    {this.props.currency} {item.price}
                  </Col>
                  <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>
                  </Col>
                  <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>
                    {this.props.currency} {item.price * item.quantity}
                  </Col>
                </Row>
              ))}
              <Row style={{ height: '20px' }} >
                <Col md={6} style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>
                </Col>
                <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>

                </Col>
                <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>

                </Col>
                <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>

                </Col>
                <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>

                </Col>
              </Row>
              <Row style={{ height: '20px' }} >
                <Col md={6} style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>
                </Col>
                <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>

                </Col>
                <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>

                </Col>
                <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>
                  {this.props.info.discountRate}%
                </Col>
                <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>
                {this.props.currency} {Math.floor(this.props.discountAmount)}
                </Col>


              </Row>
              <Row style={{ height: '20px' }} >
                <Col md={6} style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>
                </Col>
                <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>

                </Col>
                <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>

                </Col>
                <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>

                </Col>
                <Col style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}>

                </Col>

              </Row>
              <Row >
                <Col md={6} style={{ border: '1px solid black', padding: '3px' }}>
                  <strong>TOTAL</strong>
                </Col>
                <Col style={{ border: '1px solid black', padding: '3px' }}>

                </Col>
                <Col style={{ border: '1px solid black', padding: '3px' }}>

                </Col>
                <Col style={{ border: '1px solid black', padding: '3px' }}>
                </Col>
                <Col style={{ border: '1px solid black', padding: '3px' }}>
                  &nbsp;&nbsp;{this.props.currency} {this.props.total}
                </Col>
              </Row>
              <Row >
                <Col md={6} style={{ border: '1px solid black', padding: '3px' }}>
                  Amount Chargeable (in  words)
                </Col>
                <Col style={{ border: '1px solid black', padding: '3px' }}>
                  Request you to transfer the fund to the following account details and share the UTR no with us
                </Col>
              </Row>
              <Row  >
                <Col md={6} style={{ border: '1px solid black', padding: '3px' }}>
                  {convertToIndianWords(this.props.total)}
                </Col>
                <Col style={{ border: '1px solid black', padding: '3px' }}>
                  <div style={{ lineHeight: '8px', padding: '4px' }}>
                    &nbsp;
                    <p><strong>Bank:</strong>&nbsp; Tamilnad Mercantile Bank</p>
                    <p><strong>Branch:</strong>&nbsp; Arcot</p>
                    <p><strong>Current Account No. :</strong>&nbsp; 251539443490174</p>
                    <p><strong>IFSC:</strong>&nbsp; TMBL0000251</p>
                    <p><strong>Account Name :</strong> &nbsp; KV PUBLISHERS</p>
                  </div>
                </Col>
              </Row>
              <Row  >
                <Col md={6} style={{ border: '1px solid black', padding: '3px' }}>
                  Declaration
                  We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct
                </Col>

                <Col style={{ border: '1px solid black', padding: '3px' }}>
                  <p style={{ paddingLeft: '240px' }}>For KV PUBLISHERS</p>

                  <p style={{ paddingBottom: '2px', paddingTop: '30px', fontWeight: 'bold', paddingLeft: '245px', fontSize: '16px', lineHeight: '6px' }}>&nbsp; Velandhan. K</p>
                  <p style={{ paddingLeft: '230px', fontSize: '14px', fontWeight: 'bold' }}>Authorised Signatory</p>
                </Col>
                
              </Row>



            </div>
          </div>
          <div className="pb-4 px-4">
            <Row>
              <Col md={6}>
              {this.state.saving ? (
                  <Button variant="outline-success" className="d-block w-100 mt-3 mt-md-0" disabled>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </Button>
                ) : (
                  <Button variant="outline-success" className="d-block w-100 mt-3 mt-md-0" onClick={this.uploadToFirebase}>
                    <BiPaperPlane style={{ width: '16px', height: '16px', marginTop: '-3px' }} className="me-2" />
                    Save
                  </Button>
                )}
              </Col>

              <Col md={6}>
                <Button variant="outline-primary" className="d-block w-100 mt-3 mt-md-0" onClick={this.downloadInvoice}>
                  <BiCloudDownload style={{ width: '16px', height: '16px', marginTop: '-3px' }} className="me-2" />
                  Download Copy
                </Button>
              </Col>
            </Row>
          </div>
        </Modal>
        <hr className="mt-4 mb-3" />
      </div>
    )
  }
}

export default CreditModal;