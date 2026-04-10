import React, { useState } from 'react';
import styles from './CreateManuallyPanel.module.scss';

// --- Icon Components (Material Design 20x20, matching Figma) ---

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 3.5C11.26 3.5 13.5 5.74 13.5 8.5C13.5 9.7 13.08 10.8 12.38 11.66L16.06 15.34L15.34 16.06L11.66 12.38C10.8 13.08 9.7 13.5 8.5 13.5C5.74 13.5 3.5 11.26 3.5 8.5C3.5 5.74 5.74 3.5 8.5 3.5ZM8.5 4.5C6.29 4.5 4.5 6.29 4.5 8.5C4.5 10.71 6.29 12.5 8.5 12.5C10.71 12.5 12.5 10.71 12.5 8.5C12.5 6.29 10.71 4.5 8.5 4.5Z" fill="#8F8F8F"/>
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.83 12.08L10 7.92L14.17 12.08L15 11.25L10 6.25L5 11.25L5.83 12.08Z" fill="#555"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.83 7.92L10 12.08L14.17 7.92L15 8.75L10 13.75L5 8.75L5.83 7.92Z" fill="#555"/>
  </svg>
);

const DragIndicatorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 4.167a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm-5 4.583a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm-5 4.583a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" fill="#BDBDBD"/>
  </svg>
);

// --- Question Type Icons ---

const WelcomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="welcome_mask" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
      <rect width="20" height="20" fill="#D9D9D9"/>
    </mask>
    <g mask="url(#welcome_mask)">
      <path d="M13.694 18.479c-.153 0-.284-.052-.39-.156a.546.546 0 0 1-.16-.38c0-.148.054-.276.16-.381a.544.544 0 0 1 .39-.16c1.037-.006 1.913-.367 2.628-1.085.715-.718 1.076-1.593 1.081-2.624a.541.541 0 0 1 .155-.382.541.541 0 0 1 .38-.16c.148 0 .276.053.381.16a.537.537 0 0 1 .159.381c0 1.33-.465 2.46-1.395 3.39-.93.93-2.059 1.394-3.39 1.394ZM2.058 6.854a.54.54 0 0 1-.384-.156.547.547 0 0 1-.154-.386c0-1.33.466-2.461 1.398-3.393.933-.932 2.061-1.398 3.385-1.398.149 0 .276.051.382.155a.543.543 0 0 1 .16.383.54.54 0 0 1-.16.383.544.544 0 0 1-.383.154c-1.036.005-1.912.367-2.627 1.085-.715.718-1.076 1.593-1.08 2.624a.547.547 0 0 1-.155.386.543.543 0 0 1-.383.16ZM15.242 4.778c0 .143-.058.273-.173.388l-4.418 4.41a.404.404 0 0 1-.377.16.476.476 0 0 1-.369-.17.433.433 0 0 1-.169-.396.455.455 0 0 1 .169-.38l4.39-4.397a.404.404 0 0 1 .385-.173c.143 0 .273.057.388.172.115.114.173.243.173.386Zm.998 2.416c0 .142-.058.269-.173.38l-3.71 3.701a.424.424 0 0 1-.38.167.467.467 0 0 1-.373-.177.44.44 0 0 1-.157-.393c.005-.145.063-.272.173-.383l3.681-3.681a.42.42 0 0 1 .38-.173c.142 0 .271.058.386.173.115.115.173.244.173.386ZM4.362 15.141c-1.05-1.05-1.58-2.311-1.592-3.782-.011-1.47.511-2.735 1.567-3.79l1.798-1.798a.57.57 0 0 1 .486-.211.55.55 0 0 1 .477.202l.441.441c.138.138.258.288.36.451a.89.89 0 0 1 .164.566l3.093-3.085a.42.42 0 0 1 .38-.173c.142 0 .271.058.386.173.116.115.173.244.173.386a.473.473 0 0 1-.173.38l-3.8 3.8-.704.741.195.196c.488.488.734 1.072.738 1.753.004.68-.237 1.263-.722 1.748l-.17.17a.424.424 0 0 1-.38.167.467.467 0 0 1-.373-.178.44.44 0 0 1-.165-.396c0-.148.055-.274.165-.38l.16-.16c.263-.263.391-.588.385-.975-.007-.387-.142-.715-.406-.982l-.503-.506a.504.504 0 0 1-.205-.472.504.504 0 0 1 .205-.478l.414-.393c.22-.227.331-.499.331-.817 0-.318-.11-.587-.331-.808l-.121-.12-1.545 1.516c-.839.839-1.251 1.849-1.239 3.03.013 1.182.439 2.192 1.277 3.03.839.839 1.84 1.258 3.009 1.258 1.169 0 2.17-.419 3.003-1.258l4.37-4.362a.42.42 0 0 1 .386-.176c.14 0 .268.058.383.173.116.115.173.244.173.386a.474.474 0 0 1-.173.38l-4.373 4.352c-1.049 1.056-2.305 1.584-3.768 1.584-1.464 0-2.723-.528-3.779-1.584Z" fill="#303030"/>
    </g>
  </svg>
);

const ShortTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7h14v1.2H3V7Zm0 4h9v1.2H3V11Z" fill="#303030"/>
  </svg>
);

const ParagraphIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 5.5h14v1.2H3V5.5Zm0 3.5h14v1.2H3V9Zm0 3.5h14v1.2H3V12.5Z" fill="#303030"/>
  </svg>
);

const HelpTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm0 1v12h10V4H5Zm2 2h6v1H7V6Zm0 2.5h6v1H7v-1Zm0 2.5h4v1H7V11Z" fill="#303030"/>
  </svg>
);

const NpsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm0 1.2a6.3 6.3 0 1 1 0 12.6 6.3 6.3 0 0 1 0-12.6ZM7.5 8.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm5 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-5.77 3.3h.54c.45 1.24 1.6 2.1 2.98 2.1s2.53-.86 2.98-2.1h.54A3.73 3.73 0 0 1 10 14.6a3.73 3.73 0 0 1-3.27-2.8Z" fill="#303030"/>
  </svg>
);

const RatingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3.36 11.65 7.57l4.21.37-3.19 2.77.97 4.11L10 12.93l-3.64 1.89.97-4.11-3.19-2.77 4.21-.37L10 3.36Zm0 1.83L8.72 8.5l-3.39.3 2.56 2.22-.78 3.3L10 12.63l2.89 1.69-.78-3.3 2.56-2.22-3.39-.3L10 5.19Z" fill="#303030"/>
  </svg>
);

const MultipleChoiceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="10" r="3" stroke="#303030" strokeWidth="1.2" fill="none"/>
    <circle cx="6" cy="10" r="1.5" fill="#303030"/>
    <line x1="11" y1="10" x2="17" y2="10" stroke="#303030" strokeWidth="1.2"/>
  </svg>
);

const CheckboxesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.5" y="4.5" width="5" height="5" rx="1" stroke="#303030" strokeWidth="1.1" fill="none"/>
    <path d="M5 7l1.2 1.2L8.5 5.7" stroke="#303030" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <rect x="3.5" y="11.5" width="5" height="5" rx="1" stroke="#303030" strokeWidth="1.1" fill="none"/>
    <line x1="11" y1="7" x2="17" y2="7" stroke="#303030" strokeWidth="1.1"/>
    <line x1="11" y1="14" x2="17" y2="14" stroke="#303030" strokeWidth="1.1"/>
  </svg>
);

const DropdownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="6.5" stroke="#303030" strokeWidth="1.2" fill="none"/>
    <path d="M7.5 9l2.5 2.5L12.5 9" stroke="#303030" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const MatrixRadioIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="3" y1="5" x2="8" y2="5" stroke="#303030" strokeWidth="1.1"/>
    <line x1="3" y1="10" x2="8" y2="10" stroke="#303030" strokeWidth="1.1"/>
    <line x1="3" y1="15" x2="8" y2="15" stroke="#303030" strokeWidth="1.1"/>
    <circle cx="12" cy="5" r="1.5" stroke="#303030" strokeWidth="0.9" fill="none"/>
    <circle cx="16" cy="5" r="1.5" stroke="#303030" strokeWidth="0.9" fill="none"/>
    <circle cx="12" cy="10" r="1.5" stroke="#303030" strokeWidth="0.9" fill="none"/>
    <circle cx="16" cy="10" r="1.5" fill="#303030"/>
    <circle cx="12" cy="15" r="1.5" fill="#303030"/>
    <circle cx="16" cy="15" r="1.5" stroke="#303030" strokeWidth="0.9" fill="none"/>
  </svg>
);

const MatrixRatingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3v14M15 3v14M3 5h14M3 15h14M3 10h14M10 3v14" stroke="#303030" strokeWidth="1.1"/>
  </svg>
);

const MatrixDropdownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="6.5" stroke="#303030" strokeWidth="1.2" fill="none"/>
    <line x1="10" y1="5" x2="10" y2="15" stroke="#303030" strokeWidth="1"/>
    <line x1="5" y1="10" x2="15" y2="10" stroke="#303030" strokeWidth="1"/>
    <path d="M8 8.5l2 2 2-2" stroke="#303030" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const ContactInfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.5" y="4" width="15" height="12" rx="1.5" stroke="#303030" strokeWidth="1.2" fill="none"/>
    <circle cx="8" cy="9" r="1.8" stroke="#303030" strokeWidth="1" fill="none"/>
    <path d="M5 14.5c0-1.66 1.34-2.5 3-2.5s3 .84 3 2.5" stroke="#303030" strokeWidth="1" strokeLinecap="round" fill="none"/>
    <line x1="13" y1="8.5" x2="15.5" y2="8.5" stroke="#303030" strokeWidth="1"/>
    <line x1="13" y1="11" x2="15.5" y2="11" stroke="#303030" strokeWidth="1"/>
  </svg>
);

const DateTimeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="14" height="13" rx="1.5" stroke="#303030" strokeWidth="1.2" fill="none"/>
    <line x1="3" y1="8" x2="17" y2="8" stroke="#303030" strokeWidth="1.2"/>
    <line x1="7" y1="3" x2="7" y2="5.5" stroke="#303030" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="13" y1="3" x2="13" y2="5.5" stroke="#303030" strokeWidth="1.2" strokeLinecap="round"/>
    <rect x="5.5" y="10" width="2" height="2" rx="0.3" fill="#303030"/>
    <rect x="9" y="10" width="2" height="2" rx="0.3" fill="#303030"/>
    <rect x="12.5" y="10" width="2" height="2" rx="0.3" fill="#303030"/>
    <rect x="5.5" y="13.5" width="2" height="2" rx="0.3" fill="#303030"/>
    <rect x="9" y="13.5" width="2" height="2" rx="0.3" fill="#303030"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2.5c-3.04 0-5.5 2.38-5.5 5.31 0 3.98 5.5 9.69 5.5 9.69s5.5-5.71 5.5-9.69c0-2.93-2.46-5.31-5.5-5.31Zm0 1.2c2.37 0 4.3 1.86 4.3 4.11 0 2.95-3.76 7.55-4.3 8.22-.54-.67-4.3-5.27-4.3-8.22 0-2.25 1.93-4.11 4.3-4.11Zm0 2.3a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z" fill="#303030"/>
  </svg>
);

const ReviewCollectorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="14" height="14" rx="2" stroke="#303030" strokeWidth="1.2" fill="none"/>
    <path d="M10 6l1.18 2.39 2.64.38-1.91 1.86.45 2.63L10 12.1l-2.36 1.16.45-2.63-1.91-1.86 2.64-.38L10 6Z" fill="#303030"/>
  </svg>
);

const ReviewRequestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.5" y="3" width="13" height="14" rx="1.5" stroke="#303030" strokeWidth="1.2" fill="none"/>
    <line x1="6" y1="7" x2="14" y2="7" stroke="#303030" strokeWidth="1"/>
    <line x1="6" y1="10" x2="14" y2="10" stroke="#303030" strokeWidth="1"/>
    <line x1="6" y1="13" x2="11" y2="13" stroke="#303030" strokeWidth="1"/>
  </svg>
);

const ThankYouIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" stroke="#303030" strokeWidth="1.2" fill="none"/>
    <circle cx="7.5" cy="8.5" r="0.8" fill="#303030"/>
    <circle cx="12.5" cy="8.5" r="0.8" fill="#303030"/>
    <path d="M6.5 12a4 4 0 0 0 7 0" stroke="#303030" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
  </svg>
);

const PageTitleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.5" y="3" width="13" height="14" rx="1.5" stroke="#303030" strokeWidth="1.2" fill="none"/>
    <line x1="6" y1="7" x2="14" y2="7" stroke="#303030" strokeWidth="1.2"/>
    <line x1="6" y1="10" x2="12" y2="10" stroke="#303030" strokeWidth="1"/>
    <line x1="6" y1="13" x2="10" y2="13" stroke="#303030" strokeWidth="1"/>
  </svg>
);

const PageBreakIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 3h12a1 1 0 0 1 1 1v4h-1.2V4.2H4.2v3.8H3V4a1 1 0 0 1 1-1ZM4 17h12a1 1 0 0 0 1-1v-4h-1.2v3.8H4.2V12H3v4a1 1 0 0 0 1 1Z" fill="#303030"/>
    <path d="M3 10h2.5M8 10h4M15.5 10H18" stroke="#303030" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// --- Question type data ---

interface QuestionTypeItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface QuestionCategory {
  title: string;
  items: QuestionTypeItem[];
}

const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    title: 'Welcome question',
    items: [
      { id: 'welcome', label: 'Welcome', icon: <WelcomeIcon /> },
    ],
  },
  {
    title: 'Choice questions',
    items: [
      { id: 'short_text', label: 'Short text', icon: <ShortTextIcon /> },
      { id: 'paragraph', label: 'Paragraph', icon: <ParagraphIcon /> },
      { id: 'help_text', label: 'Help text', icon: <HelpTextIcon /> },
      { id: 'nps', label: 'Net Promoter Score', icon: <NpsIcon /> },
      { id: 'rating', label: 'Rating', icon: <RatingIcon /> },
      { id: 'multiple_choice', label: 'Multiple choice', icon: <MultipleChoiceIcon /> },
      { id: 'checkboxes', label: 'Checkboxes', icon: <CheckboxesIcon /> },
      { id: 'dropdown', label: 'Dropdown', icon: <DropdownIcon /> },
      { id: 'matrix_radio', label: 'Matrix radio choice', icon: <MatrixRadioIcon /> },
      { id: 'matrix_ratings', label: 'Matrix ratings', icon: <MatrixRatingsIcon /> },
      { id: 'matrix_dropdown', label: 'Matrix dropdown', icon: <MatrixDropdownIcon /> },
      { id: 'contact_info', label: 'Contact information', icon: <ContactInfoIcon /> },
      { id: 'date_time', label: 'Date / Time', icon: <DateTimeIcon /> },
      { id: 'location', label: 'Location', icon: <LocationIcon /> },
      { id: 'review_collector', label: 'Review collector', icon: <ReviewCollectorIcon /> },
      { id: 'review_request', label: 'Review request', icon: <ReviewRequestIcon /> },
    ],
  },
  {
    title: 'Others',
    items: [
      { id: 'thank_you', label: 'Thank you page', icon: <ThankYouIcon /> },
      { id: 'page_title', label: 'Page title', icon: <PageTitleIcon /> },
      { id: 'page_break', label: 'Page break', icon: <PageBreakIcon /> },
    ],
  },
];

const CreateManuallyPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredCategories = QUESTION_CATEGORIES.map((category) => ({
    ...category,
    items: category.items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0);

  return (
    <div className={styles.panel}>
      {/* Search */}
      <div className={styles.searchField}>
        <span className={styles.searchIcon}>
          <SearchIcon />
        </span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search a question type"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className={styles.categories}>
        {filteredCategories.map((category) => {
          const isCollapsed = collapsedSections[category.title];

          return (
            <div key={category.title} className={styles.category}>
              <button
                type="button"
                className={styles.categoryHeader}
                onClick={() => toggleSection(category.title)}
                aria-expanded={!isCollapsed}
              >
                <span className={styles.categoryTitle}>{category.title}</span>
                <span className={styles.categoryChevron}>
                  {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
                </span>
              </button>

              {!isCollapsed && (
                <div className={styles.categoryItems}>
                  {category.items.map((item) => (
                    <div key={item.id} className={styles.questionCard} draggable>
                      <div className={styles.cardContent}>
                        <span className={styles.cardIcon}>{item.icon}</span>
                        <span className={styles.cardLabel}>{item.label}</span>
                      </div>
                      <span className={styles.dragHandle}>
                        <DragIndicatorIcon />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreateManuallyPanel;
