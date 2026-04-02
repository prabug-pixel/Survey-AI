import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { processMessage } from '../../store/chatSlice';
import SurveyHeader from './SurveyHeader/SurveyHeader';
import AiChatPanel from './AiChatPanel/AiChatPanel';
import SurveyPreview from './SurveyPreview/SurveyPreview';
import EmptyState from './EmptyState/EmptyState';
import QuestionEditor from './QuestionEditor/QuestionEditor';
import styles from './SurveyBuilder.module.scss';

const SurveyBuilder: React.FC = () => {
  const dispatch = useAppDispatch();
  const surveyGenerated = useAppSelector((s) => s.survey.surveyGenerated);
  const editorOpen = useAppSelector((s) => s.survey.editorPanel.isOpen);

  const handleTemplateSelect = (templateId: string) => {
    const templateNames: Record<string, string> = {
      csat: 'Customer satisfaction survey for a healthcare clinic',
      feedback: 'General feedback form for our business',
      employee: 'Employee experience survey for our company',
      event: 'Event feedback form for attendees',
    };
    dispatch(processMessage(templateNames[templateId] || `Create a ${templateId} survey`) as never);
  };

  return (
    <div className={styles.surveyBuilder}>
      <SurveyHeader />

      <div className={styles.workspace}>
        <AiChatPanel />

        <div className={styles.contentArea}>
          {surveyGenerated ? (
            <SurveyPreview />
          ) : (
            <EmptyState onTemplateSelect={handleTemplateSelect} />
          )}
        </div>

        {editorOpen && <QuestionEditor />}
      </div>
    </div>
  );
};

export default SurveyBuilder;
