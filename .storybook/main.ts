import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/stories/RatingScale.stories.tsx",
    "../src/stories/CreateManuallyPanel.stories.tsx",
    "../src/stories/QuestionCard.stories.tsx",
    "../src/stories/QuestionEditor.stories.tsx",
    "../src/stories/SurveyBuilder.stories.tsx",
    "../src/stories/SurveyL2Nav.stories.tsx",
    "../src/stories/AllSurveys.stories.tsx",
    "../src/stories/SurveyDetails.stories.tsx",
    "../src/stories/FormInput.stories.tsx",
    "../src/stories/Textarea.stories.tsx",
    "../src/stories/Chip.stories.tsx"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/react-vite"
};
export default config;