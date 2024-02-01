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


class InvoiceModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,  // Add a saving state
    };
  }


  uploadToFirebase = async () => {
    this.setState({ saving: true });
    console.log('Saving state set to true');
    GenerateInvoice(async (pdfBlob) => {
      const pdfFileName = `Invoice-${Date.now()}.pdf`;
      const storageRef = ref(storage, pdfFileName);
      

      try {
        // Upload compressed PDF to Firebase Storage
        await uploadBytes(storageRef, pdfBlob);
        console.log('Compressed PDF uploaded to Firebase Storage');

        const downloadURL = await getDownloadURL(storageRef);

        // Create a new document in the 'Bill' collection with relevant fields, including the date
        const billCollectionRef = collection(db, 'Bill');
        await addDoc(billCollectionRef, {
          Amount: `${this.props.currency} ${this.props.total}`,
          Downloadablelink: downloadURL,
          Product: this.props.items.map(item => item.name).join(', '),
          Receiver: this.props.info.billToNo || '-',
          Date: this.props.info.currentDate,
          // Add more fields as needed
        });


        console.log('Invoice details uploaded to Firestore (Bill collection)');

        // Redirect to the desired URL after successful upload
        window.location.assign('https://kvpublication-daat.web.app/');

      } catch (error) {
        console.error('Error uploading compressed PDF to Firebase Storage:', error);
      }

      this.setState({ saving: false });
      console.log('Saving state set to false');

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
      downloadLink.download = 'Invoice.pdf';

      // Trigger a click on the anchor tag to initiate the download
      downloadLink.click();
    });
  };


  render() {
    return (
      <div>
        <Modal show={this.props.showModal} onHide={this.props.closeModal} size="lg" centered >
          <div id="invoiceCapture">
            <div className="p-4">
              <Row className="mb-0">
                <Col md={6} style={{ border: '1px solid black', padding: '10px' }} >
                  <div style={{ lineHeight: '4px', paddingLeft: '2px', paddingBottom: '2px' }}>
                    &nbsp;
                    <p>KAVIN BOOK HOUSE</p>
                    <p>No:14/0,No:30/2,1st Floor</p>
                    <p>SUNGUVAR AGRAHARAM STREET,</p>
                    <p>CHINTADRIPET,CHENNAI:600002.</p>
                    <p>GST NO:33AJZPA2347Q1ZN</p>
                    <p>E-mail:kavinbookhouse@gmail.com</p>
                  </div>
                </Col>
                <Col md={6} >
                  <Row className="mb-0">
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Invoice No.:</div>
                      <div>1</div>
                    </Col>
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Dated</div>
                      <div>{this.props.info.currentDate}</div>
                    </Col>
                  </Row>
                  <Row className="mb-0">
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Delivery Note</div>
                      <div>{this.props.info.delNo || '-'}</div>
                    </Col>
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Mode/Terms of Payment</div>
                      <div>{this.props.info.payment || '-'}</div>
                    </Col>
                  </Row>
                  <Row className="mb-0">
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Supplier's Ref</div>
                      <div>{this.props.info.Sref || '-'}</div>
                    </Col>
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Other Reference(s)</div>
                      <div>{this.props.info.Oref || '-'}</div>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="mb-0">
                <Col md={6} style={{ border: '1px solid black', padding: '20px' }}>
                  <div className="fw-bold">Billed to:</div>
                  <div style={{ paddingTop: '5px', fontSize: '14px' }}>{this.props.info.billToAddress || '-'}</div>
                  <div style={{ paddingTop: '20px' }}><strong>Contact No. :&nbsp;</strong>{this.props.info.billToNo || '-'}</div>
                  <div style={{ paddingTop: '5px' }}><strong>GST No.:</strong>&nbsp;{this.props.info.GSTNO || '-'}</div>
                  <div style={{ paddingTop: '5px' }}><strong>E-Mail:</strong>&nbsp;{this.props.info.billToEmail || '-'}</div>
                </Col>
                <Col md={6} >
                  <Row className="mb-0">
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Buyer's Ref</div>
                      <div>{this.props.info.Bref || '-'}</div>
                    </Col>
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Dated</div>
                      <div>{this.props.info.bdate || '-'}</div>
                    </Col>
                  </Row>
                  <Row className="mb-0">
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Despatch Document No.</div>
                      <div>{this.props.info.ddNo || '-'}</div>
                    </Col>
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Dated:</div>
                      <div>{this.props.info.ddDate || '-'}</div>
                    </Col>
                  </Row>
                  <Row className="mb-0">
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Despatched through</div>
                      <div>{this.props.info.disthru || '-'}</div>
                    </Col>
                    <Col md={6} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Destination</div>
                      <div>{this.props.info.destn || '-'}</div>
                    </Col>
                  </Row>
                  <Row className="mb-0">
                    <Col md={12} style={{ border: '1px solid black', padding: '3px' }} >
                      <div className="fw-bold">Terms of Delivery</div>
                      <div>{this.props.info.tod || '-'}</div>
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
                  {this.props.currency} {Math.floor(this.props.discountAmmount)}
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
                    <p><strong>Bank:</strong>&nbsp;{this.props.info.bank || '-'}</p>
                    <p><strong>Branch</strong>:&nbsp;{this.props.info.branch || '-'}</p>
                    <p><strong>Current Account No. :</strong>&nbsp;{this.props.info.AccNo || '-'}</p>
                    <p><strong>IFSC:</strong>&nbsp;{this.props.info.ifsc || '-'}</p>
                    <p><strong>Account Name :</strong> &nbsp; KAVIN BOOK HOUSE</p>
                  </div>
                </Col>
              </Row>
              <Row  >
                <Col md={6} style={{ border: '1px solid black', padding: '3px' }}>
                  Declaration
                  We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct
                </Col>
                <Col style={{ border: '1px solid black', padding: '3px' }}>
                  <p style={{ paddingLeft: '210px' }}>For KAVIN BOOK HOUSE</p>

                  <p style={{ paddingBottom: '2px', paddingTop: '30px', fontWeight: 'bold', paddingLeft: '245px', fontSize: '16px', lineHeight: '6px' }}>S.Ammaiappan</p>
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

export default InvoiceModal;