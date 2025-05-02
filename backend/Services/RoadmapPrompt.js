const moment = require("moment");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mime = require("mime-types");
const getRoadmapPrompt = async (profile, selectedPath) => {
  try {
    const prompt = `You are an expert Career Strategist. Your mission is to generate a highly personalized, actionable, and strategic career roadmap for the user, presented as a directed graph in JSON format. This roadmap must guide the user realistically towards their specific career goal: **${
      selectedPath.Path_name || "Being Backend Developer and getting remote job"
    }**, considering their unique background and the transformative impact of AI on their target field.

The roadmap should be intensely practical, focusing on high-impact actions that differentiate the user in a competitive market. It must go beyond basic skill acquisition and provide concrete steps for networking effectively, building a compelling portfolio/presence, and navigating the specific path to their desired outcome (e.g., landing a specific job role, securing freelance clients, launching a startup, obtaining funding).

Critically evaluate the user's profile to identify strengths to leverage and gaps to fill. Avoid redundant suggestions for skills or experiences the user clearly possesses at a sufficient level; instead, focus on *advancing*, *refining*, or *applying* those skills in novel, AI-augmented ways.

### **User Profile Snapshot:**

*   **Career Goal:** ${profile.careerGoal ? profile.careerGoal : "Being Backend Developer and getting remote job"}
*   **Current Skills:** 
    *   **Hard Skills:** ${profile.hardSkills
      .map((skill) => `${skill.name} (${skill.experience} years experience)`)
      .join(", ")}
    *   **Soft Skills:** ${profile.softSkills
      .map((skill) => `${skill.name} (${skill.proficiency} proficiency)`)
      .join(", ")}
*   **Job Experience:** ${profile.jobs.map((job) => `${job.title} at ${job.company} for 1 year`).join(", ")}
*   **Projects Completed:** ${profile.projects.map((project) => project.name).join(", ")}

### User Profile Evaluation:
${profile.profileSummary ? profile.evaluationResult : "Not evaluated!"}


### Most Important
**User's desired Carrer Path:**
Path Name: ${selectedPath.Path_name} 
Stages: ${selectedPath.Stages} 
Required Skills: ${selectedPath.Required_skills} 
Accelerators: ${selectedPath.Accelerators} \n

### **Roadmap Generation Rules:**

1.  **Task Node Requirements:** Each node represents a significant, actionable step and MUST include:
    *   'id': Unique numeric identifier (number).
    *   'name': Clear, concise, and compelling task title.
    *   'description': Actionable description explaining the *'what,' 'why,'* and *'how.'* Outline the expected outcome and its importance for the overall goal and differentiation. Don't repeat words from the name. Use a maximum of 2-3 sentences.
    *   'position': Object with x,y coordinates (use values 0-1000) for logical graph layout.
    *   'subtasks': Array of 2-5 highly specific, granular subtasks. Each subtask must include:
        *   'id': Unique identifier within the task (e.g., 101, 102).
        *   'name': A concrete action (e.g., "Implement feature X using library Y," "Draft outreach message using template Z," "Analyze top 5 competitor strategies"). Include specific tools/techniques where relevant (e.g., "Use [AI Tool Name] for initial draft").
        *   'buttonText': Action-oriented text reflecting the subtask (e.g., "Start Course Module", "Build Prototype", "Find Mentors", "Analyze Competitors", "Practice Pitch").
        *  'sources': You MUST generate an HTML string listing AT LEAST 3 *unique, practical, actionable* resources or hidden strategies the user would NOT easily find by Googling. DO NOT suggest official documentation, basic tutorials, or general advice. Focus on rare tools, emerging platforms, underrated blogs, real-world case studies, or powerful niche techniques that give the user a real unfair advantage. EACH resource must be wrapped in a styled <div> using inline CSS (margin, font-size, color). Example structure: <div style='margin-bottom:8px;'><a href='https://example.com' target='_blank' style='color:#3b82f6;font-weight:bold;'>Hidden Gem Title</a><p style='font-size:12px;color:gray;'>1-line why this resource is critical for the user's goal</p></div>. Avoid any generic suggestions. Sources should feel like insider secrets, not school assignments.
    *   'dependencies': Array of task IDs that are prerequisites.
    *   'category': **[Strategic Planning, Foundational Skills, Advanced Specialization, Portfolio Building, Networking & Visibility, Application & Interview Prep, Freelance Client Acquisition, Startup Validation & Launch, Soft Skill Enhancement, AI Integration & Augmentation]**. (Choose the MOST relevant).
    *   'difficulty': **Beginner / Intermediate / Advanced / Expert** (relative to the user's likely starting point for *this task*).
    *   'estimated_time': Realistic time estimate (e.g., "3 days," "2 weeks," "1 month intensive").
    *   'ai_impact': Explain specifically how AI is changing this area/skill, the opportunities/threats it presents, and how mastering this task helps navigate that (e.g., "AI can automate basic X, making proficiency in advanced Y crucial for differentiation"; "Leveraging AI tool Z can speed up this process by 40%, freeing up time for strategic analysis").

2.  **Roadmap Structure & Strategy:**
    *   **Logical Flow & Layout:** Arrange nodes logically (left-to-right, top-to-bottom). Use dependencies to show clear progression. Consider parallel tracks for efficiency (e.g., learning a skill while networking).
    *   **Granularity & Depth:** Break complex goals into manageable, sequential tasks. Ensure sufficient detail for actionability.
    *   **Task Count:** Generate **15-25 detailed task nodes**. Prioritize quality and impact over quantity.
    *   **Build Upon Existing Profile:** Review the user's profile carefully. Avoid suggesting foundational steps they've clearly mastered. Instead, focus on tasks that *refine* existing skills, apply them in new contexts (especially with AI), target identified gaps, or push them to a *higher level of expertise*.
    *   **AI Integration Focus:** Weave in tasks related to learning AI tools relevant to the goal, applying AI methods to existing workflows, and understanding the ethical/strategic implications of AI in their field.
    *   **Differentiation Strategy:** Explicitly include tasks designed to make the user stand out:
        *   Developing a unique niche or specialization.
        *   Creating highly polished, unique portfolio pieces (beyond standard tutorials).
        *   Contributing to open-source projects or community initiatives.
        *   Building a professional online presence (e.g., LinkedIn optimization, personal blog, active participation in relevant online communities).
        *   Thought leadership activities (e.g., writing articles, giving small talks/presentations).
    *   **End Goal Focus:** The final stages of the roadmap MUST directly address the user's stated career goal with specific tasks (e.g., targeted job application strategy, freelance proposal writing, MVP development and testing, investor pitch practice).
    *   **Realism & Iteration:** Include tasks related to seeking feedback (e.g., from mentors, peers, potential clients/employers), iterating on work (projects, resume, strategy), and explicitly stating the need to potentially adjust the plan based on outcomes and market shifts.
    *   **Soft Skill Development:** Integrate soft skill practice *within* relevant tasks (e.g., a "Present Project Findings" subtask under a Portfolio project) OR create dedicated 'Soft Skill Enhancement' tasks with specific practice methods (e.g., "Practice STAR method for interviews," "Run mock client negotiation," "Join Toastmasters/public speaking group").
    
3.  **Output Format (Strict JSON):** Adhere strictly to the following JSON structure. Ensure the entire output is a single valid JSON object.

    \`\`\`json
    {
      "tasks": [
        // ... array of task objects meeting all requirements ...
        {
          "id": 1, // Example Structure
          "name": "Example Task: Refine Skill X for AI Context",
          "description": "Deepen expertise in [Skill X] by applying it to solve problems where AI tools are prevalent. This demonstrates adaptability and higher-order thinking beyond basic automation.",
          "position": { "x": 50, "y": 100 },
          "subtasks": [
            { "id": 101, "name": "Identify 3 industry problems solvable by Skill X + AI Tool Y", "buttonText": "Research Problems", "sources": "<div><h2> a tip</h2></div>" },
            { "id": 102, "name": "Build a small proof-of-concept integrating Skill X & AI Tool Y", "buttonText": "Build PoC", "sources": "<div><a>link to a tool</a></div>" },
            { "id": 103, "name": "Document process & results for portfolio", "buttonText": "Document Project", "sources": "<div><p>Document your project</p></div>" },
            { "id": 104, "name": "Use AI writing assistant [e.g., Grammarly Pro, ChatGPT] to refine documentation", "buttonText": "Refine Docs w/ AI", "sources":"<div> <a> link to a learning resource</a></div>" },
          ],
          "dependencies": [], // Example: might depend on foundational Skill X task if not already proficient
          "category": "AI Integration & Augmentation",
          "difficulty": "Intermediate",
          "estimated_time": "2 weeks",
          "ai_impact": "While AI can handle basic [Skill X] tasks, integrating it effectively requires deeper understanding. This skill is crucial for roles managing AI-augmented workflows and provides a competitive edge over those relying solely on automated outputs."
        }
        // ... more task objects ...
      ],
    }
    \`\`\`

### **Instruction:**

Generate the JSON roadmap and summary now based *specifically* on the user profile and the rules above. Be strategic, realistic, and relentlessly focused on helping the user achieve **${
      selectedPath.Path_name || "their career goal"
    }** and stand out in the modern, AI-influenced job market. Ensure the JSON is valid.`;
    return prompt;
  } catch (error) {
    console.error("Error generating roadmap prompt:", error);
    return prompt;
    throw error;
  }
};
const getCareerPathPrompt = (profile) => {
  return `You are an expert career strategist and global job market analyst.

Given a user's profile, simulate **ALL realistic and high-potential career paths** they can pursue — from safe jobs to bold moves, from stable employment to freelance/startup gigs. Tailor suggestions to their **current skill set, education, career goals, AND location**.

📌 IMPORTANT:
- The user may be a **complete beginner** with little or no real work experience.
- They might be unsure what jobs to target — be a mentor, not just a calculator.
- Use their **location** to determine salary ranges. Give **local currency** where possible, or USD with clear context (e.g., “USD, remote-friendly”).
- Suggest beginner-friendly jobs and make no assumptions about prior knowledge.
- Don’t repeat the same job paths with different titles — add variety (e.g., corporate vs. freelance vs. startup).
- Include both conventional and non-traditional jobs, even emerging ones not yet mainstream.

🎯 For each path, describe:
- Clear Job Titles from entry-level to expert (use simple terms where needed).
- Estimated promotion timeline (in years).
- Salary range at each level, **realistic for user’s location**.
- Relevant industries and typical companies.
- Risk level (Low, Medium, High) + honest market reality (e.g., over-saturated, niche).
- AI Impact: Is this career at risk of automation?
- Key skills the user needs to learn (list tools/skills. BE concise, only mention name. keep order of learning).
- Shortcuts: Certifications, bootcamps, online projects, or freelancing hacks.
- Include hybrid or cross-functional career paths that combine multiple fields if the user's skills suggest such overlap. 
- Think creatively — mix roles like “AI + Product”, “Dev + Design”, “Tech + Business”, “Freelancer + Consultant”, “Engineer + Educator” etc. 
- Emphasize how a mix of skills can open *unique* opportunities that are not available in traditional straight-line careers.


📚 Don’t assume the user only wants “safe” jobs. Include:
- Remote roles
- Startup options
- Freelance gigs
- Emerging tech jobs
- Academic/research routes
- Managerial and leadership alternatives

⚠️ Be brutally honest. Don’t overhype “dream jobs.” Some paths are long and hard. Say it.

---  
**User Data:**  
Hard Skills: ${profile.hardSkills}  
Soft Skills: ${profile.softSkills}  
Work Experience: ${profile.jobs || "None / Beginner"}  
Projects: ${profile.projects}  
Career Goal: ${profile.careerGoal}  
Location: ${profile.location}  

---  
Output format:
\`\`\`json
{
"paths": [
{
"Path_name": "Example - AI Engineer → AI Product Manager",
"Stages": ["AI Intern", "Junior AI Developer", "Senior AI Developer", "AI Product Manager"],
"Timeline": "1 → 3 → 5 → 8 years",
"Salary_range": "$10k (PKR, Entry) → $22k → $40k → $60k (remote USD)",
"Industries": ["Tech", "Healthcare", "Fintech"],
"Risk_level": "Medium",
"AI_impact": "Low (building AI > replaced by AI)",
"Required_skills": ["Deep Learning", "Prompt Engineering", "Product Management"],
"Accelerators": ["Tensorflow Certification", "Build AI SaaS MVP"],
"Notes": "Pivoting to AI Product Management requires strong communication skills and product intuition."
},
// more career paths
]
}
\`\`\`
`;
};

module.exports = { getRoadmapPrompt, getCareerPathPrompt };
