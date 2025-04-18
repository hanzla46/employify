const moment = require("moment");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mime = require("mime-types");
const getRoadmapPrompt = async (
  profile,
  questions,
  evaluationForm,
  file1,
  file2
) => {
  const evaluate = async (question, file) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    function fileToGenerativePart(fileData, filename) {
      const mimeType = mime.lookup(filename) || "text/plain"; // Default to text/plain if type is unknown
      return {
        inlineData: {
          data: fileData, // The Base64 encoded data
          mimeType: mimeType,
        },
      };
    }
    try {
      const name = file.originalname || "file.txt"; // Fallback name if originalname is not available
      const data = file.buffer.toString("base64");
      const filePart = fileToGenerativePart(data, name);
      const prompt = `Analyze this task and its response and provide insights about the user's performance. Give your response in one paragraph without formatting and extra special characters. Task is: ${question} and the user's response is: ${filePart}`;
      const result = await model.generateContent([prompt, filePart]);
      const response = await result.response;
      const text = response.text();
      console.log("Gemini Response:", text);
          return text;
    } catch (error) {
      console.error("Error in evaluate function:", error);
      return { error: error.message };
    }
  };
  try {
    const taskEvaluation1 = await evaluate(questions.hardSkillsTask1, file1);
    const taskEvaluation2 = await evaluate(questions.hardSkillsTask2, file2);
    const projectEvaluation =
      "user lack a bit in this project, but overall good";
    const prompt = `You are an expert Career Strategist. Your mission is to generate a highly personalized, actionable, and strategic career roadmap for the user, presented as a directed graph in JSON format. This roadmap must guide the user realistically towards their specific career goal: **${
      profile.careerGoal || "Being Backend Developer and getting remote job"
    }**, considering their unique background and the transformative impact of AI on their target field.

The roadmap should be intensely practical, focusing on high-impact actions that differentiate the user in a competitive market. It must go beyond basic skill acquisition and provide concrete steps for networking effectively, building a compelling portfolio/presence, and navigating the specific path to their desired outcome (e.g., landing a specific job role, securing freelance clients, launching a startup, obtaining funding).

Critically evaluate the user's profile to identify strengths to leverage and gaps to fill. Avoid redundant suggestions for skills or experiences the user clearly possesses at a sufficient level; instead, focus on *advancing*, *refining*, or *applying* those skills in novel, AI-augmented ways.

### **User Profile Snapshot:**

*   **Career Goal:** ${
      profile.careerGoal
        ? profile.careerGoal
        : "Being Backend Developer and getting remote job"
    }
*   **Current Skills:** 
    *   **Hard Skills:** ${profile.hardSkills
      .map((skill) => `${skill.name} (${skill.experience} years experience)`)
      .join(", ")}
    *   **Soft Skills:** ${profile.softSkills
      .map((skill) => `${skill.name} (${skill.proficiency} proficiency)`)
      .join(", ")}
*   **Job Experience:** ${profile.jobs
      .map((job) => `${job.title} at ${job.company} for 1 year`)
      .join(", ")}
*   **Projects Completed:** ${profile.projects
      .map((project) => project.name)
      .join(", ")}

### User Profile Evaluation:
*   **Hard Skills Task 1:** ${questions.hardSkillsTask1}
*   **Hard Skills Task 1 Evaluation:** ${taskEvaluation1}
*   **Hard Skills Task 2:** ${questions.hardSkillsTask2}
*   **Hard Skills Task 2 Evaluation:** ${taskEvaluation2}
*   **user's Skills Rating (self claimed):** ${
      evaluationForm.hardSkillRating
    } /100
*   **Soft Skills Question 1:** ${questions.softSkillsQuestion1}
*   **Soft Skills 1 Response:** ${evaluationForm.softSkillsResponse1}
*   **Soft Skills Question 2:** ${questions.softSkillsQuestion2}
*   **Soft Skills 2 Response:** ${evaluationForm.softSkillsResponse2}
*   **Project Link question:** ${questions.projectLink}
*   **Evaluation of project of Project Link provided by user:** ${projectEvaluation}
*   **Project Contribution:** ${evaluationForm.projectContribution}
*   **Project Improvement:** ${evaluationForm.projectImprovement}
*   **Job Experience:** ${evaluationForm.jobExperience}



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
            { "id": 101, "name": "Identify 3 industry problems solvable by Skill X + AI Tool Y", "buttonText": "Research Problems" },
            { "id": 102, "name": "Build a small proof-of-concept integrating Skill X & AI Tool Y", "buttonText": "Build PoC" },
            { "id": 103, "name": "Document process & results for portfolio", "buttonText": "Document Project" },
            { "id": 104, "name": "Use AI writing assistant [e.g., Grammarly Pro, ChatGPT] to refine documentation", "buttonText": "Refine Docs w/ AI"}
          ],
          "dependencies": [], // Example: might depend on foundational Skill X task if not already proficient
          "category": "AI Integration & Augmentation",
          "difficulty": "Intermediate",
          "estimated_time": "2 weeks",
          "ai_impact": "While AI can handle basic [Skill X] tasks, integrating it effectively requires deeper understanding. This skill is crucial for roles managing AI-augmented workflows and provides a competitive edge over those relying solely on automated outputs."
        }
        // ... more task objects ...
      ]
    }
    \`\`\`

### **Instruction:**

Generate the JSON roadmap now based *specifically* on the user profile and the rules above. Be strategic, realistic, and relentlessly focused on helping the user achieve **${
      profile.careerGoal || "their career goal"
    }** and stand out in the modern, AI-influenced job market. Ensure the JSON is valid.`;
    return prompt;
  } catch (error) {
    console.error("Error generating roadmap prompt:", error);
    throw error;
  }
};
module.exports = { getRoadmapPrompt };
