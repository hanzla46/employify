import "regenerator-runtime/runtime";
import { useEffect, useRef } from "react";
import axios from "axios";
import { Bot, Video, Mic, Send } from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import FancyButton from "../components/Button";
let dev_env = false;
const url = dev_env
  ? "http://localhost:8000"
  : "https://employify-backend.vercel.app";
export function Interview() {
  const startInterview = async () => {
    try {
      const response = await axios.get(url + "/interview/start", {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setQuestion(response.data.question);
      } else {
        console.error("Failed to start interview");
      }
    } catch (error) {
      console.error("Failed to start interview:", error.message);
    }
  };
  const [isRecording, setIsRecording] = useState(false);
  const [question, setQuestion] = useState(
    "What is Virtual DOM and how does it work in React?"
  );
  const [written, setWritten] = useState("");
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const sendResponse = async () => {
    if (!transcript && !written) return;
    SpeechRecognition.stopListening();
    setIsRecording(false);
    stopRecording();
    let file;
    if (videoURL) {
      try {
        const videoResponse = await fetch(videoURL);
        const blob = await videoResponse.blob();
        file = new File([blob], "recorded-video.webm", { type: "video/webm" });
      } catch (error) {
        console.error("Error fetching video:", error);
      }
    }
    const formData = new FormData();
    formData.append("question", question);
    formData.append("recorded", transcript);
    formData.append("written", written);
    formData.append("video", file);
    setVideoURL(null);
    try {
      const response = await axios.post(url + "/interview/continue", formData, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
        },
      });
      if (response.data.success) {
        setQuestion(response.data.question);
        setScore(response.data.score);
        resetTranscript();
        setWritten("");
        setIsRecording(true);
        SpeechRecognition.startListening({ continuous: true });
        startRecording();
        if (response.data.completion) {
          setIsCompleted(true);
          return;
        }
      } else {
        console.error("Failed to continue interview");
      }
    } catch (error) {
      console.log("error" + error);
    }
  };

  //audio
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const Record = async () => {
    if (isRecording) {
      await SpeechRecognition.stopListening();
      setIsRecording(false);
      return;
    }
    if (!isRecording) {
      SpeechRecognition.startListening({ continuous: true });
      setIsRecording(true);
    }
  };
  if (!browserSupportsSpeechRecognition) {
    return <p>no access</p>;
  }

  //video recording
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [videoRecording, setVideoRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const handleVideoRecord = () => {
    if (videoRecording) {
      stopRecording();
    }
    if (!videoRecording) {
      startRecording();
    }
  };
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const mediaRecorder = new MediaRecorder(stream);
      let chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setVideoURL(URL.createObjectURL(blob));
        chunks = [];
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setVideoRecording(true);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setVideoRecording(false);
  };

  //text area
  const textareaRef = useRef(null);
  const adjustHeight = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  //everything starts from here
  const start = () => {
    setIsStarted(true);
    startInterview();
  };
  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">
            AI Mock Interview
          </h1>
          <ProtectedRoute>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <div className="flex flex-row justify-between items-center mb-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold dark:text-white">
                      Interview Assistant
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Ready to help you practice
                    </p>
                  </div>
                </div>
                <div onClick={start} id="startBtn">
                  {!isStarted && (
                    <div onClick={start}>
                      <FancyButton text="Start Interview" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mr-6">
                  <button
                    disabled={!isStarted || isCompleted}
                    aria-label="Toggle microphone"
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                    onClick={Record}
                  >
                    <Mic className="h-6 w-6" />
                  </button>
                  <button
                    disabled={!isStarted || isCompleted}
                    aria-label="Toggle video"
                    onClick={handleVideoRecord}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <Video className="h-6 w-6" />
                  </button>
                  <div className="buttons">
                    <button
                      disabled={!isStarted || isCompleted}
                      onClick={sendResponse}
                      aria-label="Send message"
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500"
                    >
                      <Send className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
              {/* question  + score*/}
              <div className="mt-6 mb-6 flex flex-row justify-evenly items-center">
                <div className="w-1/2">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-4 max-w-[80%]">
                    <p className="text-gray-800 dark:text-gray-200">
                      {question}
                    </p>
                  </div>
                </div>
                <div className="w-1/2">
                  <span className="text-xl text-gray-700 dark:text-white">
                    {score}
                  </span>
                </div>
              </div>
              {/* responses */}
              {!isCompleted ? (
                <div className="flex gap-4 mb-6 h-auto">
                  <div className="flex flex-col w-1/2">
                    {" "}
                    <h3 className="text-gray-700 dark:text-white mb-3">
                      Write (if needed)
                    </h3>{" "}
                    <textarea
                      ref={textareaRef}
                      onInput={adjustHeight}
                      onChange={(e) => setWritten(e.target.value)}
                      value={written}
                      placeholder="Type something..."
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      style={{ resize: "none", overflow: "hidden" }}
                    />
                  </div>
                  <div className="flex flex-col w-1/2">
                    {" "}
                    <h3 className="text-gray-700 dark:text-white mb-3">
                      Recorded Response
                    </h3>{" "}
                    <div className="h-auto w-full border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                      {" "}
                      <div
                        className="p-2 text-gray-900 dark:text-white"
                        style={{
                          minHeight: "40px",
                          height: "auto",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {transcript}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <h1 className="text-3xl text-gray-700 dark:text-white justify-center m-10">
                  Interview Completed
                </h1>
              )}
            </div>
          </ProtectedRoute>
        </div>
      </div>
    </div>
  );
}
