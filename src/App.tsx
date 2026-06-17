import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout/AppLayout';
import SurveyBuilder from './components/SurveyBuilder/SurveyBuilder';
import AllSurveys from './components/AllSurveys/AllSurveys';
import SurveyDetails from './components/SurveyDetails/SurveyDetails';
import SurveyCampaigns from './components/SurveyDetails/SurveyCampaigns';
import TicketingLanding from './components/Ticketing/TicketingLanding';
import CustomFieldsManager from './components/Ticketing/CustomFieldsManager';
import SourcesManager from './components/Ticketing/SourcesManager';
import AssignmentRulesManager from './components/Ticketing/AssignmentRulesManager';
import SlaRulesManager from './components/Ticketing/SlaRulesManager';
import AgentProductivityReport from './components/Ticketing/AgentProductivityReport';
import TicketResolutionTimeReport from './components/Ticketing/TicketResolutionTimeReport';
import TicketCountReport from './components/Ticketing/TicketCountReport';
import { CustomFieldsProvider } from './components/Ticketing/CustomFieldsContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

const App: React.FC = () => (
  <BrowserRouter>
    <CustomFieldsProvider>
      <AppLayout>
        <Routes>
          <Route path="/surveys" element={<ErrorBoundary><AllSurveys /></ErrorBoundary>} />
          <Route path="/surveys/create" element={<ErrorBoundary><SurveyBuilder /></ErrorBoundary>} />
          <Route path="/surveys/:surveyId" element={<ErrorBoundary><SurveyDetails /></ErrorBoundary>} />
          <Route path="/surveys/:surveyId/campaigns" element={<ErrorBoundary><SurveyCampaigns /></ErrorBoundary>} />
          <Route path="/ticketing" element={<ErrorBoundary><TicketingLanding /></ErrorBoundary>} />
          <Route path="/ticketing/settings/fields"     element={<ErrorBoundary><CustomFieldsManager /></ErrorBoundary>} />
          <Route path="/ticketing/settings/sources"    element={<ErrorBoundary><SourcesManager /></ErrorBoundary>} />
          <Route path="/ticketing/settings/assignment" element={<ErrorBoundary><AssignmentRulesManager /></ErrorBoundary>} />
          <Route path="/ticketing/settings/sla"        element={<ErrorBoundary><SlaRulesManager /></ErrorBoundary>} />
          <Route path="/ticketing/reports/agent-productivity" element={<ErrorBoundary><AgentProductivityReport /></ErrorBoundary>} />
          <Route path="/ticketing/reports/resolution-time"    element={<ErrorBoundary><TicketResolutionTimeReport /></ErrorBoundary>} />
          <Route path="/ticketing/reports/ticket-count"       element={<ErrorBoundary><TicketCountReport /></ErrorBoundary>} />
          <Route path="/survey/create" element={<Navigate to="/surveys/create" replace />} />
          <Route path="*" element={<Navigate to="/surveys" replace />} />
        </Routes>
      </AppLayout>
    </CustomFieldsProvider>
  </BrowserRouter>
);

export default App;
