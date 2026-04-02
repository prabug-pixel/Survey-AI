import React from 'react';
import PreviewToolbar from './PreviewToolbar/PreviewToolbar';
import SurveyForm from './SurveyForm/SurveyForm';
import { useAppSelector } from '../../../store';
import styles from './SurveyPreview.module.scss';

const SurveyPreview: React.FC = () => {
  const previewMode = useAppSelector((s) => s.survey.previewMode);

  return (
    <div className={styles.preview}>
      <PreviewToolbar />
      <div className={`${styles.previewArea} ${previewMode === 'mobile' ? styles.mobile : ''}`}>
        <div className={styles.formContainer}>
          <SurveyForm />
        </div>
      </div>
    </div>
  );
};

export default SurveyPreview;
