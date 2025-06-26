const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
const path = require("path");
const fs = require("fs").promises;
const { setTimeout } = require("timers/promises");

const getKeywordsAndSummaryAI = async (profile) => {
  try {
    const skillsList = profile.hardSkills
      .map((skill) => {
        let str = skill.name;
        if (skill.subskills && skill.subskills.length > 0) {
          str += ` (subskills: ${skill.subskills.join(", ")})`;
        }
        return str;
      })
      .join(", ");

    const prompt = `
You are an intelligent job keyword expander and profile summarizer optimized for career platforms and recruitment engines.

** When given a list of input keywords (e.g., "reactjs", "sql", "aws"), your task is to expand each keyword into an array of highly relevant, job-posting-specific keywords. Follow these strict rules:**
1. Include common variants, synonyms, and correct skill-related forms (e.g., for "nodejs", include "node.js", "node", etc.).
2. Include job role titles and professional labels related to the keyword (e.g., for "sql", include "data analyst", "sql developer", "database administrator").
3. Split compound keywords *only if* the smaller parts make sense individually in job descriptions. For example:
   - ✅ "reactjs developer" ➝ "reactjs", "developer"
   - ❌ "full stack developer" ➝ do NOT split into "full", "stack", "developer"
4. Exclude overly generic or non-skill-specific keywords that don’t usually appear as standalone skills in job descriptions (e.g., "http server", "web server").
5. Focus more on keywords frequently used in **job descriptions**, **recruiter filters**, and **ATS (Applicant Tracking Systems)**. De-prioritize casual or rarely used terms.
6. Return the results in a simple array of strings, one array for all keywords.

Second task is to summarize the profile of the same user. you will be provided Hard Skills, Soft skills, job experience etc. you have to provide one paragraph summary.

Expected output format:
\`\`\`json
{
jobKeywords: [ "expressjs", "express.js", "express", "nodejs", "node.js", "node", "javascript", "rest api", "api development", "backend developer", "nodejs developer", "expressjs developer", "backend engineer", "software engineer backend", "sql", "mysql", "postgresql", "oracle", "mssql", "sql server", "data analyst", "data engineer", "sql developer", "database developer", "database administrator", "database admin", "relational database", "database management", "aws", "amazon web services", "cloud engineer", "aws engineer", "cloud architect", "aws architect", "devops engineer", "cloud developer", "aws developer", "ec2", "s3", "lambda", "rds", "cloudformation", "infrastructure as code", "terraform", "aws certified solutions architect"],
summary: "one paragraph summary",
}
\`\`\`

**Input**
1.Keywords are:
${skillsList}

2. Profile is:
${profile}
    `;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    console.log("Generated Content Response:", result);
    const content = result.response.candidates[0].content.parts[0].text;
    const jsonString = content.match(/```json\n([\s\S]*?)\n```/)[1];
    const parsedResult = JSON.parse(jsonString);
    return parsedResult;
  } catch (error) {
    console.error("Error occurred while generating job keywords:", error);
    return "LLM_ERROR";
  }
};

const processResumeAI = async (file) => {
  try {
    const filePath = path.join(__dirname, "uploads", `${Date.now()}-${file.originalname}`);
    await fs.writeFile(filePath, file.buffer);
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API,
    });
    const modelName = "gemini-2.5-flash";
    let files;
    let config;
    try {
      console.log("Starting resume file upload...");
      files = [await ai.files.upload({ file: filePath })];
      await waitForFileActive(ai, files[0].name);
      await fs.unlink(filePath);
      config = {
        responseMimeType: "text/plain",
      };
      console.log(`resume uploaded successfully. File URI: ${files[0].uri}, File Name: ${files[0].name}`);
    } catch (error) {
      console.error("Error uploading resume file:", error);
      throw new Error("Failed to upload resume for processing.");
    }
    const prompt = `Analyze this resume and provide insights on positive and negatives of this resume. keep it short and one paragraph`;
    const contents = [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: files[0].uri,
              mimeType: files[0].mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ];
    try {
      console.log("Generating content for resume...");
      const result = await ai.models.generateContentStream({
        model: modelName,
        contents: contents,
        config: config,
      });
      let content = "";
      for await (const chunk of result) {
        content += chunk.text;
      }
      console.log("Raw resume response text:", content);
      return content;
    } catch (error) {
      console.error("Error generating content from resume:", error);
      throw new Error("Failed to process resume content.");
    }
  } catch (error) {
    console.error("Error processing resume AI:", error);
    return "LLM_ERROR";
  }
};

const getSubskillsAI = async (skillName) => {
  try {
    const normalizedSkillName = skillName.trim();

    // use gemini ai to fetch subskills
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      generation_config: {
        temperature: 1,
        response_mime_type: "application/json",
      },
    });
    // only useful subskills that are usually used in the industry
    const prompt = `List only the most relevant and commonly required subskills for the skill "${normalizedSkillName}" in JSON format like this:
    \`\`\`json
    {
      "subskills": ["Subskill1", "Subskill2", "Subskill3"]
    }
    \`\`\`
    Focus on subskills that are:
    - Frequently mentioned in job descriptions for this skill
    - Widely used in professional, real-world projects
    - Valued by employers in the industry
    
    ⚠️ Do NOT include niche, outdated, or overly generic subskills. If the skill is not recognized or lacks common subskills, return an empty array. No additional text or formatting.`;

    const result = await model.generateContent(prompt);
    const content = result.response.candidates[0].content.parts[0].text;
    const jsonString = content.match(/```json\n([\s\S]*?)\n```/)[1];
    const subskills = JSON.parse(jsonString).subskills;
    return subskills;
  } catch (error) {
    console.error("Error in getSubskillsAI:", error);
    return [];
  }
};
async function waitForFileActive(ai, fileName) {
  let file = await ai.files.get({ name: fileName });
  let retries = 0;
  const maxRetries = 20; // Safety break to prevent infinite loops
  const delay = 5000; // 5 seconds

  while (file.state === "PROCESSING" && retries < maxRetries) {
    console.log(`Polling file status: ${file.state}... (Attempt ${retries + 1})`);
    await setTimeout(delay); // Wait for 5 seconds
    file = await ai.files.get({ name: fileName });
    retries++;
  }

  if (file.state !== "ACTIVE") {
    console.error("File processing failed or timed out. Final state:", file.state);
    throw new Error(`File ${fileName} is not in ACTIVE state. Current state: ${file.state}`);
  }

  return file;
}
module.exports = { getKeywordsAndSummaryAI, processResumeAI, getSubskillsAI };
