// main.jsx or App.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EventList from './components/EventList';
import ConfirmEmail from './components/confirmemail';

 export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EventList />} />
        <Route path="/confirm" element={<ConfirmEmail />} />
      </Routes>
    </BrowserRouter>
  );
}
