import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { surveyActions } from '../../store/surveySlice';
import { chatActions } from '../../store/chatSlice';
import { SAMPLE_CHAT_CSAT } from '../../constants/sampleSurvey';
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
    // Simulate AI generating a survey from template selection
    dispatch(chatActions.addUserMessage(`${templateId.toUpperCase()} Survey`));
    dispatch(chatActions.setTyping(true));

    setTimeout(() => {
      dispatch(chatActions.setTyping(false));
      dispatch(chatActions.setChatHistory(SAMPLE_CHAT_CSAT));
      dispatch(surveyActions.loadSampleSurvey());
    }, 800);
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
