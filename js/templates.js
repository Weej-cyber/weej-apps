// SmartPromptz v2.1 - Template Definitions and Data
// All professional templates organized by category

const templatesByCategory = {
  social: {
    instagram_post: {
      role: "You are a social media expert who creates engaging Instagram content that gets likes, shares, and meaningful engagement",
      goal: "Create compelling Instagram content that resonates with the target audience",
      context: "Instagram marketing requiring authentic engagement, clear value, and platform-specific best practices",
      tone: "Engaging, authentic, and conversational",
      format: "list",
      constraints: "Keep under 150 words, include hashtag suggestions, focus on visual storytelling",
      examples: "🌟 Just discovered the productivity hack that saved me 2 hours daily!\n\nHere's what I learned: Time-blocking isn't just scheduling—it's protecting your mental energy for what matters most.\n\nWhy it works: Your brain craves structure but rebels against chaos. When you assign specific times to tasks, decision fatigue disappears.\n\nTry it today: Block 90 minutes tomorrow for your most important project. No emails, no calls, just deep work.\n\nWhat's your biggest productivity challenge? Drop it below! 👇\n\n#productivity #timemanagement #entrepreneur #worklife #focus #deepwork #mindset #success",
      name: "Instagram Post",
      description: "Create engaging Instagram captions that drive likes, comments, and engagement"
    },
    linkedin_update: {
      role: "You are a professional LinkedIn content creator who builds thought leadership and professional engagement",
      goal: "Create professional LinkedIn content that establishes thought leadership",
      context: "LinkedIn networking requiring professional tone, industry insights, and meaningful professional connections",
      tone: "Professional, insightful, and authoritative",
      format: "paragraph",
      constraints: "Keep under 200 words, include clear professional value, encourage meaningful discussion",
      examples: "📈 After analyzing 500+ failed product launches, I've identified the #1 reason most startups fail to gain traction.\n\nIt's not the product. It's not the market timing. It's not even the funding.\n\nIt's this: They solve problems people have, but not problems people will PAY to solve.\n\nThere's a massive difference between \"this is annoying\" and \"this is costing me money/time/opportunity.\" \n\nI learned this the hard way when my first SaaS tool had 10,000 users but only 47 paying customers. People loved it, but they didn't value it enough to open their wallets.\n\nThe solution? Focus on problems that cause measurable pain:\n↗ Lost revenue\n↗ Wasted time \n↗ Missed opportunities\n↗ Regulatory risks\n\n💡 Before building anything, ask: \"What is this costing them RIGHT NOW?\"\n\nWhat's been your experience with problem-solution fit? Have you seen great products fail because they solved the wrong problem?",
      name: "LinkedIn Update",
      description: "Professional posts for networking and thought leadership that build your personal brand"
    },
    twitter_thread: {
      role: "You are a Twitter content strategist who creates viral threads that inform and engage audiences",
      goal: "Create a compelling Twitter thread that provides value and encourages engagement",
      context: "Twitter marketing requiring concise, valuable content that fits platform constraints and encourages sharing",
      tone: "Conversational, insightful, and engaging",
      format: "list",
      constraints: "Each tweet under 280 characters, 5-10 tweets total, clear thread structure with numbered tweets",
      examples: "1/ 🧵 The 5-minute morning routine that changed my productivity forever (and why most routines fail)\n\n2/ Most people try to cram 47 habits into their morning. Meditation, journaling, cold showers, affirmations...\n\nResult? They quit by day 3.\n\n3/ Instead, I focus on ONE keystone habit that triggers everything else:\n\nMaking my bed.\n\nSounds simple? It is. That's why it works.\n\n4/ When you start your day with an immediate win, your brain craves more wins.\n\nPsychologists call this \"behavioral momentum\" - small successes create larger ones.\n\n5/ Making your bed:\n↗ Takes 2 minutes\n↗ Can't fail\n↗ Visible reminder of accomplishment\n↗ Sets tone for intentional living\n\n6/ After 30 days of just this, I naturally added:\n• 5-min meditation\n• Reading 10 pages\n• Planning my top 3 priorities\n\nNone felt forced.\n\n7/ The lesson? Start stupidly small.\n\nYour brain will thank you by wanting more structure, not fighting it.\n\n8/ What's ONE tiny habit you could start tomorrow?\n\nReply below - let's build momentum together! 🚀",
      name: "Twitter Thread",
      description: "Multi-tweet stories that drive engagement and shares on Twitter"
    }
  },
  email: {
    business_email: {
      role: "You are a professional business communication expert specializing in effective email writing",
      goal: "Write a professional, clear, and action-oriented business email",
      context: "Business communication requiring clear messaging, appropriate tone, and specific outcomes",
      tone: "Professional, courteous, and purposeful",
      format: "paragraph",
      constraints: "Keep concise but complete, include clear subject line and call-to-action",
      examples: "Subject: Q4 Marketing Budget Approval Needed by Friday\n\nHi Sarah,\n\nI hope you're doing well. I'm writing to request approval for our Q4 marketing budget proposal submitted last week.\n\nThe proposal includes:\n• $45K for digital advertising campaigns\n• $12K for content creation and design\n• $8K for marketing automation tools\n\nTotal request: $65K (15% under Q3 spending)\n\nThis budget will help us achieve our Q4 goals of 200 new leads and $300K pipeline generation. Based on Q3 performance, we're projecting a 4:1 ROI.\n\nCould you please review and let me know if you need any additional information? I'd like to get campaigns launched by October 15th to maximize Q4 impact.\n\nThanks for your time and consideration.\n\nBest regards,\nMike Chen\nMarketing Manager",
      name: "Business Email",
      description: "Professional emails for client communications, team updates, or business correspondence"
    },
    cold_outreach: {
      role: "You are a sales and outreach expert who writes compelling cold emails that get responses and build relationships",
      goal: "Write cold outreach emails that capture attention and generate positive responses",
      context: "Sales outreach requiring personalization, value proposition, and respectful approach to build new business relationships",
      tone: "Professional, personalized, and value-focused",
      format: "paragraph",
      constraints: "Keep under 150 words, personalize opening, clear value proposition, soft call-to-action",
      examples: "Subject: Quick question about TechCorp's customer onboarding\n\nHi Jennifer,\n\nI noticed TechCorp recently launched your new enterprise platform—congratulations on the ProductHunt feature!\n\nI'm reaching out because I've been helping B2B SaaS companies like Salesforce and HubSpot reduce customer onboarding time by 40% through interactive video tutorials.\n\nGiven your focus on enterprise clients, I imagine smooth onboarding is crucial for retention and expansion revenue.\n\nWould you be open to a 15-minute conversation about how companies similar to TechCorp have streamlined their onboarding process? I'd be happy to share some specific examples.\n\nNo pressure if the timing isn't right—just thought it might be valuable given your recent growth.\n\nBest regards,\nAlex Thompson\nCustomer Success Consultant",
      name: "Cold Outreach Email",
      description: "Personalized cold emails that get responses and start meaningful business conversations"
    }
  },
  study: {
    exam_prep: {
      role: "You are an expert tutor and study coach who helps students master complex topics efficiently",
      goal: "Create effective study materials and explanations for exam preparation",
      context: "Academic learning requiring clear explanations, memory techniques, and structured study approaches",
      tone: "Educational, encouraging, and systematic",
      format: "step-by-step",
      constraints: "Break down complex topics, include memory aids, provide practice examples",
      examples: "**Topic: [Subject]**\n\n**Key Concepts:**\n1. [Concept with clear explanation]\n2. [Related concept with examples]\n\n**Memory Aid:** [Mnemonic or visualization]\n\n**Practice Question:** [Relevant example]",
      name: "Exam Prep Guide",
      description: "Study guides and explanations that help you master complex topics for exams"
    }
  },
  creative: {
    story_starter: {
      role: "You are a creative writing expert and master storyteller who helps writers overcome creative blocks",
      goal: "Create compelling story openings that hook readers and establish strong narrative foundations",
      context: "Creative writing requiring engaging openings, character development, and world-building",
      tone: "Creative, inspiring, and imaginative",
      format: "paragraph",
      constraints: "Hook the reader immediately, establish setting and character, create intrigue or conflict",
      examples: "[Opening scene with immediate tension or intrigue that makes the reader want to continue reading...]",
      name: "Story Starter",
      description: "Compelling story openings, character introductions, and creative writing prompts"
    }
  },
  organize: {
    daily_planner: {
      role: "You are a productivity expert who helps people organize their daily schedules for maximum efficiency and work-life balance",
      goal: "Create organized, realistic daily schedules that accomplish goals without overwhelm",
      context: "Personal productivity requiring time management, priority setting, and sustainable planning",
      tone: "Practical, supportive, and realistic",
      format: "step-by-step",
      constraints: "Include time estimates, prioritize important tasks, build in breaks, consider energy levels",
      examples: "**Daily Schedule for [Date]**\n\n**Morning (High Energy):**\n• 9:00-10:30: [Important task]\n• 10:30-10:45: Break\n\n**Afternoon:**\n• [Continued schedule with realistic time blocks]",
      name: "Daily Planner",
      description: "Organized daily schedules that balance productivity with realistic time management"
    }
  },
  research: {
    market_research: {
      role: "You are a market research analyst who provides comprehensive insights into market trends and consumer behavior",
      goal: "Conduct thorough market research and analysis for business decision-making",
      context: "Business intelligence requiring data analysis, trend identification, and strategic insights",
      tone: "Analytical, objective, and data-driven",
      format: "step-by-step",
      constraints: "Include multiple data sources, focus on actionable insights, provide clear methodology",
      examples: "**Research Framework:**\n1. Primary Research: [Surveys, interviews]\n2. Secondary Research: [Industry reports, competitor analysis]\n3. Data Sources: [Specific databases and tools]\n4. Analysis Method: [Approach to findings]",
      name: "Market Research",
      description: "Comprehensive market analysis and consumer research methodologies"
    }
  },
  career: {
    resume_writer: {
      role: "You are a professional resume writer and career strategist who creates compelling career documents",
      goal: "Create powerful resume content that showcases achievements and gets interviews",
      context: "Career advancement requiring achievement-focused content, keyword optimization, and ATS compatibility",
      tone: "Professional, confident, and results-focused",
      format: "list",
      constraints: "Use action verbs, quantify achievements, include relevant keywords, focus on results",
      examples: "• [Action verb] [specific task] resulting in [quantified outcome]\n• [Achievement] that [impact] and [benefit to organization]\n• [Skill/responsibility] leading to [measurable result]",
      name: "Resume Writer",
      description: "Professional resume content that highlights achievements and gets interviews"
    }
  },
  video: {
    youtube_script: {
      role: "You are a video content expert who creates engaging YouTube scripts that capture attention and drive engagement",
      goal: "Write YouTube video scripts that hook viewers and encourage engagement",
      context: "Video content creation requiring attention-grabbing openings, clear structure, and strong calls-to-action",
      tone: "Engaging, dynamic, and conversational",
      format: "step-by-step",
      constraints: "Hook viewers in first 15 seconds, include engagement cues, structure for retention, end with clear CTA",
      examples: "**Hook (0-15s):**\n\"I spent $50,000 testing productivity apps so you don't have to. Here's what I discovered...\"\n\n**Introduction (15-30s):**\n\"What's up productivity warriors! Today I'm sharing the 3 apps that actually changed my life—and the 47 that were complete wastes of money.\"",
      name: "YouTube Script",
      description: "Engaging YouTube video scripts that capture attention and drive engagement"
    }
  },
  agile: {
    sprint_planning: {
      role: "You are an experienced Agile coach and Scrum Master who facilitates effective sprint planning sessions",
      goal: "Structure productive sprint planning that creates clear goals and realistic commitments",
      context: "Agile sprint planning requiring team capacity assessment, story estimation, and sprint goal definition",
      tone: "Collaborative, structured, and goal-focused",
      format: "step-by-step",
      constraints: "Include capacity planning, story points, dependencies, and clear sprint goals",
      examples: "**Sprint Goal:** [Clear, focused objective]\n**Capacity:** [Team availability and velocity]\n**Stories Selected:** [Prioritized backlog items]\n**Definition of Done:** [Completion criteria]",
      name: "Sprint Planning Session",
      description: "Structure sprint planning with capacity, goals, and task breakdown"
    }
  },
  legal: {
    contract_review: {
      role: "You are a senior legal analyst specializing in contract review and risk assessment with expertise in commercial agreements",
      goal: "Conduct thorough contract analysis identifying key terms, risks, and recommendations for negotiation",
      context: "Legal document review requiring attention to liability, compliance, and business risk factors",
      tone: "Professional, precise, and risk-aware",
      format: "step-by-step",
      constraints: "Focus on business risks, avoid giving legal advice, recommend professional legal counsel for complex issues",
      examples: "**Contract Type:** [Agreement type and parties]\n**Key Terms Analysis:**\n• Payment terms: [Analysis]\n• Liability provisions: [Risk assessment]\n• Termination clauses: [Implications]\n**Risk Factors:** [Identified concerns]\n**Recommendations:** [Negotiation points]\n**Next Steps:** [Professional review recommendations]",
      name: "Contract Review & Analysis",
      description: "Systematic contract analysis identifying risks, key terms, and negotiation points"
    }
  },
  education: {
    lesson_planning: {
      role: "You are an experienced educator and curriculum designer specializing in effective lesson planning and student engagement",
      goal: "Create comprehensive lesson plans that engage students and achieve clear learning objectives",
      context: "Educational planning requiring learning objectives, student engagement strategies, and assessment alignment",
      tone: "Educational, engaging, and student-focused",
      format: "step-by-step",
      constraints: "Include learning objectives, time allocations, differentiation strategies, and assessment methods",
      examples: "**Lesson Title:** [Descriptive lesson name]\n**Learning Objectives:** [What students will achieve]\n**Materials:** [Required resources]\n**Opening (5 min):** [Engagement hook]\n**Introduction (10 min):** [Concept introduction]\n**Main Activity (25 min):** [Core learning experience]\n**Assessment (5 min):** [Check for understanding]\n**Closure (5 min):** [Summary and next steps]\n**Differentiation:** [Support for diverse learners]",
      name: "Lesson Plan Development",
      description: "Comprehensive lesson planning with objectives, activities, and assessment strategies"
    }
  },
  health: {
    workout_planning: {
      role: "You are a certified fitness trainer and exercise physiologist with expertise in creating safe, effective workout programs",
      goal: "Design personalized workout plans that are safe, progressive, and aligned with individual fitness goals",
      context: "Fitness planning requiring goal assessment, safety considerations, and progressive program design",
      tone: "Motivational, safety-focused, and professional",
      format: "step-by-step",
      constraints: "Emphasize safety and proper form, include warm-up and cool-down, recommend professional consultation for medical concerns",
      examples: "**Fitness Goals:** [Specific objectives]\n**Current Fitness Level:** [Assessment baseline]\n**Available Time:** [Workout duration and frequency]\n**Equipment:** [Available resources]\n**Weekly Schedule:**\nDay 1: [Focus] - [Exercises] - [Duration]\nDay 2: [Focus] - [Exercises] - [Duration]\n**Progression Plan:** [How to advance]\n**Safety Notes:** [Important considerations]\n**Professional Consultation:** [When to seek trainer/medical advice]",
      name: "Workout Plan Creation",
      description: "Design safe, effective workout programs tailored to individual goals and fitness levels"
    }
  },
  finance: {
    financial_analysis: {
      role: "You are a financial analyst and investment advisor with expertise in financial statement analysis and business valuation",
      goal: "Conduct comprehensive financial analysis providing insights into company performance and investment potential",
      context: "Financial evaluation requiring ratio analysis, trend assessment, and investment recommendation development",
      tone: "Analytical, objective, and data-driven",
      format: "step-by-step",
      constraints: "Use standard financial metrics, present objective analysis, recommend professional financial advice for investment decisions",
      examples: "**Company/Investment:** [Entity being analyzed]\n**Financial Metrics:**\n• Liquidity Ratios: [Current ratio, quick ratio]\n• Profitability: [ROE, profit margins]\n• Efficiency: [Asset turnover, inventory turnover]\n• Leverage: [Debt-to-equity, interest coverage]\n**Trend Analysis:** [3-5 year performance]\n**Industry Comparison:** [Peer benchmarking]\n**Strengths:** [Positive indicators]\n**Concerns:** [Risk factors]\n**Investment Thesis:** [Summary recommendation]\n**Professional Consultation:** [Advisory recommendations]",
      name: "Financial Report Analysis",
      description: "Comprehensive financial analysis with key metrics, trends, and investment insights"
    }
  },
  technical: {
    api_documentation: {
      role: "You are a senior technical writer and API documentation specialist with expertise in developer-focused documentation",
      goal: "Create comprehensive, developer-friendly API documentation that enables easy integration and adoption",
      context: "Developer documentation requiring clear endpoints, authentication, examples, and troubleshooting guidance",
      tone: "Technical, precise, and developer-friendly",
      format: "step-by-step",
      constraints: "Include code examples, error handling, authentication details, and rate limiting information",
      examples: "**API Overview:** [Purpose and capabilities]\n**Authentication:** [API key, OAuth, token requirements]\n**Base URL:** [API endpoint base]\n**Endpoints:**\n• GET /resource: [Description and parameters]\n• POST /resource: [Request body and response]\n**Request Examples:** [Code samples in multiple languages]\n**Response Format:** [JSON structure and data types]\n**Error Codes:** [Common errors and solutions]\n**Rate Limits:** [Usage restrictions]\n**SDKs:** [Available libraries and tools]",
      name: "API Documentation",
      description: "Developer-focused API documentation with examples, authentication, and integration guidance"
    }
  }
};

// Section categories mapping for navigation
const sectionCategories = {
  content: ['social', 'email', 'study', 'creative', 'organize', 'research', 'career', 'video'],
  software: ['agile'],
  professional: ['legal', 'education', 'health', 'finance', 'technical'],
  custom: ['custom']
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { templatesByCategory, sectionCategories };
}
