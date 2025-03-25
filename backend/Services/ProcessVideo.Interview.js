const { GoogleGenerativeAI } = require("@google/generative-ai");

const ProcessVideo = async (videoFile, QId, userId) => {
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyCWeJAjae2FE25b1AcKHBm4-vRFiC-g5pc");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });

    // Simplified: No need for async here, we have the buffer
    function fileToGenerativePart(videoFile) {
      const base64EncodedData = videoFile.toString('base64');
      return {
        inlineData: {
          data: base64EncodedData,
          mimeType: 'video/webm', //  Or the correct MIME type
        },
      };
    }

    const videoPart = fileToGenerativePart(videoFile);
    const prompt = `Analyze this video and provide insights. length, objects, actions, etc.`;

    const result = await model.generateContent([prompt, videoPart]);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini Response:", text);
    return text; // Return the text for potential later use

  } catch (error) {
    console.error("Error processing video with Gemini:", error);
    // DO NOT re-throw here.  We want the main interview flow to continue.
  }
};

module.exports = { ProcessVideo };