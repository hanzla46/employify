const { GoogleGenerativeAI } = require("@google/generative-ai");

const getKeywords = async (skills) => {
  try {
    // Extract the skill names and join them into a string
    const skillsList = skills.map(skill => skill.name).join(", ");

    // Build the prompt dynamically
    const prompt = `
You are an intelligent job keyword expander optimized for career platforms and recruitment engines.

When given a list of input keywords (e.g., "reactjs", "sql", "aws"), your task is to expand each keyword into an array of highly relevant, job-posting-specific keywords. Follow these strict rules:

1. Include common variants, synonyms, and correct skill-related forms (e.g., for "nodejs", include "node.js", "node", etc.).
2. Include job role titles and professional labels related to the keyword (e.g., for "sql", include "data analyst", "sql developer", "database administrator").
3. Split compound keywords *only if* the smaller parts make sense individually in job descriptions. For example:
   - ✅ "reactjs developer" ➝ "reactjs", "developer"
   - ❌ "full stack developer" ➝ do NOT split into "full", "stack", "developer"
4. Exclude overly generic or non-skill-specific keywords that don’t usually appear as standalone skills in job descriptions (e.g., "http server", "web server").
5. Focus more on keywords frequently used in **job descriptions**, **recruiter filters**, and **ATS (Applicant Tracking Systems)**. De-prioritize casual or rarely used terms.
6. Return the results in a simple array of strings, one array for all keywords.

Example input:
expressjs, sql, aws
Expected output format:
\`\`\`json
{
jobKeywords: [ "expressjs", "express.js", "express", "nodejs", "node.js", "node", "javascript", "rest api", "api development", "backend developer", "nodejs developer", "expressjs developer", "backend engineer", "software engineer backend", "sql", "mysql", "postgresql", "oracle", "mssql", "sql server", "data analyst", "data engineer", "sql developer", "database developer", "database administrator", "database admin", "relational database", "database management", "aws", "amazon web services", "cloud engineer", "aws engineer", "cloud architect", "aws architect", "devops engineer", "cloud developer", "aws developer", "ec2", "s3", "lambda", "rds", "cloudformation", "infrastructure as code", "terraform", "aws certified solutions architect"]
}
\`\`\`

actual keywords are:
${skillsList}
    `;
    
    // Initialize Google Generative AI API client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Make the API call to generate content
    const result = await model.generateContent(prompt);

    // Debugging: Log the raw response
    console.log("Generated Content Response:", result);

    // Extract the job keywords JSON from the generated content
    const content = result.response.candidates[0].content.parts[0].text;
    const jsonString = content.match(/```json\n([\s\S]*?)\n```/)[1];

    // Parse the extracted JSON and return the jobKeywords array
    const parsedResult = JSON.parse(jsonString);
    return parsedResult.jobKeywords;
    
  } catch (error) {
    console.error("Error occurred while generating job keywords:", error);
    throw new Error("Failed to generate job keywords.");
  }
}

module.exports = { getKeywords };
