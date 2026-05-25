import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // ייבוא של קומפוננטת הראוטינג המרכזית
//import './styles/index.css'; // במידה ויש לך קובץ עיצוב גלובלי

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);