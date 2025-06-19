const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const CalculateRelevancyScores = async (jobs, profile) => {
  const prompt = `
     You are a career coach AI. Based on the candidate's profile summary and each job description, provide a relevancy analysis.

     Career Goal: ${profile.careerGoal} \n
     Profile Summary: ${profile.profileSummary}

     All Jobs with their descriptions:
     ${jobs
       .map((job, idx) => `Job #${idx + 1}:\nID: ${job._id.toString()}\nDescription: ${job.description}`)
       .join("\n\n")}
     
     For each job, analyze and provide:
     1. Match Score (0-100): How well the candidate's profile matches the job requirements (skills, experience, qualifications etc.).
     2. Why: List 3 key reasons why this job is a good match (matching skills, experience, etc.)
     3. What's Missing: List up to 3 important requirements or skills that the candidate lacks. (not experience, but skills or qualifications).

Why and What's Missing should be concise and specific to each job. dont give explanations or additional text. prefer phrases over sentences.

     Respond in JSON format:
     \`\`\`json
     [
       {
         "id": "job_id",
         "score": 85,
         "why": ["reason1", "reason2", "reason3"],
         "missing": ["missing1", "missing2", "missing3"]
       },
       // other jobs
     ]
     \`\`\`
     `;
  // console.log("prompt: " + prompt);

  const ai = new GoogleGenAI({
    apiKey: "AIzaSyAyMmTs4nX0r5zPSWsQRkz7p0GrnLFmtZU",
  });
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];
  const modelName = "gemini-2.5-flash-preview-05-20";
  const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    generationConfig: {
      temperature: 0.0,
      topP: 1.0,
      topK: 1,
    },
  };
  const result = await ai.models.generateContent({
    model: modelName,
    contents: contents,
    config: config,
  });
  let content = result.candidates[0].content.parts[0].text;
  // console.log("job ai content: " + content);
  const jsonString = content.match(/```json\n([\s\S]*?)\n```/)[1];
  const parsedResult = await safeJsonParse(jsonString);

  return parsedResult;
};

const getKeywordsAndSummary = async (profile) => {
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
const getResumeData = async (profile, job) => {
  const prompt = generatePrompt(profile, job);
  console.log("prompt: " + prompt);
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyAyMmTs4nX0r5zPSWsQRkz7p0GrnLFmtZU",
  });
  const modelName = "gemini-2.5-flash-preview-05-20";
  let files;
  let config;
  try {
    console.log("Starting generating resume...");
    files = [await ai.files.upload({ file: path.join(__dirname, "example_resume_creative.png") })];
    config = {
      responseMimeType: "text/plain",
    };
    console.log(`example resume uploaded successfully. File URI: ${files[0].uri}, File Name: ${files[0].name}`);
  } catch (error) {
    console.error("Error uploading example resume file:", error);
    throw new Error("Failed to upload example resume for processing.");
  }
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
  let content = "";
  try {
    console.log("Generating content from example resume...");
    const result = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config,
    });
    content = result.candidates[0].content.parts[0].text;
    content = content
      .replace(/^```html\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/```$/, "");
    console.log("Raw response text:", content);
  } catch (error) {
    console.error("Error generating resume content: ", error);
    throw error;
  }
  console.log("resume data: " + content);
  const { buffer, filePath } = await generatePDF(content, `NormalResume${job.id}_123.pdf`);
  fs.unlinkSync(filePath);
  return buffer;
};

//HELPER FUNCTIONS
//func 1 - for pdf generation
const generatePDF = async (htmlString, fileName = "output.pdf") => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setContent(htmlString, { waitUntil: "networkidle0" });

  const outputPath = path.join(__dirname, "pdfs");
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }

  const fullPath = path.join(outputPath, fileName);

  // 🧠 BUFFER MODE
  const buffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: false,
    displayHeaderFooter: false,
    headerTemplate: "<span></span>",
    footerTemplate: "<span></span>",
    margin: {
      top: "1cm",
      right: "1cm",
      bottom: "1cm",
      left: "1cm",
    },
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
// func 2
const generatePrompt = (profile, job) => {
  let promptBase = `
You are a **modern frontend engineer and UX-centric resume stylist**. Your task is to generate a clean, modern, and fully responsive **HTML + embedded CSS** resume inspired by the attached **MODERN reference resume** design.

📌 YOU MUST:
- Mirror the **layout, typography, and overall aesthetic** of the reference resume attached.
- Keep max width at 800px, centered.
- Use clean, neutral fonts like 'Segoe UI' or Helvetica.
- Stick to dark text (#1A1A1A) and blue highlights (#007ACC).
- Use CSS Grid or Flexbox for clear, modular layout.
- Ensure it's 100% print-friendly and screen-readable.

🧱 STRUCTURE:
- Use semantic HTML (<section>, <article>, <header>, etc.).
- Include sections according to the reference resume.
- CSS should be perfectly aligned with the design.
- Use clear section dividers, consistent padding/margin.
- Integrate job description keywords naturally. Dont change title exact to job title but align content with it.
- In education data, if you dont get fieldof study than add appropriate field by yourself for example computer science  for BS software engineering.
- subskills of each skill does not need to be added in resume.
- Use profile data according to refernce resume. you might not need all data from profile. and dont add any paceholders.

❌ DO NOT ADD ANY PLACEHOLDERS.

📄 FINAL OUTPUT:
- Return a **standalone HTML document** with embedded <style> in <head>.
- **DO NOT** use markdown, placeholders, or explanations.

💡 This resume must follow the **modern resume example** attached. Style, spacing, and layout should be visibly aligned.

👤 USER PROFILE:
Name: ${profile.name || "Muhammad Shoaib"}
Email: ${profile.email || "mshoaibarid@gmail.com"}
phone:  ${profile.phone || "+923445450151"}
languages: english, punjabi, urdu
Hard Skills: ${profile.hardSkills}  
Soft Skills: ${profile.softSkills}  
Work Experience: ${profile.jobs}  
Projects: ${profile.projects}  
Education: ${profile.education}  
Career Goal: ${profile.careerGoal}  
Location: ${profile.location}

🎯 JOB DESCRIPTION:
Title: ${job.title}  
Description: ${job.description}
    `;

  return promptBase.trim();
};
// json parse
async function safeJsonParse(rawContent) {
  try {
    // Attempt normal parse first
    return JSON.parse(rawContent);
  } catch (err) {
    console.warn("⚠️ Normal JSON parse failed. Trying to REPAIR broken JSON...");
    try {
      // Try to repair broken JSON
      const repaired = repair(rawContent);
      console.log("🛠️ Successfully repaired JSON.");
      return JSON.parse(repaired);
    } catch (repairErr) {
      console.error("💀 JSON Repair also failed.");
      throw new Error("Completely invalid JSON, bro. LLM needs chittar therapy.");
    }
  }
}

module.exports = {
  CalculateRelevancyScores,
  getKeywordsAndSummary,
  getCoverLetterData,
  getResumeData,
};
