import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseApp } from '../firebase/firebase';

const Signin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        if (id === 'username') setUsername(value);
        else if (id === 'password') setPassword(value);
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
    
        try {
            const adminRef = firebaseApp.firestore().collection('Admin');
            const snapshot = await adminRef.where('username', '==', username).where('password', '==', password).get();
    
            if (snapshot.empty) {
                setError('Invalid username or password');
                return;
            }
    
            snapshot.forEach(doc => {
                // Update the isLoggedIn field to true
                adminRef.doc(doc.id).update({
                    isLoggedIn: true
                })
                .then(() => {
                    console.log('User logged in successfully!');
                    // Navigate to the home page after successful login
                    navigate('/');
                })
                .catch(error => {
                    console.error('Error updating document: ', error);
                    setError('Error updating document. Please try again later.');
                });
            });
        } catch (err) {
            console.error('Error signing in:', err);
            setError('Error signing in. Please try again later.');
        }
    };

    return (
        <div>
            <nav className='Signin'>
                <h1>KV Publishers</h1>

            </nav>
            <div className="signin-container">
            <h2>Sign In</h2>
            <form onSubmit={handleSignIn}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label><br />
                    <input type="text" id="username" value={username} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label><br />
                    <input type="password" id="password" value={password} onChange={handleInputChange} required />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit">Sign In</button>
            </form>
        </div>
        </div>
    );
};

export default Signin;
