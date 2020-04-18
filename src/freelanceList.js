const freelanceList = [
  {
    name: 'Software & Tech',
    topicID: 'freelance_software',
    icon: 'code',
    // color: colors.peach,
    children: [
      {
        name: 'Web Development',
        topicID: 'freelance_software_webdevelopment',
      },
      {
        name: 'Mobile Apps',
        topicID: 'freelance_software_mobileapps',
      },
      {
        name: 'Game Development',
        topicID: 'freelance_software_gamedevelopment',
      },
      {
        name: 'E-commerce Development',
        topicID: 'freelance_software_ecommercedevelopment',
      },
      {
        name: 'Backend / Database',
        topicID: 'freelance_software_backenddatabase',
      },
      {
        name: 'IT & Networking',
        topicID: 'freelance_software_itnetworking',
      },
      {
        name: 'Data Science & Analytics',
        topicID: 'freelance_software_datascienceanalytics',
      },
      {
        name: 'Other',
        topicID: 'freelance_software_other',
      },
    ],
  },
  {
    name: 'Engineering',
    topicID: 'freelance_engineering',
    icon: 'drafting-compass',
    // color: colors.peach,
    children: [
      {
        name: 'Mechanical Engineering',
        topicID: 'freelance_engineering_mechanicalengineering',
      },
      {
        name: 'Electrical Engineering',
        topicID: 'freelance_engineering_electricalengineering',
      },
      {
        name: 'Chemical Engineering',
        topicID: 'freelance_engineering_chemicalengineering',
      },
      {
        name: 'Civil & Structural Engineering',
        topicID: 'freelance_engineering_civilstructuralengineering',
      },
      {
        name: 'Product Design',
        topicID: 'freelance_engineering_productdesign',
      },
      {
        name: '3D Modeling & CAD',
        topicID: 'freelance_engineering_3dmodelingcad',
      },
      {
        name: 'Other',
        topicID: 'freelance_engineering_other',
      },
    ],
  },
  {
    name: 'Graphics & Design',
    topicID: 'freelance_design',
    icon: 'paint-brush',
    // color: colors.peach,
    children: [
      {
        name: 'Logo Design',
        topicID: 'freelance_design_logodesign',
      },
      {
        name: 'Brand Design',
        topicID: 'freelance_design_branddesign',
      },
      {
        name: 'Web & Mobile Design',
        topicID: 'freelance_design_webmobiledesign',
      },
      {
        name: 'Graphic Design',
        topicID: 'freelance_design_graphicdesign',
      },
      {
        name: 'Game Design',
        topicID: 'freelance_design_gamedesign',
      },
      {
        name: 'Photoshop',
        topicID: 'freelance_design_photoshop',
      },
      {
        name: 'Other',
        topicID: 'freelance_design_other',
      },
    ],
  },
  {
    name: 'Music & Audio',
    topicID: 'freelance_musicaudio',
    icon: 'music',
    // color: colors.peach,
    children: [
      {
        name: 'Voice Over',
        topicID: 'freelance_musicaudio_voiceover',
      },
      {
        name: 'Mixing & Mastering',
        topicID: 'freelance_musicaudio_mixingmastering',
      },
      {
        name: 'Producing',
        topicID: 'freelance_musicaudio_producing',
      },
      {
        name: 'Singer-Songwriter',
        topicID: 'freelance_musicaudio_singersongwriter',
      },
      {
        name: 'Other',
        topicID: 'freelance_musicaudio_other',
      },
    ],
  },
  {
    name: 'Video & Animation',
    topicID: 'freelance_videoanimation',
    icon: 'film',
    // color: colors.peach,
    children: [
      {
        name: 'Explainer Videos',
        topicID: 'freelance_videoanimation_explainervideos',
      },
      {
        name: 'Video Editing',
        topicID: 'freelance_videoanimation_videoediting',
      },
      {
        name: 'Video Production',
        topicID: 'freelance_videoanimation_videoproduction',
      },
      {
        name: 'Intros & Outros',
        topicID: 'freelance_videoanimation_introsoutros',
      },
      {
        name: 'Animations',
        topicID: 'freelance_videoanimation_animations',
      },
      {
        name: 'Short Video Ads',
        topicID: 'freelance_videoanimation_shortvideoads',
      },
      {
        name: 'Other',
        topicID: 'freelance_videoanimation_other',
      },
    ],
  },
  {
    name: 'Sales & Marketing',
    topicID: 'freelance_salesmarketing',
    icon: 'comment-dollar',
    // color: colors.peach,
    children: [
      {
        name: 'Social Media Marketing',
        topicID: 'freelance_salesmarketing_socialmediamarketing',
      },
      {
        name: 'Digital Marketing',
        topicID: 'freelance_salesmarketing_digitalmarketing',
      },
      {
        name: 'Marketing Strategy',
        topicID: 'freelance_salesmarketing_marketingstrategy',
      },
      {
        name: 'E-commerce Sales',
        topicID: 'freelance_salesmarketing_ecommercesales',
      },
      {
        name: 'Lead Generation & Sales',
        topicID: 'freelance_salesmarketing_leadgenerationsales',
      },
      {
        name: 'Other',
        topicID: 'freelance_salesmarketing_other',
      },
    ],
  },
  {
    name: 'Business',
    topicID: 'freelance_business',
    icon: 'user-tie',
    // color: colors.peach,
    children: [
      {
        name: 'Virtual Assistant',
        topicID: 'freelance_business_virtualassistant',
      },
      {
        name: 'Data Entry',
        topicID: 'freelance_business_dataentry',
      },
      {
        name: 'Accounting',
        topicID: 'freelance_business_accounting',
      },
      {
        name: 'Legal Consulting',
        topicID: 'freelance_business_legalconsulting',
      },
      {
        name: 'Financial Consulting',
        topicID: 'freelance_business_financialconsulting',
      },
      {
        name: 'Business Consulting',
        topicID: 'freelance_business_businessconsulting',
      },
      {
        name: 'Branding Services',
        topicID: 'freelance_business_brandingservices',
      },
      {
        name: 'Project Managament',
        topicID: 'freelance_business_projectmanagement',
      },
      {
        name: 'Marketing Research',
        topicID: 'freelance_business_marketingresearch',
      },
      {
        name: 'Customer Service',
        topicID: 'freelance_business_customerservice',
      },
      {
        name: 'Other',
        topicID: 'freelance_business_other',
      },
    ],
  },
  {
    name: 'Writing',
    topicID: 'freelance_writing',
    icon: 'feather',
    // color: colors.peach,
    children: [
      {
        name: 'Editing & Proofreading',
        topicID: 'freelance_writing_editingproofreading',
      },
      {
        name: 'Content Writing',
        topicID: 'freelance_writing_contentwriting',
      },
      {
        name: 'Ghostwriting',
        topicID: 'freelance_writing_ghostwriting',
      },
      {
        name: 'Business Writing',
        topicID: 'freelance_writing_businesswriting',
      },
      {
        name: 'Creative Writing',
        topicID: 'freelance_writing_creativewriting',
      },
      {
        name: 'Technical Writing',
        topicID: 'freelance_writing_technicalwriting',
      },
      {
        name: 'Other',
        topicID: 'freelance_writing_other',
      },
    ],
  },
];

module.exports = {
  freelanceList
};