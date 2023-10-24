import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import TesteComponent from './components/TesteComponent.jsx'
import { Provider, useSelector } from 'react-redux';
import { store } from './reduxStore/store';



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
    <Provider store={store}> 
      <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
)
