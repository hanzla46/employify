const axios = require("axios");
const Profile = require("../models/ProfileModel");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (e.g., process.env.GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

const generateColdMessage = async (req, res) => {
  const userId = req.user._id; // Assuming req.user is populated by middleware
  const purpose = req.query.purpose || "networking"; // Default purpose
  const userPersona = req.query.persona || "professional, enthusiastic"; // Optional: how the user wants to sound

  try {
    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) return res.status(404).json({ message: "User profile not found." });

    // Ensure userProfile has necessary details for message generation
    const userSummary = userProfile.profileSummary || "a driven professional looking to connect.";
    const userCareerGoal = userProfile.careerGoal || "expand my professional network and learn from industry leaders.";
    const userSkills =
      userProfile.hardSkills.map((s) => s.name).join(", ") +
      (userProfile.softSkills.length ? ", " : "") +
      userProfile.softSkills.map((s) => s.name).join(", ");
    const userLinkedIn = userProfile.linkedin || "your LinkedIn profile"; // Fallback

    const linkedInUsername = req.query.username;
    if (!linkedInUsername) {
      return res.status(400).json({ message: "LinkedIn username is required." });
    }
    const linkedInUrl = `https://linkedin.com/in/${linkedInUsername}`;
    const rapidApiKey = process.env.RAPIDAPI_KEYS?.split(",")[1] || "";

    if (!rapidApiKey) {
      return res.status(500).json({ message: "RapidAPI key not configured." });
    }

    const options = {
      method: "GET",
      url: "https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile",
      params: {
        linkedin_url: linkedInUrl,
        include_skills: "true",
      },
      headers: {
        "x-rapidapi-host": "fresh-linkedin-profile-data.p.rapidapi.com",
        "x-rapidapi-key": rapidApiKey,
      },
    };

    let data;
    try {
      const resp = await axios.request(options);
      data = resp.data.data;
    } catch (apiError) {
      console.error("RapidAPI Error:", apiError.message);
      if (apiError.response) {
        console.error("RapidAPI Response Data:", apiError.response.data);
      }
      return res.status(apiError.response?.status || 500).json({
        message: "Failed to fetch target LinkedIn profile data.",
        error: apiError.message,
      });
    }

    const targetProfile = {};
    targetProfile.profileName = data.full_name || "a professional";
    targetProfile.about = data.about || "no 'about' section available.";
    targetProfile.last3Experience = (data.experiences || []).slice(0, 3).map((exp) => ({
      title: exp.title || "N/A",
      company: exp.company || "N/A",
      dateRange: exp.date_range || "N/A",
      location: exp.location || "N/A",
    }));
    targetProfile.last3Education = (data.educations || []).slice(0, 3).map((edu) => ({
      school: edu.school || "N/A",
      degree: edu.degree || "N/A",
      fieldOfStudy: edu.field_of_study || "N/A",
      dateRange: edu.date_range || "N/A",
    }));
    targetProfile.skills = (data.skills || "")
      .split("|")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");
    targetProfile.connectionCount = data.connection_count || 0;
    targetProfile.headline = data.headline || "a professional in their field.";

    // Prepare data for Gemini prompt
    const targetExperienceSummary =
      targetProfile.last3Experience.map((exp) => `${exp.title} at ${exp.company} (${exp.dateRange})`).join("; ") ||
      "no recent work experience listed.";

    const targetEducationSummary =
      targetProfile.last3Education.map((edu) => `${edu.degree} from ${edu.school} (${edu.dateRange})`).join("; ") ||
      "no recent education listed.";

    const targetSkillsList =
      targetProfile.skills.length > 0 ? targetProfile.skills.join(", ") : "no specific skills listed.";

    // Construct the prompt for Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an AI assistant designed to write personalized and natural cold messages for LinkedIn outreach.
Your goal is to help a user ("the sender") write a concise (max 150 words), engaging, and polite message to a target professional on LinkedIn.

Consider the following details:

Sender's Name: ${
      userProfile.fullName || userProfile.userId
    } (You can use "I" or "my" where appropriate, representing the sender)
Sender's Summary/About: "${userSummary}"
Sender's Career Goal: "${userCareerGoal}"
Sender's Key Skills: ${userSkills || "no specific skills provided"}
Sender's LinkedIn Profile: ${userLinkedIn}
Sender's Persona/Tone: ${userPersona}

Target Professional's Name: ${targetProfile.profileName}
Target Professional's About: "${targetProfile.about}"
Target Professional's Headline: "${targetProfile.headline}"
Target Professional's Recent Experience: ${targetExperienceSummary}
Target Professional's Recent Education: ${targetEducationSummary}
Target Professional's Skills: ${targetSkillsList}

Purpose of the message: ${purpose}

Based on the above, draft a cold message. Focus on:
1.  A polite and personalized opening, referencing something specific from the target's profile (e.g., a recent job, a skill, or their "about" section).
2.  Briefly introduce the sender and the common ground or reason for connection.
3.  Clearly state the purpose of the message (${purpose}).
4.  Include a clear call to action if applicable (e.g., "I'd love to connect," "would you be open to a brief chat?").
5.  Keep it concise and easy to read.

Avoid generic intros. Make it sound genuinely interested in the target's work or background.
Do NOT include "[Your Name]" or any placeholder for the sender's name; use the sender's actual name or imply "I" where needed.
The message should be suitable for a LinkedIn connection request or an initial direct message.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const coldMessage = response.text();

    res.status(200).json({ message: "Cold message generated successfully.", coldMessage });
  } catch (error) {
    console.error("Error generating cold message:", error);
    if (error.response && error.response.data && error.response.data.error) {
      // More specific error from Gemini API
      return res.status(500).json({
        message: "Failed to generate cold message with Gemini API.",
        error: error.response.data.error.message || error.message,
      });
    }
    res.status(500).json({ message: "An unexpected error occurred.", error: error.message });
  }
};

module.exports = {
  generateColdMessage,
  // ... other controller functions if any
};
