const evaluationPrompt = (
  profile,
  questions,
  evaluationForm,
  hardSkillResponse1,
  hardSkillResponse2
) => {
  return `
Analyze the user's profile based on the following summarized data:

Profile Overview:
- Top Hard Skill: ${profile.hardSkills[0]?.name} (${profile.hardSkills[0]?.experience})
- Top Soft Skill: ${profile.softSkills[0]?.name} (${profile.softSkills[0]?.proficiency})
- Latest Job: ${profile.jobs[0]?.title} at ${profile.jobs[0]?.company}
- Recent Project: ${profile.projects[0]?.name}
- Career Goal: ${profile.careerGoal}

Evaluation Tasks:
- Hard Skills Task 1: ${questions.hardSkillsTask1}
  - Evaluation: ${hardSkillResponse1}
- Hard Skills Task 2: ${questions.hardSkillsTask2}
  - Evaluation: ${hardSkillResponse2}
- Soft Skills Question 1: ${questions.softSkillsQuestion1}
  - Response: ${evaluationForm.softSkillsResponse1}
- Soft Skills Question 2: ${questions.softSkillsQuestion2}
  - Response: ${evaluationForm.softSkillsResponse2}
- Project Link: ${evaluationForm.projectLink}
- Project Contribution: ${evaluationForm.projectContribution}
- Project Improvement Suggestion: ${evaluationForm.projectImprovement}
- Job Experience Summary: ${evaluationForm.jobExperience}

Instructions:
- Provide a summary of the user's profile.
- Provide an evaluation based on tasks, project, and job experience.
- Do NOT use bullet points, special characters, or markdown in the main response.
- Response MUST be in **strict JSON format** with two keys: "summary" and "evaluation".

Expected Output Format:
\`\`\`json
{
  "summary": "Brief profile summary here.",
  "evaluation": "Detailed evaluation here."
}
\`\`\`
`;
};
const questionsPrompt = (hardSkills,softSkills, jobs, projects, careerGoal) => {
  return `Generate questions for evaluating a profile with the following data: Hard Skills: ${hardSkills}, Soft Skills: ${softSkills}, Jobs: ${jobs}, Projects: ${projects}, Career Goal: ${careerGoal}. it should be difficult according to user's profile. Give questions that require actual human creativity. And skills you will test should have actual value in current job market. Response should be in JSON format: 
        \`\`\`json
        {
        hardSkillsTask1(give a task that can be completed in 1-2 hours, ask for a file),
        hardSkillsTask2(give a task that can be completed in 1-2 hours, ask for a file),
        softSkillsQuestion2(a tricky question),
        softSkillsQuestion2(a tricky question),
        projectLink(ask for link of a project),
        projectContribution,
        projectImprovement(ask about something user has improved in the project using their hard skills), 
        jobExperience(ask anything related to job experience)
       }
        \`\`\`
        `;
};
module.exports = { evaluationPrompt,questionsPrompt };
