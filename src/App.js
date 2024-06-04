import React, { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom';
import { firebaseApp } from './firebase/firebase';
import HomePage from './pages/homepage';



function App() {
 
  const [isSticky, setIsSticky] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Function to check login status
  const checkLoginStatus = async () => {
    try {
      const adminRef = firebaseApp.firestore().collection('Admin');
      const snapshot = await adminRef.where('isLoggedIn', '==', true).get();
      if (snapshot.empty) {
        console.log('No matching documents.');
        setLoggedIn(false);
        navigate('/signin');
      } else {
        snapshot.forEach(doc => {
          console.log(doc.id, '=>', doc.data());
          setLoggedIn(true);
        });
      }
    } catch (err) {
      console.error('Error getting documents: ', err);
    }
  };

  useEffect(() => {
    checkLoginStatus(); // Call checkLoginStatus when the component mounts
  }, []);



  return (
    <div>
      {loggedIn ? <HomePage  isLoggedin={loggedIn} /> : null}
      <h1 className='welcome-message'>Welcome to KV Publishers</h1>
            <div className='flex'>
                
                <img className='book' src='https://firebasestorage.googleapis.com/v0/b/kvpublication-daat.appspot.com/o/images%2Fbook-147292_1280.png?alt=media&token=16ce76f5-8141-4896-93ef-515433f4e911' alt='KV Publishers'/>
              
                <div className='info'>
                
                
                <p>No:57, MGR SALAI</p>
                <p>ARCOT - 632503</p>
                <p>RANIPET, TAMILNADU.</p>
                <p>PH: 04172-233850/234850</p>
                <p>CELL: 9445222850/9443490174</p>
                <p>E-mail: kvpublishers@yahoo.com</p>
                </div>
            </div>
    </div>
  );
}

export default App;