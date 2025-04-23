import "regenerator-runtime/runtime";
import Webcam from "react-webcam";
import { useRef, useState, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import axios from "axios";
import {
  Bot,
  Video,
  Mic,
  Send,
  CheckCircle,
  PauseCircle,
  Info,
  Sparkles,
  AlertCircle,
  BarChart,
} from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import ProtectedRoute from "../Context/ProtectedRoute";
import { handleSuccess, handleError } from "../utils";
import DialogForm from "../components/Interview/DialogForm";
import { Spinner } from "../lib/Spinner";

const url = import.meta.env.VITE_API_URL;
console.log("API URL:", url);

export function Interview() {
  useEffect(() => {
      document.title = "Interview | Employify AI";
    }, []);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [written, setWritten] = useState("");
  const [score, setScore] = useState();
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [summary, setSummary] = useState("");
  const [interviewData, setInterviewData] = useState({
    position: "",
    company: "",
    industry: "",
    experience: "",
  });
  const [infoBox, setInfoBox] = useState(true);
  const [loading, setLoading] = useState(false);
  const {
    status,
    startRecording: startVideoRecording,
    stopRecording: stopVideoRecording,
    mediaBlobUrl,
    previewStream,
    clearBlobUrl,
  } = useReactMediaRecorder({ video: true });
  // question audio
  useEffect(() => {
    if (!question) return;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(question);
    let voices = window.speechSynthesis.getVoices();
    utterance.voice = voices[2];
    utterance.pitch = 1.4;
    utterance.rate = 1.4;
    synth.cancel();
    synth.speak(utterance);
  }, [question]);
  //video blob
  useEffect(() => {
    const handleBlob = async () => {
      if (mediaBlobUrl) {
        const blob = await fetch(mediaBlobUrl).then((res) => res.blob());
        if (blob && blob.type.startsWith("video/")) {
          setRecordedBlob(blob);
        } else {
          handleError("Invalid video blob: " + blob.type);
        }
      }
    };
    handleBlob();
  }, [mediaBlobUrl]);
  const startInterview = async () => {
    try {
      const response = await axios.post(
        url + "/interview/start",
        { interviewData }, // Send interviewData correctly
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json", // Correct for startInterview
          },
        }
      );
      if (response.data.success) {
        setQuestion(response.data.question);
        setCategory(response.data.category);
        handleSuccess("Interview started successfully!");
        setIsStarted(true);
        startVideoRecording();
        setIsVideoRecording(true);
        SpeechRecognition.startListening({ continuous: true });
        setIsAudioRecording(true);
        setInfoBox(false);
        const section = document.getElementById("top");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        handleError("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Failed to start interview:", error.message);
      //  Handle errors from axios more specifically
      if (error.response) {
        handleError(
          `Server Error (${error.response.status}): ${error.response.data.message}`
        );
      } else if (error.request) {
        handleError("No response received from server.");
      } else {
        handleError("Error setting up request: " + error.message);
      }
    }
  };

  const sendResponse = async () => {
    if (!transcript && !written) {
      handleError("Response can't be empty");
      return;
    }
    setLoading(true);
    SpeechRecognition.stopListening();
    setIsAudioRecording(false);
    setIsVideoRecording(false);
    await stopVideoRecording();
    const formData = new FormData();
    if (recordedBlob) {
      formData.append("video", recordedBlob, "recording.webm");
    }
    formData.append("question", question);
    formData.append("category", category);
    formData.append("answer", transcript);
    formData.append("written", written);
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    try {
      const response = await axios.post(url + "/interview/continue", formData, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
        },
      });
      if (response.data.success) {
        setQuestion(response.data.question);
        setCategory(response.data.category);
        setScore(response.data.score);
        setSummary(response.data.aiSummary);
        resetTranscript();
        setWritten("");
        clearBlobUrl();
        setRecordedBlob(null);
        setIsAudioRecording(true);
        SpeechRecognition.startListening({ continuous: true });
        startVideoRecording();
        setIsVideoRecording(true);
        if (
          response.data.completed == true ||
          response.data.completed == "true"
        ) {
          setIsCompleted(true);
          setIsStarted(false);
          return;
        }
      } else {
        console.error("Failed to continue interview:", response.data.message);
        handleError("Failed to continue interview: " + response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error sending response:", error);
      setLoading(false);
      if (error.response) {
        handleError(
          `Server Error (${error.response.status}): ${error.response.data.message}`
        );
      } else if (error.request) {
        handleError("No response received from server.");
      } else {
        handleError("Error setting up request: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  //audio
  const RecordAudio = async () => {
    if (isAudioRecording) {
      await SpeechRecognition.stopListening();
      setIsAudioRecording(false);
      return;
    }
    if (!isAudioRecording) {
      SpeechRecognition.startListening({ continuous: true });
      setIsAudioRecording(true);
    }
  };
  if (!browserSupportsSpeechRecognition) {
    return <p>no access</p>;
  }

  //video recording
  const handleVideoRecord = () => {
    if (isVideoRecording) {
      stopVideoRecording();
      setIsVideoRecording(false);
    }
    if (!isVideoRecording) {
      startVideoRecording();
      setIsVideoRecording(true);
    }
  };

  //everything starts from here
  const start = () => {
    startInterview();
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white dark:from-gray-800 dark:via-indigo-950/30 dark:to-gray-700">
      <div className="container mx-auto px-4 py-10 pb-2">
        <div className="w-full max-w-full mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3 mt-6">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary-700)] to-purple-400 bg-clip-text text-transparent">
                  AI Mock Interview
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Perfect your interview skills with AI feedback
                </p>
              </div>
            </div>

            {isStarted && (
              <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    isAudioRecording
                      ? "bg-green-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                ></div>
                {isAudioRecording || isVideoRecording ? "Recording" : "Paused"}
              </div>
            )}
          </div>

          <ProtectedRoute>
            <div
              id="top"
              className="relative rounded-3xl overflow-hidden backdrop-blur-sm border p-0 border-white/20 dark:border-gray-800 shadow-2xl bg-white/80 dark:bg-gray-900/80"
            >
              <InterviewHeader
                isStarted={isStarted}
                isCompleted={isCompleted}
                RecordAudio={RecordAudio}
                videoRecording={isVideoRecording}
                isAudioRecording={isAudioRecording}
                handleVideoRecord={handleVideoRecord}
                sendResponse={sendResponse}
                loading={loading}
              />

              {infoBox && (
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InstructionsCard
                      title="Interview Best Practices"
                      icon={<BarChart className="h-5 w-5 text-indigo-500" />}
                      items={[
                        "Be Professional & Confident",
                        "Understand the Role",
                        "Use the STAR Method",
                        "Demonstrate Problem-Solving",
                        "Manage Your Time",
                      ]}
                    />

                    <div className="col-span-1 bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950/30 rounded-2xl shadow-lg border border-indigo-100 dark:border-indigo-900/50 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-600 to-[var(--color-primary-400)] p-4">
                        <h3 className="text-xl font-semibold text-white text-center">
                          Interview Setup
                        </h3>
                      </div>
                      <div className="p-6">
                        <DialogForm
                          start={start}
                          setInterviewData={setInterviewData}
                          interviewData={interviewData}
                        />
                      </div>
                    </div>

                    <InstructionsCard
                      title="Prepare for Common Questions"
                      icon={<AlertCircle className="h-5 w-5 text-indigo-500" />}
                      items={[
                        "Your background & experience",
                        "Strengths & weaknesses",
                        "Conflict resolution",
                        "Leadership & teamwork",
                        "Career goals & aspirations",
                      ]}
                    />
                  </div>
                </div>
              )}

              {isStarted && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6">
                  <div className="md:col-span-5">
                    <QuestionAndScore
                      question={question}
                      score={score}
                      summary={summary}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <ResponsesComponent
                      written={written}
                      setWritten={setWritten}
                      transcript={transcript}
                      resetTranscript={resetTranscript}
                    />
                  </div>
                  <div className="md:col-span-3 md:float-left">
                    <VideoComponent
                      stream={previewStream}
                      isVideoRecording={isVideoRecording}
                    />
                  </div>
                </div>
              )}

              {isCompleted && (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Interview Completed
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-center max-w-md text-lg">
                    Congratulations! You've successfully completed your mock
                    interview. Review your performance and feedback: {summary}
                  </p>
                  <button
                    onClick={() => {
                      setIsCompleted(false);
                      setInfoBox(true);
                    }}
                    className="mt-8 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Start New Interview
                  </button>
                </div>
              )}
            </div>
          </ProtectedRoute>
        </div>
      </div>
    </div>
  );
}

function InterviewHeader({
  isStarted,
  isCompleted,
  handleVideoRecord,
  RecordAudio,
  sendResponse,
  isAudioRecording,
  videoRecording,
  loading,
}) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-[var(--color-primary-400)] p-3">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-10 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-white">
              Interview Assistant
            </h2>
            <p className="text-indigo-100">
              AI-powered practice for your next big opportunity
            </p>
          </div>
        </div>

        {isStarted && !isCompleted && (
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <button
              disabled={loading}
              aria-label="Toggle microphone"
              className={`p-3 rounded-full transition-all duration-300 shadow-md disabled:opacity-50 ${
                isAudioRecording
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
              onClick={RecordAudio}
            >
              <Mic className="h-5 w-5" />
            </button>

            <button
              disabled={loading}
              aria-label="Toggle video"
              onClick={handleVideoRecord}
              className={`p-3 rounded-full transition-all duration-300 shadow-md disabled:opacity-50 ${
                videoRecording
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              <Video className="h-5 w-5" />
            </button>

            {loading ? (
              <Spinner />
            ) : (
              <button
                onClick={sendResponse}
                aria-label="Send message"
                className="p-3 bg-white text-indigo-600 rounded-full hover:bg-indigo-50 transition-all duration-300 shadow-md"
              >
                <Send className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InstructionsCard({ title, items, icon }) {
  return (
    <div className="col-span-1 bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950/30 rounded-2xl shadow-lg border border-indigo-100 dark:border-indigo-900/50 overflow-hidden">
      <div className="bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 p-4">
        <div className="flex items-center justify-center">
          {icon}
          <h3 className="text-xl font-semibold text-white ml-2">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-indigo-500 mr-3"></div>
              <span className="text-gray-700 dark:text-gray-200">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function QuestionAndScore({ question, score, summary }) {
  const scoreValue = score ? parseInt(score) : 0;

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score) => {
    if (score >= 8) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 6) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-indigo-100 dark:border-indigo-900/50 max-h-min min-h-96">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <h3 className="text-lg font-medium text-white flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Current Question
        </h3>
      </div>

      <div className="p-5 flex-grow bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-800 dark:to-indigo-950/10">
        <p className="text-gray-800 dark:text-gray-200 text-lg font-medium">
          {question ? question : "Your interview question will appear here"}
        </p>
      </div>

      {score && (
        <div className="p-4 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between bg-white dark:bg-gray-800">
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            Response Score
          </span>
          <div
            className={`flex items-center justify-center h-10 w-10 rounded-full ${getScoreBg(
              scoreValue
            )}`}
          >
            <span className={`text-xl font-bold ${getScoreColor(scoreValue)}`}>
              {score}
            </span>
          </div>
        </div>
      )}

      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 border-t border-indigo-100 dark:border-indigo-900/50">
        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-3 flex items-center">
          <Info className="h-4 w-4 mr-2" />
          AI Feedback
        </h4>
        <div dangerouslySetInnerHTML={{ __html: summary }} />
      </div>
    </div>
  );
}

function VideoComponent({ stream, isVideoRecording }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <div className="h-96 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-indigo-100 dark:border-indigo-900/50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-white flex items-center">
          <Video className="h-5 w-5 mr-2" />
          Your Camera
        </h3>
        {isVideoRecording && (
          <div className="flex items-center px-3 py-1 bg-black/30 rounded-full">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
            <span className="text-xs text-white">Recording</span>
          </div>
        )}
      </div>

      <div className="relative flex-grow bg-gray-900 flex items-center justify-center">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform -scale-x-100"
            mirrored={true}
          />
        ) : (
          ""
        )}
        {!isVideoRecording && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="p-6 bg-black/60 rounded-full">
              <PauseCircle className="h-16 w-16 text-white/90" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-center border-t border-indigo-100 dark:border-indigo-900/50">
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
          <Info className="h-4 w-4 mr-2 text-indigo-500" />
          Make sure you're well lit and centered in frame
        </p>
      </div>
    </div>
  );
}

function ResponsesComponent({
  written,
  setWritten,
  transcript,
  resetTranscript,
}) {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [written]);

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-indigo-100 dark:border-indigo-900/50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <h3 className="text-lg font-medium text-white flex items-center">
          <Mic className="h-5 w-5 mr-2" />
          Your Response
        </h3>
      </div>

      <div className="p-5 flex-grow flex flex-col gap-1 bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-800 dark:to-indigo-950/10">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-3 flex items-center">
            <Mic className="h-4 w-4 mr-2" />
            Recorded Speech
          </h4>
          <div className="min-h-24 max-h-max p-4 border border-indigo-100 dark:border-indigo-900/50 rounded-xl bg-white dark:bg-gray-800 shadow-inner">
            <p
              className="text-gray-800 dark:text-gray-200"
              style={{ wordBreak: "break-word" }}
            >
              {transcript ||
                "Your spoken words will appear here as you speak..."}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center mt-0 mb-1">
          <button
            className="w-[50%] text-center rounded-xl bg-[var(--color-primary-500)]"
            onClick={() => resetTranscript()}
          >
            Reset
          </button>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-400 flex items-center">
              <Send className="h-4 w-4 mr-2" />
              Written Response (Optional)
            </h4>
          </div>
          <textarea
            ref={textareaRef}
            onInput={adjustHeight}
            onChange={(e) => setWritten(e.target.value)}
            value={written}
            placeholder="Type your response here if needed..."
            className="w-full min-h-24 p-4 border border-indigo-100 dark:border-indigo-900/50 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-inner"
            style={{ resize: "none", overflowY: "hidden" }}
          />
        </div>
      </div>

      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-center border-t border-indigo-100 dark:border-indigo-900/50">
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
          <Info className="h-4 w-4 mr-2 text-indigo-500" />
          Click the send button when you're ready to submit your answer
        </p>
      </div>
    </div>
  );
}
