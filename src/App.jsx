import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Form2 from './Form2';
import Edit2 from './Edit2';

const App = () => {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route path="/" element={<Form2 />} />
          <Route path="/edit2/:id" element={<Edit2/>} /> 
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
