// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import InvoiceForm from './components/InvoiceForm';
import CreditNote from './components/CreditNote';
import OrderForm from './components/OrderForm';


function App() {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check the scroll position and update the state
      setIsSticky(window.scrollY > 0);
    };

    // Attach the event listener to the scroll event
    window.addEventListener('scroll', handleScroll);

    // Remove the event listener when the component is unmounted
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Router>
      <div className={`App ${isSticky ? 'sticky' : ''}`}>
        <nav className="navbar">
          <Container>
            <ul>
              <li>
                <Link to="/creditbalance">Credit Balance</Link>
              </li>
              <li>
                <Link to="/orderform">Order Form</Link>
              </li>
            </ul>
          </Container>
        </nav>

        <Container>
          <Routes>

            <Route path="/creditbalance" element={<CreditNote />} />
            <Route path="/orderform" element={<OrderForm />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
