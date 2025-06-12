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
  const prompt = `You are a senior frontend engineer and elite resume designer specializing in professional, print-ready resumes for modern job applications. Your task is to generate a **complete and visually polished resume** in **HTML and embedded CSS**, based on the following user profile and job description.

⚠️ Follow all formatting, styling, and structure rules strictly. This is intended to be used in a professional hiring context and must be visually perfect, aligned, and print-ready.

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

🎨 DESIGN RULES:

- Overall aesthetic should match the visual style of the reference resume provided (clean, minimalist, professional).
- Keep max resume width to **800px**, centered on page.
- Use **neutral fonts** (e.g., Arial, Helvetica, or 'Segoe UI') with consistent typography hierarchy.
- Apply **professional color scheme**: dark text (#1A1A1A), subtle highlights (#007ACC or equivalent).
- Ensure spacing and alignment is pixel-perfect. No overflow, no broken sections.
- Use consistent padding/margin, clear section dividers, and readable line spacing.
- Design must look clean on both desktop and print.

🧱 STRUCTURE & CONTENT RULES:

- Use semantic, accessible HTML (<section>, <article>, <header>, <ul>, etc.).
- Include Sections according to the reference resume including details in each section.
- **Use actual data provided**. NEVER insert placeholders or lorem ipsum.
- Match keywords from the job description naturally throughout the resume content.

🎯 CSS RULES:

- Include a full <style> block inside <head> (no external stylesheets or libraries).
- Use **Flexbox or CSS Grid** for layout (no tables).
- Use BEM-style or clean class names.
- Ensure the design is **responsive**, readable, and **print-friendly**.
- Use consistent font sizes.
- No animations or transitions.

📄 FINAL OUTPUT:

- Return a **full standalone HTML document**, starting from <!DOCTYPE html> with proper <html>, <head>, and <body>.
- **DO NOT** include any markdown, code fences, or commentary.
- **ONLY** return valid HTML+CSS code (no explanations or wrapping characters).
- Treat this as production code — it must be clean, semantic, and well-structured.

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

👤 USER PROFILE DATA:

Name: John Doe  
Hard Skills: ${profile.hardSkills}  
Soft Skills: ${profile.softSkills}  
Work Experience: ${profile.jobs}  
Projects: ${profile.projects}  
Career Goal: ${profile.careerGoal}  
Location: ${profile.location}  \n

📌 JOB DESCRIPTION:

Title: ${job.title}  
Description: ${job.description}  


`;
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
    width: "800px", // or any width you want
    printBackground: true,
    preferCSSPageSize: true,
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

const getBestResumeData = async (profile, job) => {
  const generatePrompt = (profile, job, style) => {
    const promptBase = `You are a senior frontend engineer and elite resume designer specializing in professional, print-ready resumes for modern job applications. Your task is to generate a **complete and visually polished resume** in **HTML and embedded CSS**, based on the following user profile and job description.

⚠️ Follow all formatting, styling, and structure rules strictly. This is intended to be used in a professional hiring context and must be visually perfect, aligned, and print-ready.

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

🎨 DESIGN RULES:

- Overall aesthetic should match the visual style described below.
- Keep max resume width to **800px**, centered on page.
- Use **neutral fonts** (e.g., Arial, Helvetica, or 'Segoe UI') with consistent typography hierarchy.
- Apply **professional color scheme**: dark text (#1A1A1A), subtle highlights (#007ACC or equivalent).
- Ensure spacing and alignment is pixel-perfect. No overflow, no broken sections.
- Use consistent padding/margin, clear section dividers, and readable line spacing.
- Design must look clean on both desktop and print.

🧱 STRUCTURE & CONTENT RULES:

- Use semantic, accessible HTML (<section>, <article>, <header>, <ul>, etc.).
- Include Sections according to the reference resume including details in each section.
- **Use actual data provided**. NEVER insert placeholders or lorem ipsum.
- Match keywords from the job description naturally throughout the resume content.

🎯 CSS RULES:

- Include a full <style> block inside <head> (no external stylesheets or libraries).
- Use **Flexbox or CSS Grid** for layout (no tables).
- Use BEM-style or clean class names.
- Ensure the design is **responsive**, readable, and **print-friendly**.
- Use consistent font sizes.
- No animations or transitions.

📄 FINAL OUTPUT:

- Return a **full standalone HTML document**, starting from <!DOCTYPE html> with proper <html>, <head>, and <body>.
- **DO NOT** include any markdown, code fences, or commentary.
- **ONLY** return valid HTML+CSS code (no explanations or wrapping characters).
- Treat this as production code — it must be clean, semantic, and well-structured.

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

👤 USER PROFILE DATA:

Name: John Doe  
Hard Skills: ${profile.hardSkills}  
Soft Skills: ${profile.softSkills}  
Work Experience: ${profile.jobs}  
Projects: ${profile.projects}  
Education: ${profile.education}
Career Goal: ${profile.careerGoal}  
Location: ${profile.location}  \n

📌 JOB DESCRIPTION:

Title: ${job.title}  
Description: ${job.description}  

`;

    let styleInstructions = "";
    if (style === "modern") {
      styleInstructions =
        "- The design should be modern and clean, with a focus on readability. Use a simple layout with clear sections. Make sure that the overall aesthetic should match the visual style of the reference resume provided (clean, minimalist, professional).";
    } else if (style === "classic") {
      styleInstructions =
        "- The design should be classic and professional, with a traditional layout. Use a balanced and structured design. Make sure that the overall aesthetic should match the visual style of the reference resume provided (clean, minimalist, professional).";
    } else if (style === "creative") {
      styleInstructions =
        "- The design should be creative, using unique design elements to stand out. Use a visually appealing design that will grab the attention of the recruiter. Make sure that the overall aesthetic should match the visual style of the reference resume provided (clean, minimalist, professional).";
    } else {
      styleInstructions = "- The design should be clean, minimalist and professional";
    }

    return promptBase + styleInstructions;
  };
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyAyMmTs4nX0r5zPSWsQRkz7p0GrnLFmtZU",
  });
  const modelName = "gemini-2.5-flash-preview-05-20"; // Using the latest model
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
        responseMimeType: "text/plain",
      });
      content = result.candidates[0].content.parts[0].text;
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
  const resumeData = resumes.map((resume) => {
    return {
      style: resume.style,
      htmlContent: resume.buffer.toString(),
      filePath: resume.filePath, // Store file path for cleanup
    };
  });

  // Prompt for choosing the best resume
  const selectionPrompt = `
    You have generated three resumes with different styles based on a user profile and job description.  You will be provided the raw HTML for each.  Please analyze each resume based on the following criteria:

    - **Visual Appeal:** How aesthetically pleasing and professional is the design? Is it clean, well-organized, and easy on the eyes?
    - **Readability:** How easy is the content to read and understand? Is the typography clear, and is the information logically structured?
    - **Suitability:** Does the design and content best reflect the user profile and job description? Does it highlight the most relevant skills and experiences?

    Considering these factors, select the resume that you consider the visually best option for a modern job application, and provide its 'style' name.

    Resume Options:

    ${resumeData
      .map(
        (resume, index) => `
        Resume ${index + 1} (${resume.style}):
        ${resume.htmlContent}
        `
      )
      .join("\n\n")}
    
    Based on the evaluation, which of the above resumes is the best choice? Provide only the style name of the best resume (e.g., "modern", "classic", or "creative").
    `;
  let bestResumeStyle;

  try {
    console.log("Starting resume selection...");
    const aiSelection = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: selectionPrompt }] }],
      responseMimeType: "text/plain",
    });

    bestResumeStyle = aiSelection.candidates[0].content.parts[0].text.trim();
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
    fs.unlinkSync(resume.filePath);
    console.log(`Deleted temporary file: ${resume.filePath}`);
  });

  return selectedResume.buffer;
};
module.exports = {
  CalculateRelevancyScores,
  getKeywordsAndSummary,
  getCoverLetterData,
  getNormalResumeData,
  getBestResumeData,
};
