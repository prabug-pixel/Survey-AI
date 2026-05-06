import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout/AppLayout';
import SurveyBuilder from './components/SurveyBuilder/SurveyBuilder';
import AllSurveys from './components/AllSurveys/AllSurveys';
import SurveyDetails from './components/SurveyDetails/SurveyDetails';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

const App: React.FC = () => (
  <BrowserRouter>
    <AppLayout>
      <Routes>
        <Route path="/surveys" element={<ErrorBoundary><AllSurveys /></ErrorBoundary>} />
        <Route path="/surveys/create" element={<ErrorBoundary><SurveyBuilder /></ErrorBoundary>} />
        <Route path="/surveys/:surveyId" element={<ErrorBoundary><SurveyDetails /></ErrorBoundary>} />
        <Route path="/survey/create" element={<Navigate to="/surveys/create" replace />} />
        <Route path="*" element={<Navigate to="/surveys" replace />} />
      </Routes>
    </AppLayout>
  </BrowserRouter>
);

export default App;
