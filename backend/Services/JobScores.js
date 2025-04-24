const { GoogleGenerativeAI } = require("@google/generative-ai");
const CalculateRelevancyScores = async (jobs, profileSummary) => {
    const prompt = `
    You are a career coach AI. Based on the candidate's profile summary and the job description, rate how relevant each job is from 0 to 100.
    
    Profile Summary: ${profileSummary}
    
    All Jobs with their descriptions:
    ${jobs.map((job, idx) => 
      `Job #${idx + 1}:\nID: ${job._id.toString()}\nDescription: ${job.description}`
    ).join('\n\n')}
    
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
module.exports = { CalculateRelevancyScores };
