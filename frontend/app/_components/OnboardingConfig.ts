// OnboardingConfig.ts

// Configuration for role-specific onboarding questionnaires

export const ONBOARDING_CONFIG = {
  // Creator onboarding
  creator: {
    title: "Creator Onboarding",
    steps: [
      {
        id: "creator-step-1",
        title: "Basic Profile",
        description: "Tell us about yourself and your content",
        fields: [
          {
            id: "displayName",
            label: "Your Name",
            type: "text",
            placeholder: "Kasun Silva",
            required: true,
          },
          {
            id: "creatorCategory",
            label: "Creator Category",
            type: "select",
            options: [
              { value: "", label: "Select category" },
              { value: "tech", label: "Tech" },
              { value: "fashion", label: "Fashion" },
              { value: "beauty", label: "Beauty" },
              { value: "fitness", label: "Fitness" },
              { value: "food", label: "Food" },
              { value: "travel", label: "Travel" },
              { value: "lifestyle", label: "Lifestyle" },
              { value: "business", label: "Business" },
            ],
            required: true,
          },
          {
            id: "primaryPlatform",
            label: "Primary Platform",
            type: "select",
            options: [
              { value: "instagram", label: "Instagram" },
              { value: "tiktok", label: "TikTok" },
              { value: "youtube", label: "YouTube" },
              { value: "x", label: "X" },
              { value: "linkedin", label: "LinkedIn" },
            ],
            required: true,
          },
          {
            id: "website",
            label: "Website",
            type: "text",
            placeholder: "https://your-site.com",
          },
          {
            id: "location",
            label: "Location",
            type: "text",
            placeholder: "Colombo, Sri Lanka",
          },
          {
            id: "bio",
            label: "Bio",
            type: "textarea",
            placeholder: "Describe your audience, content style, and what brands should know.",
          },
        ],
      },
      {
        id: "creator-step-2",
        title: "Social & Portfolio",
        description: "Connect your social profiles and portfolio",
        fields: [
          {
            id: "socialHandles",
            label: "Social Handles",
            type: "socialHandles",
            description: "Add the channels you already use so your account is ready for integrations.",
            fields: [
              { id: "instagram", label: "Instagram", placeholder: "Instagram handle" },
              { id: "tiktok", label: "TikTok", placeholder: "TikTok handle" },
              { id: "youtube", label: "YouTube", placeholder: "YouTube handle" },
              { id: "linkedin", label: "LinkedIn", placeholder: "LinkedIn handle" },
              { id: "x", label: "X", placeholder: "X handle" },
            ],
          },
          {
            id: "portfolio",
            label: "Portfolio Link",
            type: "text",
            placeholder: "https://your-portfolio.com",
          },
        ],
      },
    ],
  },

  // Brand onboarding
  brand: {
    title: "Brand Onboarding",
    steps: [
      {
        id: "brand-step-1",
        title: "Company Information",
        description: "Tell us about your brand",
        fields: [
          {
            id: "displayName",
            label: "Full name or team lead",
            type: "text",
            placeholder: "Aisha Perera",
            required: true,
          },
          {
            id: "companyName",
            label: "Company Name",
            type: "text",
            placeholder: "Collabkar Labs",
            required: true,
          },
          {
            id: "website",
            label: "Website",
            type: "text",
            placeholder: "https://your-brand.com",
          },
          {
            id: "location",
            label: "Location",
            type: "text",
            placeholder: "Colombo, Sri Lanka",
          },
          {
            id: "bio",
            label: "About Your Brand",
            type: "textarea",
            placeholder: "Tell creators what your brand does and what campaigns you run.",
          },
        ],
      },
      {
        id: "brand-step-2",
        title: "Budget & Goals",
        description: "Set your campaign preferences",
        fields: [
          {
            id: "teamSize",
            label: "Team Size",
            type: "select",
            options: [
              { value: "", label: "Select team size" },
              { value: "1-5", label: "1-5" },
              { value: "6-20", label: "6-20" },
              { value: "21-50", label: "21-50" },
              { value: "50+", label: "50+" },
            ],
          },
          {
            id: "budgetRange",
            label: "Budget Range",
            type: "select",
            options: [
              { value: "", label: "Select budget range" },
              { value: "1-5k", label: "$1,000 - $5,000" },
              { value: "5-10k", label: "$5,000 - $10,000" },
              { value: "10-50k", label: "$10,000 - $50,000" },
              { value: "50k+", label: "$50,000+" },
            ],
          },
          {
            id: "targetAudience",
            label: "Target Audience",
            type: "textarea",
            placeholder: "Describe your target audience demographics.",
          },
          {
            id: "campaignGoals",
            label: "Campaign Goals",
            type: "multiselect",
            options: [
              { value: "brand_awareness", label: "Brand Awareness" },
              { value: "product_sales", label: "Product Sales" },
              { value: "engagement", label: "Engagement" },
              { value: "lead_generation", label: "Lead Generation" },
              { value: "community_growth", label: "Community Growth" },
            ],
          },
        ],
      },
    ],
  },

  // Agency onboarding
  agency: {
    title: "Agency Onboarding",
    steps: [
      {
        id: "agency-step-1",
        title: "Agency Information",
        description: "Tell us about your agency",
        fields: [
          {
            id: "displayName",
            label: "Agency Name",
            type: "text",
            placeholder: "Collabkar Agency",
            required: true,
          },
          {
            id: "agencyName",
            label: "Agency Name",
            type: "text",
            placeholder: "Collabkar Agency",
            required: true,
          },
          {
            id: "website",
            label: "Website",
            type: "text",
            placeholder: "https://your-agency.com",
          },
          {
            id: "location",
            label: "Location",
            type: "text",
            placeholder: "Colombo, Sri Lanka",
          },
          {
            id: "bio",
            label: "About Your Agency",
            type: "textarea",
            placeholder: "Describe your agency's expertise and services.",
          },
        ],
      },
      {
        id: "agency-step-2",
        title: "Management & Billing",
        description: "Set up your agency management",
        fields: [
          {
            id: "teamSize",
            label: "Team Size",
            type: "select",
            options: [
              { value: "", label: "Select team size" },
              { value: "1-5", label: "1-5" },
              { value: "6-20", label: "6-20" },
              { value: "21-50", label: "21-50" },
              { value: "50+", label: "50+" },
            ],
          },
          {
            id: "rosterSize",
            label: "Creator Roster Size",
            type: "select",
            options: [
              { value: "", label: "Select roster size" },
              { value: "1-10", label: "1-10" },
              { value: "11-50", label: "11-50" },
              { value: "51-100", label: "51-100" },
              { value: "100+", label: "100+" },
            ],
          },
          {
            id: "managementScope",
            label: "Management Scope",
            type: "textarea",
            placeholder: "Describe the types of creators or campaigns you manage.",
          },
          {
            id: "billingSetup",
            label: "Billing Setup",
            type: "textarea",
            placeholder: "Describe your billing terms and payment methods.",
          },
        ],
      },
    ],
  },
};