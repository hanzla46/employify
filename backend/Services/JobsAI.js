const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const { safeJsonParse } = require("./JsonParse");
const { profile } = require("console");
const CalculateRelevancyScoresAI = async (jobs, profile) => {
  try {
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
     4. Email: Generate a personalized email object for the candidate to send to the employer (a single person) about this job. The email object should have a 'subject' and a 'body' field. The subject should be a concise, relevant subject line for the job application. The body should be a short, friendly, and professional message referencing the job and the candidate's fit, ready to send as an initial contact or application email. Do not include placeholders or require further editing.

Why and What's Missing should be concise and specific to each job. Don't give explanations or additional text. Prefer phrases over sentences.

     Respond in JSON format:
     \`\`\`json
     [
       {
         "id": "job_id",
         "score": 85,
         "why": ["reason1", "reason2", "reason3"],
         "missing": ["missing1", "missing2", "missing3"],
         "email": {
           "subject": "Your subject here",
           "body": "Your body text here"
         }
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
  } catch (error) {
    console.error("AI relevancy scoring failed:", error);
    // Return default analysis for all jobs in this chunk
    return jobs.map((job) => ({
      id: job._id.toString(),
      score: 0,
      why: ["AI analysis failed"],
      missing: [],
      email: {
        subject: "Job Application",
        body: "Dear Hiring Team, I am interested in this position and believe my skills are a strong match. Looking forward to connecting!",
      },
    }));
  }
};

const getCoverLetterDataAI = async (summary, job) => {
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
// const resumeData = require("./resumeData");

async function getResumeDataAI(profile, job) {
  const resumeData = await GeminiResumeData(profile, job);
  const htmlTemplatePath = path.join(__dirname, "resumeTemplate.html");
  let htmlContent = fs.readFileSync(htmlTemplatePath, "utf8");

  const injectedHtml = htmlContent.replace(
    "<body>",
    `<body>\n<script>window.resumeData = ${JSON.stringify(resumeData)};</script>\n`
  );

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setContent(injectedHtml, { waitUntil: "networkidle0" });

  // Execute the rendering function within the page's context.
  await page.evaluate(() => {
    window.renderResume(window.resumeData);
  });

  // Wait for a Font Awesome icon to be rendered to ensure the stylesheet is loaded.
  await page.waitForSelector(".fa-solid.fa-envelope", { timeout: 5000 });

  // Wait for the profile image to load before generating the PDF.
  // await page.waitForSelector("#profileImageInjected", { timeout: 5000 });

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

  const buffer = await page.pdf({
    width: "1000px",
    height: `${bodyHeight + 50}px`,
    printBackground: true,
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
  });

  console.log("PDF resume has been generated successfully!");
  await browser.close();
  return buffer;
}
// resume ai helper function
const GeminiResumeData = async (profile, job) => {
  const prompt = `
  you are member of ATS cult. get this user's profile and a job's description and give me resume data in json.

  // 👤 USER PROFILE:
// Name: ${profile.name || "John Doe"}
// Email: ${profile.email || "example@gmail.com"}
// phone:  ${profile.phone || "+923445450151"}
// linkedin: ${profile.linkedin || "Dont include it"}
// languages: English & (dynamically add according to user's location)
// Hard Skills: ${profile.hardSkills}
// Soft Skills: ${profile.softSkills}
// Work Experience: ${profile.jobs}
// Projects: ${profile.projects}
// Education: ${profile.education}
// Career Goal: ${profile.careerGoal}
// Location: ${profile.location}

---

// job description
${job.description} \n\n

---

response in json like this:
\`\`\`json
{
  personalInfo: {
    firstName: "Sarah",
    lastName: "Johnson",
    title: "Digital Marketing Manager",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    linkedin: "linkedin.com/in/sarahjohnson",
    website: "sarahjohnson.com",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  summary:
    "Results-driven Digital Marketing Manager with <b> 6+ years </b> of experience in developing and executing comprehensive marketing strategies. Proven track record of increasing brand awareness by 150% and driving revenue growth through data-driven campaigns. Expert in social media marketing, content strategy, and marketing automation with a passion for innovative digital solutions." // max 70 words,
  experience: [
    {
      title: "Digital Marketing Manager",
      company: "TechStart Solutions",
      duration: "Mar 2022 - Present",
      description:
        "Lead digital marketing initiatives for B2B SaaS company. Increased qualified <b> leads by 200% </b> through strategic content marketing and SEO optimization. Manage marketing <b> budget of $500K+ <b> and oversee team of 4 marketing specialists."// max 25 words,
    },
    {
      title: "Marketing Coordinator",
      company: "Brand Builders LLC",
      duration: "Aug 2018 - May 2020",
      description:
        "Coordinated multi-channel marketing campaigns and managed email marketing automation. Assisted in rebranding initiative that resulted in <b> 45% increase </b> in brand recognition metrics.",
    },
  ],
  projects: [
    {
      name: "Brand Awareness Campaign",
      description:
        "Comprehensive multi-platform campaign that increased <b> brand recognition by 150% </b> over 6 months. Integrated social media, content marketing, and influencer partnerships to reach target demographics."// max 25 words,
      skills: ["Google Analytics", "HubSpot", "Hootsuite", "Canva", "Facebook Ads"],
      links: {
        case_study: "https://sarahjohnson.com/brand-campaign",
      },
    },
    {
      name: "Marketing Automation System",
      description:
        "Implemented comprehensive marketing automation workflows that improved lead nurturing <b> efficiency by 300%<b>. Designed customer journey mapping and personalized email sequences.",
      skills: ["Marketo", "Salesforce", "Zapier", "Google Tag Manager"],
      links: {
        portfolio: "https://sarahjohnson.com/automation-case-study",
      },
    },
  ],
  education: [
    {
      degree: "Master of Business Administration (MBA)",
      school: "Columbia Business School",
      duration: "2016 - 2018",
    },
    {
      degree: "Bachelor of Arts in Communications",
      school: "New York University",
      duration: "2012 - 2016",
    },
  ],
  skills: [
    { name: "Digital Marketing Strategy", score: 90 },
    { name: "Social Media Marketing", score: 85 },
    { name: "Content Creation", score: 80 },
    { name: "SEO/SEM", score: 75 },
    { name: "Marketing Analytics", score: 88 },
    { name: "Email Marketing", score: 82 },
    { name: "Project Management", score: 87 },
  ],
  languages: [
    { name: "English", proficiency: "Native" },
    { name: "Spanish", proficiency: "Fluent" },
  ],
  certifications: [
    { name: "Google Analytics Certification", date: "2020" },
    { name: "HubSpot Marketing Software", date: "2019" },
  ],
}\`\`\`

---
some instructions:
you dont need to add all skills and subskills.. just main ones.
To bold important data use html's bold tag not * or anything else.
if user has 3+ projects or experience then give only top 3 according to job
  `;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const content = result.response.candidates[0].content.parts[0].text;
  console.log("Generated resume Response:", content);
  return JSON.parse(content.match(/```json\n([\s\S]*?)\n```/)[1]);
};
module.exports = {
  CalculateRelevancyScoresAI,
  getCoverLetterDataAI,
  getResumeDataAI,
};
