import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { processMessage } from '../../store/chatSlice';
import { surveyActions } from '../../store/surveySlice';
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
  const activeTab = useAppSelector((s) => s.survey.activeTab);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleTemplateSelect = (prompt: string) => {
    dispatch(processMessage(prompt) as never);
  };

  const hasQuestionType = (types: DOMStringList | ReadonlyArray<string>) =>
    Array.from(types).includes('application/question-type');

  const handleDragEnter = (e: React.DragEvent) => {
    if (hasQuestionType(e.dataTransfer.types)) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (hasQuestionType(e.dataTransfer.types)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const questionType =
      e.dataTransfer.getData('application/question-type') ||
      e.dataTransfer.getData('text/plain');
    if (questionType) {
      dispatch(surveyActions.addDroppedQuestion({ type: questionType }));
    }
  };

  const showManualDropZone = activeTab === 'manual' && !surveyGenerated;

  return (
    <div className={styles.surveyBuilder}>
      <SurveyHeader />

      <div className={styles.workspace}>
        <AiChatPanel />

        <div
          className={`${styles.contentArea} ${isDragOver ? styles.dragOver : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {surveyGenerated ? (
            <SurveyPreview />
          ) : showManualDropZone ? (
            <div className={styles.dropZone}>
              <div className={styles.dropZoneInner}>
                <p className={styles.dropZoneText}>
                  {isDragOver ? 'Release to add question' : 'Drop questions here to build your survey'}
                </p>
              </div>
            </div>
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
