import type { SurveyTemplate } from '../types/survey.types';

// --- Industry profiles for dynamic template generation ---

interface IndustryTemplateProfile {
  industry: string;
  contexts: {
    title: string;
    description: string;
  }[];
}

const TEMPLATE_POOL: IndustryTemplateProfile[] = [
  {
    industry: 'Healthcare',
    contexts: [
      {
        title: 'Patient satisfaction survey',
        description:
          "We run a multi-specialty clinic and want to measure patient satisfaction after visits. The survey should cover wait times, doctor communication, staff friendliness, treatment explanation, facility cleanliness, and whether patients would recommend us. We'd also like to capture the department visited and whether it was a first visit or follow-up.",
      },
      {
        title: 'Hospital discharge feedback',
        description:
          "Our hospital wants to survey patients after discharge to understand their inpatient experience. We need to assess admission process, nursing care quality, doctor attentiveness, pain management, food quality, room cleanliness, and the discharge process. Include questions about whether instructions were clearly explained.",
      },
    ],
  },
  {
    industry: 'Restaurant',
    contexts: [
      {
        title: 'Restaurant dining experience',
        description:
          "We own a family restaurant and want to gather feedback from diners about their experience. The survey should cover food quality, portion sizes, menu variety, service speed, server attentiveness, restaurant ambiance, cleanliness, and value for money. We'd like to know if guests would return and what dishes they enjoyed most.",
      },
      {
        title: 'Food delivery feedback',
        description:
          "We've recently started offering delivery through our restaurant. We want to survey customers about their delivery experience including order accuracy, food temperature on arrival, packaging quality, delivery speed, and how the delivered food compares to dining in. We'd also like to know which delivery platform they used.",
      },
    ],
  },
  {
    industry: 'SaaS',
    contexts: [
      {
        title: 'Product onboarding survey',
        description:
          "We're a B2B SaaS company and want to survey new users after their first 30 days. The survey should assess the onboarding experience, ease of getting started, documentation quality, whether key features were discoverable, support responsiveness, and overall satisfaction with the platform. Include questions about their role and team size.",
      },
      {
        title: 'Feature satisfaction survey',
        description:
          "We just launched a major update to our project management tool and need user feedback. The survey should evaluate the new dashboard redesign, notification system, reporting features, and collaboration tools. We want to know what users like, what's confusing, and what's missing. Target power users who have been active in the last week.",
      },
    ],
  },
  {
    industry: 'Education',
    contexts: [
      {
        title: 'Course evaluation form',
        description:
          "Our university needs an end-of-semester course evaluation survey. It should assess teaching effectiveness, course material quality, assignment relevance, grading fairness, instructor availability outside class, and overall learning outcomes. Include demographics like year of study, major, and whether the course was required or elective.",
      },
      {
        title: 'Student campus experience',
        description:
          "We want to survey students about their overall campus experience including housing quality, dining options, library resources, career services, mental health support, extracurricular activities, and campus safety. The goal is to identify areas for improvement in student life and services.",
      },
    ],
  },
  {
    industry: 'Hotel',
    contexts: [
      {
        title: 'Hotel guest experience',
        description:
          "We manage a boutique hotel and want to survey guests after checkout. The survey should cover the booking process, check-in experience, room cleanliness and comfort, amenities quality, breakfast service, staff helpfulness, noise levels, and overall value for money. We'd also like to know the purpose of their stay and how they found us.",
      },
      {
        title: 'Resort activity feedback',
        description:
          "Our beach resort offers various activities and excursions. We want to survey guests about the activities they participated in, the quality of instructors and guides, equipment condition, safety measures, booking ease, and whether the activities met their expectations. Include questions about which activities they'd recommend.",
      },
    ],
  },
  {
    industry: 'Retail',
    contexts: [
      {
        title: 'In-store shopping experience',
        description:
          "We operate a chain of home improvement stores and want to measure the in-store customer experience. The survey should assess store layout and navigation, product availability, staff knowledge and helpfulness, checkout speed, return policy satisfaction, and overall store cleanliness. We want to compare satisfaction across our locations.",
      },
      {
        title: 'Post-purchase product feedback',
        description:
          "We sell premium kitchen appliances and want feedback from recent buyers about their purchase experience and product satisfaction. The survey should cover the research and buying process, product quality, ease of setup, performance versus expectations, and whether they'd buy from us again. We'd like to segment by product category.",
      },
    ],
  },
  {
    industry: 'Fitness',
    contexts: [
      {
        title: 'Gym membership feedback',
        description:
          "We run a fitness center and want to survey our members about their experience. The survey should cover equipment quality and variety, facility cleanliness, class schedule and variety, trainer expertise, peak hour crowding, locker room conditions, and membership value. We'd like to understand what would increase their visit frequency.",
      },
      {
        title: 'Personal training satisfaction',
        description:
          "We offer personal training packages at our gym and want to evaluate client satisfaction. The survey should assess trainer knowledge, program customization, progress tracking, communication, scheduling flexibility, motivation techniques, and whether clients are seeing results. Include questions about their fitness goals.",
      },
    ],
  },
  {
    industry: 'E-Commerce',
    contexts: [
      {
        title: 'Online shopping experience',
        description:
          "We run an online fashion store and want to survey recent customers. The survey should cover website ease of use, search and filter functionality, product photo accuracy, size guide helpfulness, checkout process, delivery speed, packaging quality, and return experience. We'd like to know how we compare to competitors.",
      },
      {
        title: 'Subscription box feedback',
        description:
          "We operate a monthly subscription box service for artisan snacks. We want to survey subscribers about product variety and quality, packaging presentation, value for price, discovery of new favorites, delivery reliability, and how likely they are to gift a subscription to someone. Include questions about dietary preferences.",
      },
    ],
  },
  {
    industry: 'Automotive',
    contexts: [
      {
        title: 'Auto service experience',
        description:
          "We run an auto repair shop and want to measure customer satisfaction after service visits. The survey should cover appointment scheduling ease, wait time, service quality, pricing transparency, staff communication about repairs needed, vehicle condition after service, and whether the issue was fully resolved. We'd like to know the type of service received.",
      },
      {
        title: 'Car dealership experience',
        description:
          "Our dealership wants to survey customers after vehicle purchases. The survey should assess the sales process, salesperson knowledge and helpfulness, test drive experience, financing options, trade-in satisfaction, delivery condition of the vehicle, and overall dealership experience. Include questions about what influenced their purchase decision.",
      },
    ],
  },
  {
    industry: 'Finance',
    contexts: [
      {
        title: 'Banking experience survey',
        description:
          "We're a community bank looking to assess customer satisfaction. The survey should cover in-branch experience, digital banking usability, loan application process, fee transparency, issue resolution speed, staff expertise, and whether customers feel their financial needs are being met. We'd like to understand channel preferences.",
      },
      {
        title: 'Insurance claims feedback',
        description:
          "Our insurance company wants to survey policyholders who recently filed claims. The survey should assess the claims filing process, adjuster responsiveness, communication clarity, settlement fairness, time to resolution, and overall satisfaction with how their claim was handled. Include questions about the type of claim and policy.",
      },
    ],
  },
  {
    industry: 'Real Estate',
    contexts: [
      {
        title: 'Tenant satisfaction survey',
        description:
          "We manage several apartment communities and want to survey our tenants. The survey should cover maintenance request responsiveness, communication from management, amenity quality, noise levels, common area cleanliness, lease renewal likelihood, and suggestions for community improvements. We'd like to segment by property.",
      },
      {
        title: 'Home buying experience',
        description:
          "Our real estate agency wants to survey recent home buyers about their experience. The survey should cover agent responsiveness, property showing quality, negotiation support, paperwork clarity, closing process smoothness, and whether the agent understood their needs and budget. Include questions about how they found our agency.",
      },
    ],
  },
  {
    industry: 'Events',
    contexts: [
      {
        title: 'Conference attendee feedback',
        description:
          "We're organizing a tech conference and want to survey attendees afterward. The survey should assess keynote quality, breakout session relevance, networking opportunities, venue and logistics, food and beverage quality, mobile app experience, and overall value of attendance. We'd like to know which sessions they attended and their role.",
      },
      {
        title: 'Webinar feedback form',
        description:
          "My company is hosting a webinar for the first time. We want to survey attendees after the event to get feedback on how it went. We'd like to know their overall impression, whether they would attend another webinar, and their opinions on how well the event was organized and the length. We also want feedback on the quality of the moderator and speaker.",
      },
    ],
  },
  {
    industry: 'HR',
    contexts: [
      {
        title: 'Employee engagement survey',
        description:
          "We need to measure employee engagement across our organization. The survey should assess job satisfaction, relationship with management, career development opportunities, work-life balance, company culture, compensation fairness, and likelihood to recommend us as an employer. Include questions about department and tenure.",
      },
      {
        title: 'Employee exit interview',
        description:
          "We need a survey for employee exit interviews. The survey should assess how the departing employee feels about various aspects of the company culture, such as diversity, equity, and inclusion, whether their work was meaningful, their opinion on working with their team and supervisor, and their reasons for leaving. Include questions on the employee's level and department.",
      },
    ],
  },
  {
    industry: 'Dental',
    contexts: [
      {
        title: 'Dental visit feedback',
        description:
          "We run a dental practice and want to survey patients after their appointments. The survey should cover appointment scheduling ease, wait time, dentist communication, pain management, treatment explanation, hygienist professionalism, office cleanliness, and billing clarity. We'd like to know if patients would refer friends and family.",
      },
    ],
  },
];

/**
 * Generate a set of diverse survey template suggestions.
 * Shuffles from the pool and picks one context per industry to ensure variety.
 */
export function generateTemplates(count = 4): SurveyTemplate[] {
  // Flatten all contexts with their industry tag
  const allContexts = TEMPLATE_POOL.flatMap((profile) =>
    profile.contexts.map((ctx) => ({
      industry: profile.industry,
      ...ctx,
    }))
  );

  // Shuffle using Fisher-Yates
  const shuffled = [...allContexts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Pick `count` items, ensuring no two from the same industry
  const picked: SurveyTemplate[] = [];
  const usedIndustries = new Set<string>();

  for (const item of shuffled) {
    if (picked.length >= count) break;
    if (usedIndustries.has(item.industry)) continue;
    usedIndustries.add(item.industry);
    picked.push({
      id: `${item.industry.toLowerCase().replace(/[^a-z]/g, '_')}_${Date.now()}_${picked.length}`,
      title: item.title,
      description: item.description,
    });
  }

  return picked;
}
