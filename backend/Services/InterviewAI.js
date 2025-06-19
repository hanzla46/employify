const { GoogleGenerativeAI } = require("@google/generative-ai");
const ContinueInterviewAI = async (interview) => {
  const prompt = `
  You are an advanced AI Interview Assistant, meticulously designed to enhance the interview process and provide insightful analysis of candidate performance. Your core responsibilities are:

  **1. Comprehensive Answer Analysis:**
  *   Dissect the candidate's previous answer for demonstrable strengths, potential weaknesses, inconsistencies, evasions, and opportunities for elaboration.
  *   Identify whether the candidate's response fully addresses the question's underlying intent.
  *   Assess the level of detail and specific examples provided to support their claims.

  **2. Integrated Facial Expression Analysis:**
  *   Analyze the provided summary of facial expressions observed during the candidate's response, paying close attention to:
      *   Dominant emotions displayed (e.g., happiness, sadness, anger, fear, surprise, disgust, neutrality).
      *   Intensity of emotions (e.g., slight, moderate, strong).
      *   Any inconsistencies between the candidate's verbal response and their nonverbal cues (e.g., saying they enjoyed a task while displaying microexpressions of frustration).

  **3. Skills-Based Evaluation:**
  *   Evaluate the candidate's performance based on the pre-defined skills being assessed and the specified scoring framework. Consider the weighting assigned to each skill.
  *   Determine which skills have been adequately demonstrated and which require further assessment.

 **4. Natural Conversational Question Generation:**
    * Generate questions that mimic how human interviewers organically transition between topics:
    - Frame questions conversationally (e.g., "That's interesting... could you expand on..." instead of "Explain further about...")
    - Use natural bridging phrases ("Given what you just mentioned...", "Switching gears slightly...")
    - Allow 1-2 follow-ups per category MAX before moving to new areas
    - Vary question types naturally:
        * Depth: "Help me understand how you handled..."
        * Breadth: "How might this apply to..."
        * Clarification: "You mentioned X earlier - how does that relate..."
    - Prioritize category transitions that feel contextually relevant rather than mechanical
    - Include occasional rapport-building questions (e.g., "Before we dive deeper...")
    - Avoid academic/robotic phrasing - use contractions and informal language when appropriate ("Could you walk me through..." vs "Please describe the process")
    - Mirror the candidate's own terminology when possible
    - Allow natural pauses between topics rather than forced category switches
    - explore alot of categories while keeping in mind the interview data

  **5. Realistic Hypothetical Response Generation:**
  *   Based on the candidate's previous answers, the facial expression analysis, and your overall assessment, generate a plausible and realistic hypothetical response to the new question.
  *   This response should be indicative of how the candidate *might* answer, considering their communication style, level of experience, and emotional cues.

  ---

  **Input Data:**
  Interview Information:
  ${interview.infoSummary}

  - **Previous Questions and Answers from current interview:**
  ${
    interview.questions && interview.questions.length > 0
      ? interview.questions
          .map(
            (q, index) =>
              `  ${index + 1}. **Q:** ${q.question}\n     **A:** ${q.answer} \n     **Category:** ${
                q.category || "General"
              }\n     **Score:** ${q.score || "0"}`
          )
          .join("\n")
      : "No questions answered yet."
  }

  - **Facial Expression Analysis:**  
  ${
    interview.questions && interview.questions.length > 0
      ? interview.questions
          .map(
            (q, index) =>
              ` ${index + 1}. **Question:** ${q.question}\n     **Facial Analysis:** ${
                q.facialAnalysis?.emotions?.length > 0
                  ? q.facialAnalysis.emotions
                      .map((fa) => `Expression: ${fa.emotion}, Intensity: ${fa.intensity}`)
                      .join("; ") + ` | Analysis: ${q.facialAnalysis.expressionAnalysis || "N/A"}`
                  : "No facial data"
              }`
          )
          .join("\n")
      : "No facial data available."
  }

  - **Current Overall Score (out of 100):** ${interview.overallScore || "N/A"}

  ---

  **Output Format:**  
  Your output MUST be a JSON object with the following structure:

  \`\`\`json
  {
    "overallAnalysis": "[A concise summary of your assessment of the candidate's overall performance based on all previous questions, answers, and facial expressions, incorporating both verbal and nonverbal cues. This should include strengths, weaknesses, and any areas of concern. Provide constructive feedback and recommendations for improvement. WRITE it in the way that you are talking directly to the candidate. it should be in html format and use style attribute. make it a list, use ul and li tags, give them colors (proper shades not solid color values, according to gray background) according to their type (is it a recommendation, or feedback or warning or appreciation or something else).",
    "currentAnalysis": "Analysis of the latest question, its answer, and its corresponding facial expression results. it should be in html format and use style attribute. make it a list, use ul and li tags, give them colors (proper shades not solid color values, according to gray background) according to their type (is it a recommendation, or feedback or warning or appreciation or something else). keep it short and to the point.].",
    "generated_question": "[Conversational question that naturally progresses the interview while implicitly addressing assessment needs, is concise (15-20 words max) while remaining meaningful.]",
    "question_category": "[Category of the question you generated.]",
    "hypothetical_response": "[A realistic example of how the candidate might answer the new question, considering their communication style, level of experience, and emotional cues.]",
    "score": "[scores of the latest question assessment. out of 10]",
    "overallScore": "[The updated overall score of the candidate's whole interview. out of 100]",
    "weknesses": "[user weaknesses. keep it short]",
    "completed": "['true'/'false'] when you have asked 11-12 questions, it should be true, otherwise false."
  }
  \`\`\`

  Ensure that the output is valid JSON. The values for each key ("aiSummary", "currentAnalysis", "generated_question", "hypothetical_response", "score", "completed") must be strings. Avoid including any introductory or concluding text outside of the JSON object.
  `;
  console.log("interview prompt: " + prompt);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const content = result.response.candidates[0].content.parts[0].text;
  const jsonString = content.match(/```json\n([\s\S]*?)\n```/)[1];
  const parsedResult = JSON.parse(jsonString);
  return parsedResult;
};
const GetInterviewInfoAI = async (profile, jobOrMock, job, interviewData, previousInterviews) => {
  const jobInfo = `
### Job-Based Interview Context:
- Role Title: ${job?.title}
- Company Type: ${job?.company?.name}
- Industry: ${job?.industry}
- Required Experience: ${job?.experience}
- Job Description Summary: ${job?.description}
  `;

  const mockInfo = `
### General Mock Interview Context:
- Simulated Role: ${interviewData?.position}
- Target Company Type: ${interviewData?.company}
- Focus Area: ${interviewData?.focusArea}
- Interview Intensity: ${interviewData?.intensity}
- Candidate Experience: ${interviewData?.experience} years
- Feedback Style Preference: ${interviewData?.feedbackStyle}
  `;
  //   const PreviousSummaries = `
  //  ${previousInterviews.lenght > 0 && previousInterviews.map((item, index) => `${index + 1}. ${item.weknesses}`)}
  //  `;

  const prompt = `
You are an AI interview assistant responsible for generating a detailed, high-signal summary of an upcoming interview session.

Your output will be passed to another AI system that generates interview questions, so the description must include clear context, focus areas, skill level, and goals of the session.

Use the following structured data to write a **1-paragraph, signal-rich summary** that clearly describes:

- The type and purpose of the interview  
- The role or simulation target  
- Key skills or behavior to assess  
- Expected challenge level (intensity)  
- Relevant industry or company context (if job-based)

---
## 🔹 User Profile:
- Skills: ${profile?.hardSkills}
- Soft Skills: ${profile?.softSkills}
- Work Experience: ${profile?.jobs}
- Career Goal: ${profile?.careerGoal}
- Industry Interest: ${profile?.industryInterest}

---
## 🔹 Interview Mode:
- Selected Mode: ${jobOrMock.toUpperCase()} // "JOB" or "MOCK"

${jobOrMock === "job" ? jobInfo : mockInfo}

\n
---
📌 Format your output as a single professional paragraph (not a list).
Avoid vague phrases like “various questions” — be specific.
DO NOT ask the user any questions. Do not use filler words.
Generate summary if input is right and recognizable.
Keep it direct, structured, and factual. Maximum ~150 words.

---
⚠️ IMPORTANT RULE:
If Job Title or Interview Position of the inputs contain:
- Random letters (e.g., "asdf", "qwerty", "xxxx"),
- Incomplete or nonsense data (e.g., “1234”, “!@#”, “random nonsense”),
- Invalid roles (e.g., "mango hunter", "banana king"), 
- Fake/illogical companies (e.g., "madeupcompany.xyz", "superfakecorp") 
- Or any clearly irrelevant or fake data that doesn’t belong in a professional context...
You must **ONLY respond with:**
👉 'WRONG' (uppercase, no punctuation).
DO NOT generate any summaries, even partial ones. If the data is recognizable, generate a professional interview summary with relevant context, skills, and goals. If it’s questionable or doesn’t fit into a recognizable job role or mock interview setup, **you have to reject it outright** and return 'WRONG' only.
--- 

Format your output as a clear, concise, professional summary in **one paragraph**. Make sure all the data provided in the summary fits logically and contextually into an interview preparation scenario.
  `;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
  const result = await model.generateContent(prompt);
  const content = result.response.candidates[0].content.parts[0].text;
  console.log("Generated info summary:", content);
  return content;
};

module.exports = { ContinueInterviewAI, GetInterviewInfoAI };
