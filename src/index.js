import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import OrderForm from './components/OrderForm';
import CreditNote from './components/CreditNote';
import Signin from './components/Signin';
import './App.css';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
 
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/orderform",
    element: <OrderForm />,
  },
  {
    path: "/creditbalance",
    element: <CreditNote />,
  },
]);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    
    
  </React.StrictMode>
);