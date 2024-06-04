// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../IMAGES/logo.jpeg';
import { firebaseApp } from '../firebase/firebase';
const Navbar = ({ isLoggedin }) => {

  const handleLogoClick = () => {
    window.location.href = '/';
  };


    const handleSignOut = () => {
        // Update the isLoggedIn field to false in Firestore
        const adminRef = firebaseApp.firestore().collection('Admin');
        // set the isLoggedIn field to false 
        adminRef.doc('YcY68bRONX2Hi7euVWBc').update({
          isLoggedIn: false
        }).then(() => {
          console.log('User signed out successfully!');
          // Redirect to the '/signin' route after signing out
          window.location.href = '/signin';
        })
        .catch(error => {
          console.error('Error signing out:', error);
        });
      };
    
  return (
   //restric access to /creditbalnce and /orderform if not logged in
    <nav className='navbar'>
      <img className='logo' src={logo} onClick={handleLogoClick} style={{ cursor: 'pointer' }} />
      <div className='links'>
        
        <Link to='/'>Home</Link>
        <Link to='/orderform'>Order Form</Link>
        <Link to='/creditbalance'>Credit Balance</Link>
        <Link onClick={handleSignOut}>Sign Out</Link>
      </div>
    </nav>
  );
};

export default Navbar;