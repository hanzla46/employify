const { GoogleGenerativeAI } = require("@google/generative-ai");
const { safeJsonParse } = require("./JsonParse");
const Roadmap = require("../models/RoadmapModel");
const Profile = require("../models/ProfileModel");
const generateRoadmapAI = async (profile, selectedPath) => {
  try {
    const { preferences } = selectedPath;
    const difficultyLevel = preferences?.difficulty || "intermediate";
    const timeframe = preferences?.timeframe || "6months";
    const focus = preferences?.focus || "balanced";

    const getTimeframeTaskCount = (tf) => {
      switch (tf) {
        case "3months":
          return "9-12";
        case "6months":
          return "12-16";
        case "1year":
          return "17-22";
        default:
          return "15-20";
      }
    };

    const prompt = `You are an expert Career Strategist. Your mission is to generate a highly personalized, actionable, and strategic career roadmap for the user, presented as a directed graph in JSON format. This roadmap must guide the user realistically towards their specific career goal: **${
      selectedPath.Path_name || "Being Backend Developer and getting remote job"
    }**, considering their unique background and the transformative impact of AI on their target field.

Consider these User Learning Preferences when generating the roadmap:

1. Difficulty Level: ${difficultyLevel}
   - Adjust task complexity, depth, and prerequisites accordingly
   - For beginner: More foundational concepts, detailed guidance, basic projects
   - For intermediate: Mix of basics and advanced topics, moderate complexity
   - For advanced: Complex projects, cutting-edge tech, open-ended challenges

2. Timeframe: ${timeframe}
   - Generate ${getTimeframeTaskCount(timeframe)} tasks total
   - Adjust task durations to fit within this timeframe
   - For 3 months: Focus on quick wins and essential skills
   - For 6 months: Balanced approach with both quick and long-term goals
   - For 1 year: Include more comprehensive and in-depth learning

3. Learning Focus: ${focus}
   - For practical focus: 70% hands-on projects, 30% theory
   - For theoretical focus: 60% deep learning, 40% practical application
   - For balanced: Equal mix of theory and practice

The roadmap should be intensely practical, focusing on high-impact actions that differentiate the user in a competitive market. It must go beyond basic skill acquisition and provide concrete steps for networking effectively, building a compelling portfolio/presence, and navigating the specific path to their desired outcome.


*** User Profile: *** 
    *   **Hard Skills:**
${profile.hardSkills
  .map(
    (skill) =>
      `        - ${skill.name} (${skill.experience} years experience)\n` +
      `          Subskills: ${skill.subskills ? skill.subskills.map((sub) => `${sub})`).join(", ") : "None"}`
  )
  .join("\n")}
    *   **Soft Skills:** ${profile.softSkills
      .map((skill) => `${skill.name} (${skill.proficiency} proficiency)`)
      .join(", ")}
*   **Job Experience:** ${profile.jobs.map((job) => `${job.title} at ${job.company} for 6 months`).join(", ")}
*   **Projects Completed:** ${profile.projects.map((project) => project.name).join(", ")}
*   **Education:** ${profile.education.map((edu) => edu.degree).join(", ")}


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
        *   'skills': Array. only applies to hardskills not softskills any skills if this subtask mark the completion of that skills. make sure to not repeat same skill across multiple subtasks.
        *   'labels': Array. you can add label such as project or course or both or empty array.
    *   'dependencies': Array of task IDs that are prerequisites.
    *   'category': **[Strategic Planning, Foundational Skills, Advanced Specialization, Portfolio Building, Networking & Visibility, Application & Interview Prep, Freelance Client Acquisition, Startup Validation & Launch, Soft Skill Enhancement, AI Integration & Augmentation]**. (Choose the MOST relevant).
    *   'difficulty': **Beginner / Intermediate / Advanced / Expert** (relative to the user's likely starting point for *this task*).
    *   'estimated_time': Realistic time estimate (e.g., "3 days," "2 weeks," "1 month intensive").
    *   'priority': give each task a priority: low, high or medium. (keep it lowercase).

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
            { "id": 101, "name": "Identify 3 industry problems solvable by Skill X + AI Tool Y", "buttonText": "Research Problems",labels:['project','course'],skills:[]},
            { "id": 102, "name": "Build a small proof-of-concept integrating Skill X & AI Tool Y", "buttonText": "Build PoC",labels:['project'],skills:['python']},
            { "id": 103, "name": "Document process & results for portfolio", "buttonText": "Document Project",labels:[],skills:['tensorflow']},
            { "id": 104, "name": "Use AI writing assistant [e.g., Grammarly Pro, ChatGPT] to refine documentation", "buttonText": "Refine Docs w/ AI",labels:[],skills:[] },
          ],
          "dependencies": [], // Example: might depend on foundational Skill X task if not already proficient
          "category": "AI Integration & Augmentation",
          "difficulty": "Intermediate",
          "estimated_time": "2 weeks",
          "priority": "medium"
        }
        // ... more task objects ...
      ],
    }
    \`\`\`

### **Instruction:**

Generate the JSON roadmap and summary now based *specifically* on the user profile and the rules above. Be strategic, realistic, and relentlessly focused on helping the user achieve **${
      selectedPath.Path_name || "their career goal"
    }** and stand out in the modern, AI-influenced job market. Ensure the JSON is valid.`;
    console.log(prompt);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generation_config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
        temperature: 2,
        response_mime_type: "application/json",
      },
    });
    const result = await model.generateContent(prompt);
    const content = result.response.candidates[0].content.parts[0].text;
    console.log("Generated content:", content);
    const match = content.match(/```json\n([\s\S]*?)\n```/);
    if (!match) {
      throw new Error("💥 No valid JSON block found.");
    }
    const extractedJson = match[1];
    const roadmapData = await safeJsonParse(extractedJson);
    return roadmapData;
  } catch (error) {
    console.error("Error generating roadmap prompt:", error);
    return prompt;
    throw error;
  }
};
const generateSubtaskSourcesAI = async (profile, task, subtask) => {
  const maxRetries = GEMINI_API_KEYS.length;
  let lastError = null;
  let usedKeys = new Set();
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Pick a key not used in previous attempts
    const available = GEMINI_API_KEYS.filter((k) => !usedKeys.has(k));
    const apiKey =
      available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : GEMINI_API_KEYS[Math.floor(Math.random() * GEMINI_API_KEYS.length)];
    usedKeys.add(apiKey);
    try {
      const prompt = `You are an expert career strategist. For the following subtask, generate an HTML string containing at least 3 unique, practical, actionable resources (each with a clickable link and a 1-line reason why it's valuable for this subtask). Do NOT suggest official documentation, basic tutorials, or general advice. Focus on rare tools, emerging platforms, underrated blogs, real-world case studies, or powerful niche techniques that give the user a real unfair advantage. Each resource must be wrapped in a styled <div> using inline CSS (margin, font-size, color). Each resource MUST include a working <a href='...'> link.

Subtask: ${subtask.name}
Task: ${task.name}
User Profile: ${profile.careerGoal}, Skills: ${profile.hardSkills.map((s) => s.name).join(", ")}

Return ONLY the HTML string. No markdown, no comments, no pre/post text.`;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generation_config: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
          temperature: 1.5,
        },
      });
      const result = await model.generateContent(prompt);
      const content = result.response.candidates[0].content.parts[0].text;
      if (content && content.trim().length > 0) {
        return content.trim();
      }
    } catch (error) {
      lastError = error;
      console.error(`Error (attempt ${attempt + 1}) generating sources for subtask:`, error);
    }
  }
  // If all retries fail
  return "";
};

const getCareerPathsAI = async (profile) => {
  const prompt = `You are an expert career strategist and global job market analyst.

Given a user's profile, simulate **6-8 distinct, high-potential career paths** they can pursue — from safe jobs to bold moves, from stable employment to freelance/startup gigs. Tailor suggestions to their **current skill set, education, career goals, AND location**.

📌 IMPORTANT GUIDELINES:
- The user may be a **complete beginner** with little or no real work experience.
- They might be unsure what jobs to target — be a mentor, not just a calculator.
- Use their **location** to determine salary ranges. Give **local currency** where possible, or USD with clear context (e.g., “USD, remote-friendly”).
- Suggest beginner-friendly jobs and make no assumptions about prior knowledge.
- Don’t repeat the same job paths with different titles — ensure each of the 3-5 paths offers genuine variety (e.g., corporate vs. freelance vs. startup).
- Include both conventional and non-traditional jobs, especially emerging ones that might combine diverse skills.

🎯 For each path, describe:
- **Core Progression Stages**: List 2-3 **main job titles** representing a realistic progression (e.g., Entry-level, Mid-level, Senior/Specialist). **Do NOT go beyond 3-4 stages or more than 7-8 years into the future.**
- **Estimated Progression Timeline**: State the approximate *total years to reach each listed stage*. Keep it concise and realistic (e.g., "Year 0 → Year 2 → Year 5").
- **Salary Range**: Provide a realistic salary range for **EACH listed progression stage**. Use local currency or USD with context. **Keep these concise, reflecting only the distinct stages.**
- Relevant industries and typical companies.
- Risk level (Low, Medium, High) + honest market reality (e.g., over-saturated, niche, high demand).
- AI Impact: Is this career at risk of automation or heavily augmented by AI?
- **Key Skills to Learn**: List **3-5 highly impactful and distinct skills** for the entire path, ordered by typical learning progression. **No long lists; focus only on the absolute "main main" skills and tools.**
- Shortcuts: Certifications, bootcamps, online projects, or freelancing hacks.
- **Alternate/Hybrid Paths**: Emphasize how a mix of skills can open *unique* opportunities that are not available in traditional straight-line careers. Think creatively, suggesting roles like “AI + Product”, “Dev + Design”, “Tech + Business”, “Freelancer + Consultant”, “Engineer + Educator” etc. Ensure at least one suggested path is a clear alternate/hybrid direction.

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
Hard Skills: ${profile.hardSkills
    .map(
      (skill) =>
        `${skill.name} (${skill.experience} years) - Subskills: [${
          skill.subskills ? skill.subskills.map((sub) => `${sub})`).join(", ") : "None"
        }]`
    )
    .join("\n")}
Soft Skills: ${profile.softSkills.map((skill) => `${skill.name} (${skill.proficiency})`).join(", ")}
Work Experience: ${profile.jobs || "None / Beginner"}
Projects: ${profile.projects}
Education: ${profile.education}
Career Goal: ${profile.careerGoal}
Location: ${profile.location}

---
Output format:
\`\`\`json
{
"paths": [
{
"Path_name": "STRING. Example - Data Analyst → Machine Learning Engineer",
"Stages": ["Junior Data Analyst", "Data Scientist", "Machine Learning Engineer"],
"Timeline": "STRING. Year 0 → Year 2 → Year 5",
"Salary_range": "STRING. $40k USD (Entry) → $75k USD (Mid) → $120k USD (Senior)",
"Industries": ["Tech", "Finance", "Healthcare"],
"Risk_level": "STRING. Medium",
"AI_impact": "STRING. High (AI complements and augments data analysis)",
"Required_skills": ["SQL", "Python (Pandas, Scikit-learn)", "Cloud Platforms (AWS/Azure)"],
"Accelerators": ["Google Data Analytics Cert", "Kaggle Competitions"],
},
// ... more than 7 more distinct career paths
]
}
\`\`\`
`;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generation_config: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      temperature: 1.4,
      response_mime_type: "application/json",
    },
  });
  const result = await model.generateContent(prompt);
  const content = result.response.candidates[0].content.parts[0].text;
  console.log("Generated content:", content);
  const match = content.match(/```json\n([\s\S]*?)\n```/);
  if (!match) {
    throw new Error("💥 No valid JSON block found.");
  }
  const extractedJson = match[1];
  const CareerPaths = await safeJsonParse(extractedJson);
  return CareerPaths;
};

const modifyRoadmapAI = async (roadmap, query) => {
  const prompt = `Improve this career roadmap. user want modifications: ${query} \n and roadmap task array is ${roadmap.tasks} \n\n\n
---
Strictly Keep the schema same. you can add/remove/change the tasks or subtasks depending on the modifications requirements. if you change any task/subtask change their other data accordingly. Update tag of each task (new, updated etc).
---
Strictly give json response like:
\`\`\`json
{
tasks: [all tasks array with schema of existing tasks],
}
\`\`\`
`;
  console.log("modification prompt" + prompt);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-04-17",
    generation_config: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      temperature: 1,
      response_mime_type: "application/json",
    },
  });
  const result = await model.generateContent(prompt);
  const content = result.response.candidates[0].content.parts[0].text;
  console.log("Generated content:", content);
  const match = content.match(/```json\n([\s\S]*?)\n```/);
  if (!match) {
    console.log("💥 No valid JSON block found.");
    return res.status(500).json({ success: false, message: "AI Engine Error!" });
  }
  const extractedJson = match[1];
  const roadmapData = await safeJsonParse(extractedJson);
  return roadmapData;
};
const evaluateSubtaskAI = async (subtask, task, text, file) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-05-20",
    generation_config: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      temperature: 0.4,
    },
  });

  let promptText = `As a career advisor, evaluate the following submission for the task "${task.name}" and subtask "${subtask.name}". `;
  if (file) {
    const fileContent = file.buffer.toString();
    promptText += `The user has submitted a file with the following content:\n${fileContent}\n`;
  }
  if (text) {
    promptText += `The user has provided the following explanation:\n${text}\n`;
  }
  promptText += `\nProvide a concise evaluation (phrases) of this submission. Assess:
  1. Areas of strength
  2. Areas for improvement.
  3. Relevance.
  keep your response as short as possible, and do not include any additional information or instructions. dont add markdown or text formatting.
  if file or text is not relevant to the subtask, then just say "not relevant" and do not give any analysis.
  `;

  const result = await model.generateContent(promptText);
  analysis = result.response.text();
  return analysis;
};
const GEMINI_API_KEYS = [
  "AIzaSyA3-kU0Oo4A_kZRp1ceogRhoUhWHawXPvI",
  "AIzaSyCWeJAjae2FE25b1AcKHBm4-vRFiC-g5pc",
  "AIzaSyAyMmTs4nX0r5zPSWsQRkz7p0GrnLFmtZU",
  "AIzaSyDe6QFfQ19BVsYCXWbZwVMYyq1ysK_BNUc",
  "AIzaSyB_YoYW79NMhSsbS9dGLkjq5hrkUJmd2jw",
];
function getRandomGeminiKey() {
  const validKeys = GEMINI_API_KEYS.filter(Boolean);
  return validKeys[Math.floor(Math.random() * validKeys.length)];
}
module.exports = { generateRoadmapAI, generateSubtaskSourcesAI, modifyRoadmapAI, getCareerPathsAI, evaluateSubtaskAI };
