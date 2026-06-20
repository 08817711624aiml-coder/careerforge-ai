import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy init of Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Using mock data fallback or throwing error when used.");
    }
    aiClient = new GoogleGenAI({ apiKey: key || "MOCK_KEY" });
  }
  return aiClient;
}

// REST Api endpoint: Analyze resume + LinkedIn info
app.post('/api/gemini/analyze', async (req, res) => {
  const { resumeText, resumeFileName, linkedinUrl, desiredJob, timeline = '6 months' } = req.body;

  if (!resumeText && !linkedinUrl) {
    return res.status(400).json({ error: "Please provide either your resume content or a LinkedIn profile URL." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Return structured Mock Career advice if key is missing so the app doesn't crash but advises user to set up key!
    console.error("GEMINI_API_KEY is missing, returning high-fidelity tier-classified response");
    
    // Choose months breakdown based on selected timeline
    const isThree = timeline === '3 months';
    const isNine = timeline === '9 months';
    
    return res.json({
      desiredJob: desiredJob || "Software Engineer",
      timeline: timeline,
      summary: `[DEMO MODE] We reviewed your candidate profile for the target role: "${desiredJob || 'Software Engineer'}" over a ${timeline} preparation strategy. To unlock real-time Gemini-powered resume gap mapping, please configure your GEMINI_API_KEY in the AI Studio Settings. Here is your initial tiered tactical roadmap.`,
      milestones: [
        {
          id: "m1",
          title: "Syllabus Alignment & Core Stack Audit",
          description: `Align project repositories & perform custom mock interviews centered around ${desiredJob || 'target role'}.`,
          timeframe: isThree ? "Month 1" : isNine ? "Months 1-3" : "Months 1-2",
          status: "in_progress",
          actionItems: ["Audit resume for tech buzzwords matching desired role", "Establish custom GitHub repositories for new projects", "Revamp LinkedIn highlights with key metrics"]
        },
        {
          id: "m2",
          title: "System Design and Framework Deep Dive",
          description: "Build robust full-stack proof-of-concept projects and practice algorithmic challenges.",
          timeframe: isThree ? "Month 2" : isNine ? "Months 4-6" : "Months 3-4",
          status: "pending",
          actionItems: ["Master state lifecycle and performance patterns", "Build secure API proxy routing layers", "Solve 20 medium-level coding interface challenges"]
        },
        {
          id: "m3",
          title: "Target Outreach & Dynamic Applications Placement",
          description: "Pitch applications to Tier 1, 2 and 3 local and remote companies with tracked follow-up tasks.",
          timeframe: isThree ? "Month 3" : isNine ? "Months 7-9" : "Months 5-6",
          status: "pending",
          actionItems: ["Filter target firms by city location preference", "Add 6 target matching positions to our application pipeline tracker", "Configure follow-up reminders the day after recruiter replies"]
        }
      ],
      skills: [
        { name: "Framework State & Architecture", importance: "high", currentLevel: "Beginner", targetLevel: "Intermediate", resources: ["Official Documentation", "GitHub workshop repositories"] },
        { name: "Fullstack API Proxy & Credentials Guarding", importance: "high", currentLevel: "Basic", targetLevel: "Advanced", resources: ["Standard backend architecture guides", "Proxy setup labs"] },
        { name: "OAuth and Cloud Firestore Security Rules", importance: "medium", currentLevel: "None", targetLevel: "Basic", resources: ["Google Sign-In integration workshops", "Firestore security benchmarks"] },
        { name: "System Optimization & Scalability Principles", importance: "medium", currentLevel: "Beginner", targetLevel: "Intermediate", resources: ["Architectural patterns documentation", "Engineering blog series"] }
      ],
      targetCompanies: [
        { 
          name: "Microsoft", 
          industry: "Product-Based Giant", 
          whyMatch: "Perfect fit for candidate seeking high-standard coding systems, typesafety and scalable cloud patterns.", 
          hiringDifficulty: "hard", 
          openRolesEstimate: "15+ active openings", 
          interviewPrepStrategy: "Focus intensely on algorithms, clean system architecture, and solid design patterns.",
          tier: "Tier 1",
          location: "Bengaluru"
        },
        { 
          name: "Google", 
          industry: "Product-Based Giant", 
          whyMatch: "High match for analytical problem solving and algorithmic depth shown in your B.Tech CSE profile.", 
          hiringDifficulty: "hard", 
          openRolesEstimate: "10+ active openings", 
          interviewPrepStrategy: "Practise medium to hard array/graph challenges and clean modular coding.",
          tier: "Tier 1",
          location: "Delhi NCR"
        },
        { 
          name: "Razorpay", 
          industry: "Fintech Platform", 
          whyMatch: "Superb alignment with product development and scalable API integration concepts.", 
          hiringDifficulty: "medium", 
          openRolesEstimate: "8+ roles listed", 
          interviewPrepStrategy: "Study payment lifecycle orchestration, database transactions, and secure routing.",
          tier: "Tier 2",
          location: "Bengaluru"
        },
        { 
          name: "Zomato / Blinkit", 
          industry: "Consumer Product Startup", 
          whyMatch: "High-impact real-time delivery engineering with major operations and development hubs in Delhi NCR.", 
          hiringDifficulty: "medium", 
          openRolesEstimate: "6+ openings", 
          interviewPrepStrategy: "Focus on real-time messaging, geolocation coordination, and low-latency rendering.",
          tier: "Tier 2",
          location: "Delhi NCR"
        },
        { 
          name: "Tata Consultancy Services (TCS)", 
          industry: "IT Partner & Services", 
          whyMatch: "Excellent, highly active recruitment and placement tie-ups with undergraduate colleges.", 
          hiringDifficulty: "easy", 
          openRolesEstimate: "100+ active roles", 
          interviewPrepStrategy: "Revise OOPs concepts, basic DBMS queries, and practice standard communication skills.",
          tier: "Tier 3",
          location: "Hyderabad"
        },
        { 
          name: "Cognizant", 
          industry: "Software and IT Services", 
          whyMatch: "Large scale developer opportunities across multiple target cities.", 
          hiringDifficulty: "easy", 
          openRolesEstimate: "50+ local openings", 
          interviewPrepStrategy: "Be comfortable with web developer basics, database tables, and key SDLC practices.",
          tier: "Tier 3",
          location: "Pune/Mumbai"
        },
        { 
          name: "Atlassian", 
          industry: "SaaS Dev Solutions", 
          whyMatch: "Excellent candidate fit for global remote and flexible home-office environments.", 
          hiringDifficulty: "hard", 
          openRolesEstimate: "5+ listings available", 
          interviewPrepStrategy: "Excellent understanding of developer tooling, CI/CD, and asynchronous workflows.",
          tier: "Tier 1",
          location: "Remote"
        }
      ],
      timestamp: new Date().toISOString()
    });
  }

  try {
    const ai = getAi();
    const prompt = `
You are Career Forge AI, an elite full-stack tech recruiter and career coach. Review the user's resume, LinkedIn profile, target job "${desiredJob}", and selected timeline pacing goal of "${timeline}".

RESUME EXPERIENCE CONTENT:
${resumeText || "No resume uploaded."}

LINKEDIN SOCIAL URL:
${linkedinUrl || "No LinkedIn provided."}

YOUR MANDATORY TASK:
1. Parse the user's resume/Linkedin to see what skills they ALREADY possess.
2. In the "skills" array, list only the skills they NEED to acquire (skills GAP) to bridge the distance to the "${desiredJob}" position. Do NOT list skills they already have. For each gap skill, list actionable developer resources or learning links.
3. Plan the milestones structure to fit exactly in the user's selected pacing: "${timeline}".
   - Generate exactly 3 to 5 realistic milestone phases.
   - Set the milestone "timeframe" fields relative to the chosen timeline (e.g. if 3 months, milestones might be "Month 1", "Month 2", "Month 3"; if 6 months, "Month 1-2", "Month 3-4", "Month 5-6"; if 9 months, "Month 1-3", "Month 4-6", "Month 7-9").
4. Under "targetCompanies", recommend exactly 6 to 7 target companies.
   - For each target company, include a "tier" attribute with one of three values exactly: "Tier 1", "Tier 2", or "Tier 3" (representing: "Tier 1" = Product Giants / MNCs; "Tier 2" = High-Growth Tech Startups; "Tier 3" = Corporate IT Partners & Services).
   - For each target company, include a "location" attribute representing where their primary hubs are (e.g. "Bengaluru", "Delhi NCR", "Hyderabad", "Pune/Mumbai", "Remote").
   - Offer highly specific "whyMatch" and "interviewPrepStrategy" guidance linked to their profile strengths and gaps.

Return a raw JSON object aligned to CareerRoadmap interface structure:
{
  "desiredJob": string,
  "timeline": string,
  "summary": string, (Provide 3-4 sentences of helpful, encouraging analysis mapping current skills vs target criteria)
  "milestones": [
    {
      "id": string,
      "title": string,
      "description": string,
      "timeframe": string,
      "status": "pending" | "in_progress" | "completed",
      "actionItems": string[]
    }
  ],
  "skills": [
    {
      "name": string,
      "importance": "high" | "medium" | "low",
      "currentLevel": string,
      "targetLevel": string,
      "resources": string[]
    }
  ],
  "targetCompanies": [
    {
      "name": string,
      "industry": string,
      "whyMatch": string,
      "hiringDifficulty": "easy" | "medium" | "hard",
      "openRolesEstimate": string,
      "interviewPrepStrategy": string,
      "tier": "Tier 1" | "Tier 2" | "Tier 3",
      "location": "Bengaluru" | "Delhi NCR" | "Hyderabad" | "Pune/Mumbai" | "Remote" | string
    }
  ],
  "timestamp": string (ISO String)
}

Do NOT include any markdown code block wrap (such as \`\`\`json ...) - just reply with raw JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || "{}";
    const roadmap = JSON.parse(responseText.trim());
    
    // Safety check properties
    roadmap.timeline = timeline;
    
    return res.json(roadmap);
  } catch (error: any) {
    console.error("Error in analyze endpoint:", error);
    return res.status(500).json({ error: error.message || "An error occurred analyzing your profile." });
  }
});

// Endpoint: Tech Market Insights
app.post('/api/gemini/market-insights', async (req, res) => {
  const { desiredJob } = req.body;
  const role = desiredJob || "Software Developer";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({
      trendingRoles: [role, "Staff Reliability Specialist", "AI Integration Developer", "Platform Systems Architect"],
      trendingSkills: ["Generative AI Pipelines", "Multi-Cloud Kubernetes Orchestration", "React 19 & Next.js App Router", "Server-side TypeScript/Rust"],
      hiringSpeed: "Moderate to Fast (average interview loop is 3-4 Weeks)",
      marketOutlook: "Strong growth in Cloud Platforms and practical Gen AI, but traditional tech positions have higher competition. High demand for intermediate and senior levels.",
      prepAdvice: "Create an active portfolio showing live web applications connected to real backends. Highlight performance optimization and system level troubleshooting."
    });
  }

  try {
    const ai = getAi();
    const prompt = `
Analyze the current tech recruitment market for the role: "${role}".
Provide deep, data-backed trends, average hiring speeds, and market outlooks.
Return a raw JSON object with the exact custom MarketInsight schema:
{
  "trendingRoles": string[], (list of 3-4 highly sought after sibling or advanced roles related to ${role})
  "trendingSkills": string[], (list of 4-5 top skills employers are filtering for right now for this role)
  "hiringSpeed": string, (expected loop duration and urgency)
  "marketOutlook": string, (2-3 sentences analyzing hiring volume and budget directions for this category)
  "prepAdvice": string (2 sentences of actionable advice to stand out)
}
Do NOT include markdown block wrapping.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const insights = JSON.parse((response.text || "{}").trim());
    return res.json(insights);
  } catch (error: any) {
    console.error("Error generating market insights:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch market insights." });
  }
});

// Vite / static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
