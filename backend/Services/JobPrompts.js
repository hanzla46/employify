const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
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
  const prompt = generatePrompt(profile, job, "classic");
  console.log("prompt: " + prompt);
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyAyMmTs4nX0r5zPSWsQRkz7p0GrnLFmtZU",
  });
  const modelName = "gemini-2.5-flash-preview-05-20";
  let files;
  let config;
  try {
    console.log("Starting generating resume...");
    files = [await ai.files.upload({ file: path.join(__dirname, "example_resume_classic.png") })];
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

const getBestResumeData = async (profile, job) => {
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyAyMmTs4nX0r5zPSWsQRkz7p0GrnLFmtZU",
  });
  const modelName = "gemini-2.5-flash-preview-05-20";
  const config = {
    thinkingConfig: {
      thinkingBudget: 1024,
    },
    responseMimeType: "text/plain",
    generationConfig: {
      temperature: 0.0,
      topP: 1.0,
      topK: 1,
    },
  };
  let exampleFile = "";

  // Function to process a single style
  const generateResumeForStyle = async (style) => {
    const prompt = generatePrompt(profile, job, style);
    if (style === "modern") {
      exampleFile = "example_resume_modern.png";
    } else if (style === "classic") {
      exampleFile = "example_resume_classic.png";
    } else if (style === "creative") {
      exampleFile = "example_resume_creative.png";
    } else {
      exampleFile = "example_resume.png"; // Default case
    }
    // Upload the example resume image file
    let files;
    try {
      files = [await ai.files.upload({ file: path.join(__dirname, exampleFile) })];
      console.log(
        `Example resume uploaded successfully for ${style}. File URI: ${files[0].uri}, File Name: ${files[0].name}`
      );
    } catch (error) {
      console.error(`Error uploading example resume for ${style}:`, error);
      throw new Error(`Failed to upload example resume for ${style}.`);
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
      console.log(`Generating content for ${style}...`);
      const result = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: config,
      });
      content = result.candidates[0].content.parts[0].text;
      content = content
        .replace(/^```html\s*/, "")
        .replace(/^```\s*/, "")
        .replace(/```$/, "");
      console.log(`Raw response text for ${style}: (First 100 chars) ${content.substring(0, 100)}...`);
    } catch (error) {
      console.error(`Error generating resume content for ${style}: `, error);
      throw error;
    }

    const { buffer, filePath } = await generatePDF(content, `resume_${style}_${job.id}.pdf`);
    // No need to unlink here, it's done in the main function

    return { buffer, filePath, style };
  };

  // Parallel API calls for different styles
  const resumePromises = [
    generateResumeForStyle("modern"),
    generateResumeForStyle("classic"),
    generateResumeForStyle("creative"),
  ];

  let resumes;
  try {
    resumes = await Promise.all(resumePromises);
  } catch (error) {
    console.error("Error generating resumes in parallel:", error);
    throw error;
  }

  //   Combine resume data for the selection prompt
  const resumeData = resumes.map((resume) => ({
    style: resume.style,
    filePath: resume.filePath,
  }));

  // Upload all PDF files for visual comparison
  const pdfFiles = [];
  for (const resume of resumeData) {
    try {
      const file = await ai.files.upload({ file: resume.filePath });
      pdfFiles.push({
        style: resume.style,
        uri: file.uri,
        mimeType: file.mimeType,
      });
    } catch (error) {
      console.error(`Error uploading PDF for ${resume.style}:`, error);
      throw new Error(`Failed to upload PDF for ${resume.style}`);
    }
  }

  // Prompt for choosing the best resume
  const selectionPrompt = `
    You have generated three resumes with different styles based on a user profile and job description. I have attached the PDF versions of each resume for you to visually analyze. Please analyze each resume based on the following criteria:

    - **Visual Appeal:** How aesthetically pleasing and professional is the design? Is it clean, well-organized, and easy on the eyes?
    - **Readability:** How easy is the content to read and understand? Is the typography clear, and is the information logically structured?
    - **Suitability:** Does the design and content best reflect the user profile and job description? Does it highlight the most relevant skills and experiences?

    Considering these factors, select the resume that you consider the visually best option for a modern job application, and provide its 'style' name.

      1. First PDF: Modern style resume
    2. Second PDF: Classic style resume
    3. Third PDF: Creative style resume

    Based on the evaluation of the PDF files attached, which of the resumes (modern, classic, or creative) is the best choice? Provide only the ONE WORD Style name of the best resume.
    `;
  let bestResumeStyle;

  try {
    console.log("Starting resume selection...");
    const contents = [
      {
        role: "user",
        parts: [
          ...pdfFiles.map((file) => ({
            fileData: {
              fileUri: file.uri,
              mimeType: file.mimeType,
            },
          })),
          {
            text: selectionPrompt,
          },
        ],
      },
    ];

    const aiSelection = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "text/plain",
      },
    });

    bestResumeStyle = aiSelection.candidates[0].content.parts[0].text.trim().toLowerCase();
    console.log("Best resume style:", bestResumeStyle);
  } catch (error) {
    console.error("Error selecting the best resume:", error);
    throw error;
  }

  // Find and return the selected resume buffer
  const selectedResume = resumes.find((resume) => resume.style === bestResumeStyle);

  if (!selectedResume) {
    throw new Error("No resume found for the selected style.");
  }

  // Clean up all generated PDF files
  resumes.forEach((resume) => {
    //fs.unlinkSync(resume.filePath);
    console.log(`Deleted temporary file: ${resume.filePath}`);
  });

  return selectedResume.buffer;
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
const generatePrompt = (profile, job, style) => {
  let promptBase = "";

  if (style === "modern") {
    promptBase = `
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
- Integrate job description keywords naturally.

📄 FINAL OUTPUT:
- Return a **standalone HTML document** with embedded <style> in <head>.
- **DO NOT** use markdown, placeholders, or explanations.

💡 This resume must follow the **modern resume example** attached. Style, spacing, and layout should be visibly aligned.

👤 USER PROFILE:
Name: John Doe  
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
  } else if (style === "classic") {
    promptBase = `
You are a **traditional resume architect** crafting high-quality, timeless resumes for professional use. Your task is to create a **print-optimized HTML + CSS resume** that mirrors the attached **CLASSIC resume reference** design.

📌 YOU MUST:
- Replicate the layout, spacing, fonts, and structure of the reference resume.
- Use a serif font stack (Georgia, Times New Roman).
- Keep color palette monochrome: black, gray, soft lines.
- Full-width sections, right-aligned dates, uppercase section headers.
- Strictly print-ready: no animations, perfect alignment.

🧱 STRUCTURE:
- Semantic HTML with <header>, <section>, etc.
- Include: Contact Info, Objective, Work Experience, Education, Skills, Projects.
- Maintain formal, conservative tone.
- Add keywords from job description subtly, without disrupting formality.

📄 FINAL OUTPUT:
- Return a **clean HTML document** with embedded CSS in the <head>.
- Absolutely **no markdown**, placeholder text, or commentary.

💡 Match layout and formatting exactly to the **classic resume example** provided.

👤 USER PROFILE:
Name: John Doe  
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
  } else if (style === "creative") {
    promptBase = `
You are a **creative resume designer** known for building stunning, unconventional resume layouts that still pass ATS and print tests. Your goal is to deliver a visually striking resume in **HTML + CSS**, inspired by the attached **CREATIVE resume example**.

📌 YOU MUST:
- Take design and layout inspiration directly from the reference creative resume.
- Use bold color schemes (e.g., accent colors like #FF5C00 or #4A90E2).
- Modern font: Poppins, Fira Sans, or equivalent.
- Use sidebars, flex layouts, highlight blocks.
- Print-optimized but creative — think startup, design agency, or tech-forward role.

🧱 STRUCTURE:
- Use semantic HTML tags.
- Layout may be 2-column or asymmetric.
- Include: Contact, Summary, Skills, Work Experience, Projects, Education, Career Goal.
- Infuse keywords from job post *seamlessly* without compromising the artistic vibe.

📄 FINAL OUTPUT:
- Provide **only a complete HTML page** with CSS in the <head>.
- **No markdown**, dummy text, or commentary allowed.

💡 Mirror the aesthetic and structural DNA of the **creative resume sample** provided.

👤 USER PROFILE:
Name: John Doe  
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
  } else {
    // fallback (modern default)
    promptBase = `
You are a senior frontend engineer and resume designer. Your task is to create a **professional HTML + CSS resume** based on the provided data.

📌 Design should be clean, minimalist, and follow the **modern resume reference** provided.

(See modern style rules...)

👤 USER PROFILE:
Name: John Doe  
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
  }

  return promptBase.trim();
};

module.exports = {
  CalculateRelevancyScores,
  getKeywordsAndSummary,
  getCoverLetterData,
  getNormalResumeData,
  getBestResumeData,
};
