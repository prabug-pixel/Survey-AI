import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout/AppLayout';
import SurveyBuilder from './components/SurveyBuilder/SurveyBuilder';

const App: React.FC = () => (
  <BrowserRouter>
    <AppLayout>
      <Routes>
        <Route path="/survey/create" element={<SurveyBuilder />} />
        <Route path="*" element={<Navigate to="/survey/create" replace />} />
      </Routes>
    </AppLayout>
  </BrowserRouter>
);

export default App;
