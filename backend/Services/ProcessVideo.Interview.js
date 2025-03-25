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
    const prompt = `Analyze this video and provide insights on person's facial expressions and emotions. remebeber that the person is giving an interview. your output should be: top 3 emotions with intensity from 0 to 1 and a one sentence summary of the person's movement. response should be in json and like this: array of objects of emotion and intensity and then string of summary. if you find no person, you can give random output of emotions and summary.`;

    const result = await model.generateContent([prompt, videoPart]);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.match(/```json\n([\s\S]*?)\n```/)[1];
    const parsedResult = JSON.parse(jsonString);
    console.log("Gemini Response:", text);
    console.log("Parsed Result:", parsedResult);
  } catch (error) {
    console.error("Error processing video with Gemini:", error);
    // DO NOT re-throw here.  We want the main interview flow to continue.
  }
};

module.exports = { ProcessVideo };