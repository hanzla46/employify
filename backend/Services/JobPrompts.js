const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const CalculateRelevancyScores = async (jobs, profileSummary) => {
  const prompt = `
     You are a career coach AI. Based on the candidate's profile summary and the job description, rate how relevant each job is from 0 to 100.
     
     Profile Summary: ${profileSummary}
     
     All Jobs with their descriptions:
     ${jobs
       .map((job, idx) => `Job #${idx + 1}:\nID: ${job._id.toString()}\nDescription: ${job.description}`)
       .join("\n\n")}
     
     Respond in JSON like this:
     \`\`\`json
     [
       { "id": "660fa7c1...d8ef", "score": 87 },
       { "id": "661234abc...09e7", "score": 42 }
     ]
     \`\`\`
     `;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  const result = await model.generateContent(prompt);
  const content = result.response.candidates[0].content.parts[0].text;
  const jsonString = content.match(/```json\n([\s\S]*?)\n```/)[1];
  const parsedResult = JSON.parse(jsonString);
  return parsedResult;
};

const getKeywordsAndSummary = async (profile) => {
  try {
    const skillsList = profile.hardSkills.map((skill) => skill.name).join(", ");

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
const getCoverLetterData = async (summary, job) => {
  const prompt = `
      You are an expert career advisor and professional writer.
      Generate a compelling, professional, and tailored cover letter for the following individual applying for the specified job.

      **Applicant's Profile Summary:**
      ${summary}

      **Job Details:**
      Job Title: ${job.title}
      Company: ${job.company.name || "devsinc"}
      Job Description:
      ---
      ${job.description}
      ---

      **Instructions:**
      - The cover letter should be addressed to the hiring manager of ${
        job.company.name
      } (if the name is not known, use a generic salutation like "Dear Hiring Team at ${job.company.name}").
      - Highlight how the applicant's skills and experiences from their profile summary align with the key requirements and responsibilities mentioned in the job description.
      - Maintain a professional and enthusiastic tone.
      - Ensure the letter expresses strong interest in the role and the company.
      - Conclude with a call to action, such as requesting an interview.
      - The letter should be well-structured with an introduction, body paragraphs (2-3), and a conclusion.
      - Do not include placeholders like "[Applicant's Name]" or "[Company Name]" unless it's for the salutation/closing where specific names are unknown. The content should be ready to use.
      - Focus on quality and relevance. Avoid generic statements.
      - Output only the cover letter text, without any introductory or concluding remarks from you (the AI). Start directly with the salutation (e.g., "Dear Hiring Team...").
    `;
  console.log("prompt: " + prompt);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  const result = await model.generateContent(prompt);
  console.log("Generated Content Response:", result);
  const content = result.response.candidates[0].content.parts[0].text;
  console.log("cover letter data: " + content);
  return content;
};
const getNormalResumeData = async (profile, job) => {
  const prompt = `Generate a professional and well-structured resume in HTML format, using the provided user profile data. The resume should be designed for a job application, emphasizing clarity, readability, and impact. The output should be a complete, self-contained HTML document.
  ---
User Profile Data:
Hard Skills: ${profile.hardSkills} \n
Soft Skills: ${profile.softSkills} \n
Work Experience: ${profile.jobs} \n
Projects: ${profile.projects} \n
Career Goal: ${profile.careerGoal} \n
Location: ${profile.location} \n

\n
Job Details:
Title: ${job.title} \n
Description: ${job.description}\n\n
---
Output Requirements:
HTML Structure: A complete HTML5 document with <!DOCTYPE html>, <html>, <head>, and <body> tags. Dont include unnecessary backticks at start or end.
Styling: Minimal inline CSS or a <style> block within the <head> for basic professional formatting (e.g., font family, sizes, margins, bullet point styles). No external stylesheets.
Sections: Organize the resume clearly into the following standard sections:
Contact Information: Name (prominently displayed), Email, Phone, LinkedIn Profile, Portfolio Link.
Summary/Objective (Optional but Recommended): A brief (2-3 sentences) professional summary highlighting years of experience, key expertise, and career goals relevant to tech roles. This should be concise and impactful.
Skills: A list of key technical and soft skills, potentially categorized (e.g., Programming Languages, Cloud Platforms, Databases, Methodologies).
Work Experience: For each role, include:
Job Title
Company Name
Location (if available, or implied by remote/candidate location)
Start Date – End Date (use "Present" for current role)
A bulleted list of 3-5 concise, action-oriented responsibilities and achievements, quantifying impact where possible.
Projects (Optional but Recommended): For each project, include:
Project Name
Brief Description (1-2 sentences)
Link (e.g., GitHub)
Education: For each degree, include:
Degree Name
University Name
Graduation Year
Certifications (Optional): List any relevant professional certifications.
Content Emphasis:
Prioritize recent and relevant work experience.
Use strong action verbs in bullet points (e.g., "Led," "Developed," "Implemented," "Optimized").
Quantify achievements whenever possible (e.g., "improved performance by 30%," "reduced deployment time by 50%").
Ensure all relevant skills from keySkills are prominently displayed.
Formatting: Use headings (<h2>, <h3>), lists (<ul>, <li>), and bold text (<strong>) to enhance readability.
Length: Aim for a concise, professional resume (typically 1-2 pages for this level of experience). The HTML can naturally expand, but the content should be focused.
Tone: Professional, clear, concise, and results-oriented.`;
  console.log("prompt: " + prompt);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  const result = await model.generateContent(prompt);
  console.log("Generated Content Response:", result);
  const content = result.response.candidates[0].content.parts[0].text;
  console.log("resume data: " + content);
  const { buffer, filePath } = await generatePDF(content, `NormalResume${job.id}_123.pdf`);
  fs.unlinkSync(filePath);
  return buffer;
};

const generatePDF = async (htmlString, fileName = "output.pdf") => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setContent(htmlString, { waitUntil: "networkidle0" });

  const outputPath = path.join(__dirname, "..", "pdfs");
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }

  const fullPath = path.join(outputPath, fileName);

  // 🧠 BUFFER MODE
  const buffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  // 💾 SAVE TO DISK
  fs.writeFileSync(fullPath, buffer); // write buffer directly

  await browser.close();

  // 📦 Return both like a boss
  return {
    buffer,
    filePath: fullPath,
  };
};

const getBestResumeData = async (summary, job) => {};
module.exports = {
  CalculateRelevancyScores,
  getKeywordsAndSummary,
  getCoverLetterData,
  getNormalResumeData,
  getBestResumeData,
};
