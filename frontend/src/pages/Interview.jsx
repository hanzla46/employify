import "regenerator-runtime/runtime";
import { useRef, useState, useEffect, useContext } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import axios from "axios";
import {
  X,
  Trash2,
  CheckCircle2,
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
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import ProtectedRoute from "../Context/ProtectedRoute";
import { JobsContext } from "../Context/JobsContext";
import { handleSuccess, handleError } from "../utils";
import DialogForm from "../components/Interview/DialogForm";
import { Spinner } from "../lib/Spinner";
import { Link, useSearchParams } from "react-router-dom";
import FancyButton from "../components/Button";
import { AuthContext } from "../Context/AuthContext";
import { SkillsContext } from "../Context/SkillsContext";
const url = import.meta.env.VITE_API_URL;

export function Interview() {
  useEffect(() => {
    document.title = "Interview | Employify AI";
  }, []);
  const [jobOrMock, setJobOrMock] = useState("mock");
  const { jobs } = useContext(JobsContext);
  const { user } = useContext(AuthContext);
  const { hasProfile } = useContext(SkillsContext);
  const [jobId, setJobId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [job, setJob] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setJobId(searchParams.get("jobId") || "");
  }, [searchParams]);

  useEffect(() => {
    setSessionId(searchParams.get("sessionId") || "");
  }, []);

  useEffect(() => {
    setInterviewData((prev) => ({ ...prev, position: searchParams.get("position") || "" }));
  }, [searchParams]);

  useEffect(() => {
    if (!user || !sessionId) return;
    const checkInterviewSession = async () => {
      try {
        const res = await axios.get(url + `/interview/check-session?sessionId=${sessionId}`);
        if (res.data.success) {
          setQuestion(res.data.question);
          setCategory(res.data.category);
          setQuestionCount(res.data.questionsLength);
          setScore(res.data.score);
          setIsStarted(true);
          setIsCompleted(false);
          setInfoBox(false);
        }
      } catch (error) {
        console.error("Failed to check interview session:", error);
        handleError("Failed to load previous interview session.");
      }
    };
    checkInterviewSession();
  }, [user, sessionId]);

  useEffect(() => {
    if (jobId) {
      const matchingJob = jobs.find((item) => item["id"] === jobId);
      if (matchingJob) {
        setJobOrMock("job");
        setJob(matchingJob);
      } else {
        setJob(null);
      }
    } else {
      setJob(null);
    }
  }, [jobId, jobs]);

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [isRecording, setIsRecording] = useState(false); // Unified recording state
  const [question, setQuestion] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [category, setCategory] = useState("");
  const [written, setWritten] = useState("");
  const [score, setScore] = useState();
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  // const [recordedBlob, setRecordedBlob] = useState(null); // No longer directly used
  const [summary, setSummary] = useState("");
  const [overallAnalysis, setOverallAnalysis] = useState("");
  const [interviewData, setInterviewData] = useState({
    position: "",
    company: "",
    experience: "",
    focusArea: "",
    intensity: "",
    feedbackStyle: "",
  });
  const [infoBox, setInfoBox] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState(null);

  const {
    status, // Keep status if needed for debugging or more complex UI
    startRecording: startVideoRecording,
    stopRecording: stopVideoRecording,
    mediaBlobUrl,
    previewStream,
    clearBlobUrl,
  } = useReactMediaRecorder({ video: true, audio: true });

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

  // key event
  const textareaRef = useRef(null);
  useEffect(() => {
    if (!isStarted) return;
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        if (document.activeElement === textareaRef.current) {
          return;
        }
        if (loading) return;
        sendResponse();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isStarted, loading, transcript, written, question, category, sessionId]); // Added relevant dependencies for sendResponse

  const startInterview = async () => {
    try {
      setLoading(true); // Start loading when interview setup is confirmed
      const response = await axios.post(
        url + "/interview/start",
        { interviewData, jobOrMock, job },
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setSessionId(response.data.interviewId);
        setSearchParams({ sessionId: response.data.interviewId });
        setQuestionCount(1);
        setQuestion(response.data.question);
        setCategory(response.data.category);
        handleSuccess("Interview started successfully!");
        setIsStarted(true);
        // Start both audio and video recording
        SpeechRecognition.startListening({ continuous: true });
        startVideoRecording();
        setIsRecording(true); // Unified state
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
      if (error.response) {
        handleError(`Server Error (${error.response.status}): ${error.response.data.message}`);
      } else if (error.request) {
        handleError("No response received from server.");
      } else {
        handleError("Error setting up request: " + error.message);
      }
    } finally {
      setLoading(false); // End loading regardless of success/failure
    }
  };

  const sendResponse = async (isConfirmed) => {
    if (!transcript && !written) {
      handleError("Response can't be empty");
      return;
    }

    setLoading(true); // Start loading immediately

    // Step 1: Stop all current recordings
    SpeechRecognition.stopListening();
    setIsRecording(false); // Update unified state
    await stopVideoRecording(); // Await ensures the recording process is initiated to finalize the blob

    // Step 2: Wait for mediaBlobUrl to be generated by react-media-recorder
    let currentMediaBlobUrl = null;
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 100ms delay = 3 seconds max wait
    const delay = 100; // ms

    // Use a loop to poll `mediaBlobUrl` which gets updated asynchronously by useReactMediaRecorder
    while (!currentMediaBlobUrl && attempts < maxAttempts) {
      currentMediaBlobUrl = mediaBlobUrl; // Attempt to capture the latest value
      if (!currentMediaBlobUrl) {
        await new Promise((res) => setTimeout(res, delay)); // Wait a bit
        attempts++;
      }
    }

    let blob = null;
    if (currentMediaBlobUrl) {
      try {
        blob = await fetch(currentMediaBlobUrl).then((res) => res.blob());
        if (!blob || !blob.type.startsWith("video/")) {
          console.warn("Invalid video blob type received: " + (blob ? blob.type : "null"));
          // handleError("Invalid video blob format captured."); // Optionally show error to user
          blob = null; // Ensure blob is null if invalid
        }
      } catch (error) {
        console.error("Error fetching or validating blob from URL:", error);
        // handleError("Failed to process video recording."); // Optionally show error to user
        blob = null; // Ensure blob is null on error
      }
    } else {
      console.warn("MediaBlobUrl was not available after stopping recording and waiting. Proceeding without video.");
      // If video is strictly required, uncomment the handleError and return below:
      // handleError("Video recording failed. Please ensure camera/mic permissions.");
      // setLoading(false);
      // return;
    }

    // Step 3: If a blob was captured and confirmation is needed, show modal
    if (blob && isConfirmed !== true) {
      setRecordingUrl(currentMediaBlobUrl);
      setShowReviewModal(true);
      setLoading(false); // Release loading state while review modal is open
      return; // Stop here until user confirms
    }

    // Step 4: Prepare FormData
    const formData = new FormData();
    if (blob) {
      formData.append("video", blob, "recording.webm");
    }
    formData.append("question", question);
    formData.append("category", category);
    formData.append("answer", transcript);
    formData.append("written", written);
    formData.append("sessionId", sessionId);

    try {
      const response = await axios.post(url + "/interview/continue", formData, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          // Content-Type: 'multipart/form-data' is automatically set by the browser when using FormData
        },
      });

      if (response.data.success) {
        setQuestionCount(questionCount + 1);
        setQuestion(response.data.question);
        setCategory(response.data.category);
        setScore(response.data.score);
        setSummary(response.data.aiSummary);
        setOverallAnalysis(response.data.overallAnalysis);
        resetTranscript();
        setWritten("");
        clearBlobUrl(); // Clear the blob URL ONLY after successful submission

        if (response.data.completed === true || response.data.completed === "true") {
          setIsCompleted(true);
          setIsStarted(false);
          // Recordings are already stopped from the beginning of sendResponse
          // Explicitly ensure they are off for completed state if not already
          setIsRecording(false);
          SpeechRecognition.stopListening();
          return;
        }

        // Step 5: Start recordings for the next question
        SpeechRecognition.startListening({ continuous: true });
        startVideoRecording();
        setIsRecording(true); // Unified state
      } else {
        console.error("Failed to continue interview:", response.data.message);
        handleError("Failed to continue interview: " + response.data.message);
      }
    } catch (error) {
      console.error("Error sending response:", error);
      if (error.response) {
        handleError(`Server Error (${error.response.status}): ${error.response.data.message}`);
      } else if (error.request) {
        handleError("No response received from server.");
      } else {
        handleError("Error setting up request: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Unified toggle function for recording
  const toggleRecording = () => {
    if (isRecording) {
      // If currently recording, stop both
      SpeechRecognition.stopListening();
      stopVideoRecording();
      setIsRecording(false);
    } else {
      // If not recording, start both
      SpeechRecognition.startListening({ continuous: true });
      startVideoRecording();
      setIsRecording(true);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser does not support Speech Recognition. Please try Chrome for full functionality.</p>;
  }

  //everything starts from here
  const start = () => {
    startInterview();
  };
  return (
    <div className='min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white dark:from-gray-800 dark:via-indigo-950/30 dark:to-gray-700'>
      <RecordingReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        videoUrl={recordingUrl}
        transcript={transcript}
        written={written}
        onReRecord={() => {
          clearBlobUrl(); // Ensure old blob URL is cleared for a fresh recording
          resetTranscript();
          setWritten("");
          setShowReviewModal(false);
          // Restart both audio and video recording
          SpeechRecognition.startListening({ continuous: true });
          startVideoRecording();
          setIsRecording(true);
        }}
        onConfirm={async () => {
          setShowReviewModal(false);
          sendResponse(true); // Pass true to confirm and skip review modal next time
        }}
      />

      <div className='container mx-auto px-4 py-10 pb-2 pt-16'>
        <div className='w-full max-w-full mx-auto'>
          <div className='flex items-center justify-between mb-2'>
            {isStarted && (
              <div className='px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium flex items-center'>
                <div className={`w-3 h-3 rounded-full mr-2 ${isRecording ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                {isRecording ? "Recording" : "Paused"}
              </div>
            )}
          </div>

          <ProtectedRoute>
            <div
              id='top'
              className='relative rounded-3xl overflow-hidden backdrop-blur-sm border p-0 border-white/20 dark:border-gray-800 shadow-2xl bg-white/80 dark:bg-gray-900/80'>
              <InterviewHeader
                isStarted={isStarted}
                isCompleted={isCompleted}
                isRecording={isRecording} // Pass unified state
                toggleRecording={toggleRecording} // Pass unified toggle function
                sendResponse={sendResponse}
                loading={loading}
              />

              {infoBox && (
                <div className='p-3'>
                  <div className='grid grid-cols-1 md:grid-cols-19 gap-2'>
                    <div className='md:col-span-6'>
                      {" "}
                      <InstructionsCard
                        title='Interview Best Practices'
                        icon={<BarChart className='h-5 w-5 text-indigo-500' />}
                        items={[
                          "Be Professional & Confident",
                          "Understand the Role",
                          "Use the STAR Method",
                          "Demonstrate Problem-Solving",
                          "Manage Your Time",
                        ]}
                      />
                    </div>
                    <div className='col-span-1 bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950/30 rounded-2xl shadow-lg border border-indigo-100 dark:border-indigo-900/50 overflow-hidden md:col-span-7'>
                      <div className='bg-gradient-to-r from-indigo-600 to-[var(--color-primary-400)] p-4'>
                        <h3 className='text-xl font-semibold text-white text-center'>Interview Setup</h3>
                      </div>
                      <div className='p-6'>
                        {hasProfile ? (
                          <DialogForm
                            start={start}
                            setInterviewData={setInterviewData}
                            interviewData={interviewData}
                            job={job}
                            jobOrMock={jobOrMock}
                            setJobOrMock={setJobOrMock}
                            loading={loading}
                            setLoading={setLoading}
                          />
                        ) : (
                          <Link to='/profile'>
                            <h1 className='text-lg font-semibold text-center text-indigo-700 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl py-4 px-2 shadow-md border border-indigo-200 dark:border-indigo-800 transition-all duration-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 cursor-pointer'>
                              Add Profile to make interview customized
                            </h1>
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className='md:col-span-6'>
                      {" "}
                      <InstructionsCard
                        title='Prepare for Common Questions'
                        icon={<AlertCircle className='h-5 w-5 text-indigo-500' />}
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
                </div>
              )}

              {isStarted && (
                <div className='grid grid-cols-1 md:grid-cols-12 gap-4 p-6'>
                  <div className='md:col-span-5'>
                    <QuestionAndScore question={question} questionCount={questionCount} score={score} summary={summary} />
                  </div>
                  <div className='md:col-span-4'>
                    <ResponsesComponent
                      written={written}
                      setWritten={setWritten}
                      transcript={transcript}
                      resetTranscript={resetTranscript}
                      textareaRef={textareaRef}
                    />
                  </div>
                  <div className='md:col-span-3 md:float-left flex flex-col justify-normal'>
                    <VideoComponent stream={previewStream} isRecording={isRecording} />
                    <div
                      className='mt-5 relative group'
                      onClick={() => {
                        if (questionCount < 4) return;
                        setIsCompleted(true);
                        setIsStarted(false);
                      }}>
                      <FancyButton disabled={questionCount < 4} text={"End Interview"} />
                      {questionCount < 4 && (
                        <div
                          className='absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10 px-3 py-2 rounded-lg bg-gray-800 text-white text-xs shadow-lg pointer-events-none select-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                          style={{ minWidth: "180px", textAlign: "center" }}>
                          You need to answer at least 4 questions
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isCompleted && (
                <div className='flex flex-col items-center justify-center py-16 px-6'>
                  <div className='h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6'>
                    <CheckCircle className='h-12 w-12 text-green-500' />
                  </div>
                  <h1 className='text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4'>
                    Interview Completed
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-center max-w-md text-lg'>
                    Congratulations! You've successfully completed your mock interview. Review your performance and feedback:{" "}
                    <div dangerouslySetInnerHTML={{ __html: overallAnalysis }}></div>
                  </p>
                  <button
                    onClick={() => {
                      setIsCompleted(false);
                      setInfoBox(true);
                    }}
                    className='mt-8 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1'>
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
  isRecording, // Unified state
  toggleRecording, // Unified toggle function
  sendResponse,
  loading,
}) {
  return (
    <div className='bg-gradient-to-r from-indigo-600 to-[var(--color-primary-400)] p-3'>
      <div className='flex flex-col md:flex-row justify-between items-center'>
        <div className='flex items-center mb-4 md:mb-0'>
          <div className='w-10 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg'>
            <Bot className='h-8 w-8 text-white' />
          </div>
          <div className='ml-4'>
            <h2 className='text-2xl font-bold text-white'>Interview Assistant</h2>
            <p className='text-indigo-100'>AI-powered practice for your next big opportunity</p>
          </div>
        </div>

        {isStarted && !isCompleted && (
          <div className='flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg'>
            <button
              disabled={loading}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              className={`p-2.5 rounded-full transition-all duration-200 shadow-md disabled:opacity-50 ${
                isRecording ? "bg-red-500 text-white hover:bg-red-600" : "bg-white text-indigo-600 hover:bg-indigo-50"
              }`}
              onClick={toggleRecording}>
              {isRecording ? (
                <div className='h-5 w-5 bg-white rounded-sm flex items-center justify-center'>
                  <div className='h-3 w-3 bg-red-500 rounded-sm'></div>
                </div>
              ) : (
                <div className='h-5 w-5 relative'>
                  <div className='absolute inset-0 bg-indigo-600 rounded-full'></div>
                  <div className='absolute inset-1 bg-white rounded-full'></div>
                </div>
              )}
            </button>

            <button
              onClick={() => sendResponse(false)}
              disabled={loading}
              aria-label='Send response'
              className={`p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-200 shadow-md ${
                loading ? "pl-3 pr-3" : ""
              }`}>
              {loading ? (
                <div className='h-5 w-5 flex items-center justify-center'>
                  <Spinner size='sm' />
                </div>
              ) : (
                <Send className='h-5 w-5' />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
function InstructionsCard({ title, items, icon }) {
  return (
    <div className='min-h-72 bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950/30 rounded-2xl shadow-lg border border-indigo-100 dark:border-indigo-900/50 overflow-hidden'>
      <div className='bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 p-4'>
        <div className='flex items-center justify-center'>
          {icon}
          <h3 className='text-xl font-semibold text-white ml-2'>{title}</h3>
        </div>
      </div>
      <div className='p-6'>
        <ul className='space-y-4 h-72'>
          {items.map((item, index) => (
            <li key={index} className='flex items-center'>
              <div className='h-2 w-2 rounded-full bg-indigo-500 mr-3'></div>
              <span className='text-gray-700 dark:text-gray-200'>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function QuestionAndScore({ question, questionCount, score, summary }) {
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
    <div className='flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-indigo-100 dark:border-indigo-900/50 max-h-min min-h-96'>
      <div className='bg-gradient-to-r from-indigo-600 to-purple-600 p-4'>
        <h3 className='text-lg font-medium text-white flex items-center'>
          <Sparkles className='h-5 w-5 mr-2' />
          Current Question {questionCount}
        </h3>
      </div>

      <div className='p-5 flex-grow bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-800 dark:to-indigo-950/10'>
        <p className='text-gray-800 dark:text-gray-200 text-lg font-medium'>
          {question ? question : "Your interview question will appear here"}
        </p>
      </div>

      {score && (
        <div className='p-4 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between bg-white dark:bg-gray-800'>
          <span className='text-gray-600 dark:text-gray-300 font-medium'>Response Score</span>
          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${getScoreBg(scoreValue)}`}>
            <span className={`text-xl font-bold ${getScoreColor(scoreValue)}`}>{score}</span>
          </div>
        </div>
      )}

      <div className='bg-indigo-50 dark:bg-indigo-900/20 p-5 border-t border-indigo-100 dark:border-indigo-900/50'>
        <h4 className='text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-3 flex items-center'>
          <Info className='h-4 w-4 mr-2' />
          AI Feedback
        </h4>
        <div dangerouslySetInnerHTML={{ __html: summary }} />
      </div>
    </div>
  );
}

function VideoComponent({ stream, isRecording }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <div className='h-max flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-indigo-100 dark:border-indigo-900/50'>
      <div className='bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between'>
        <h3 className='text-lg font-medium text-white flex items-center'>
          <Video className='h-5 w-5 mr-2' />
          Your Camera
        </h3>
        {isRecording && (
          <div className='flex items-center px-3 py-1 bg-black/30 rounded-full'>
            <div className='h-3 w-3 rounded-full bg-red-500 animate-pulse mr-2'></div>
            <span className='text-xs text-white'>Recording</span>
          </div>
        )}
      </div>

      <div className='relative flex-grow bg-gray-900 flex items-center justify-center'>
        {stream ? <video ref={videoRef} autoPlay muted playsInline className='w-full h-64 object-cover transform -scale-x-100' /> : ""}
        {!isRecording && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
            <div className='p-6 bg-black/60 rounded-full'>
              <PauseCircle className='h-16 w-16 text-white/90' />
            </div>
          </div>
        )}
      </div>

      <div className='p-1 bg-indigo-50 dark:bg-indigo-900/20 text-center border-t border-indigo-100 dark:border-indigo-900/50'>
        <p className='text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center'>
          <Info className='h-4 w-4 mr-2 text-indigo-500' />
          Make sure you're well lit and centered in frame
        </p>
      </div>
    </div>
  );
}

function ResponsesComponent({ written, setWritten, transcript, resetTranscript, textareaRef }) {
  const adjustHeight = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [written]);

  return (
    <div className='flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-indigo-100 dark:border-indigo-900/50'>
      <div className='bg-gradient-to-r from-indigo-600 to-purple-600 p-4'>
        <h3 className='text-lg font-medium text-white flex items-center'>
          <Mic className='h-5 w-5 mr-2' />
          Your Response
        </h3>
      </div>

      <div className='p-5 flex-grow flex flex-col gap-1 bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-800 dark:to-indigo-950/10'>
        <div className='flex-1'>
          <h4 className='text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-3 flex items-center'>
            <Mic className='h-4 w-4 mr-2' />
            Recorded Speech <span className='text-red-500'>(Draft Only!)</span>
          </h4>
          <div className='min-h-24 max-h-max p-4 border border-indigo-100 dark:border-indigo-900/50 rounded-xl bg-white dark:bg-gray-800 shadow-inner'>
            <p className='text-gray-800 dark:text-gray-200' style={{ wordBreak: "break-word" }}>
              {transcript || "Your spoken words will appear here as you speak..."}
            </p>
          </div>
        </div>
        <div className='flex items-center justify-center mt-0 mb-1'>
          <button className='w-[50%] text-center rounded-xl bg-[var(--color-primary-500)]' onClick={() => resetTranscript()}>
            Reset
          </button>
        </div>
        <div className='flex-1'>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-sm font-medium text-indigo-700 dark:text-indigo-400 flex items-center'>
              <Send className='h-4 w-4 mr-2' />
              Written Response (Optional)
            </h4>
          </div>
          <textarea
            ref={textareaRef}
            onInput={adjustHeight}
            onChange={(e) => setWritten(e.target.value)}
            value={written}
            placeholder='Type your response here if needed...'
            className='w-full min-h-24 p-4 border border-indigo-100 dark:border-indigo-900/50 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-inner'
            style={{ resize: "none", overflowY: "hidden" }}
          />
        </div>
      </div>

      <div className='p-4 bg-indigo-50 dark:bg-indigo-900/20 text-center border-t border-indigo-100 dark:border-indigo-900/50'>
        <p className='text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center'>
          <Info className='h-4 w-4 mr-2 text-indigo-500' />
          Click the send button when you're ready to submit your answer
        </p>
      </div>
    </div>
  );
}
function RecordingReviewModal({ isOpen, onClose, videoUrl, transcript, written, onReRecord, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className='max-h-screen overflow-y-auto fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4'>
      <div className='w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-xl overflow-hidden'>
        <div className='flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Review Your Response</h2>
          <button onClick={onClose} className='text-gray-500 hover:text-red-500'>
            <X className='h-6 w-6' />
          </button>
        </div>

        <div className='p-4 space-y-4 flex items-center flex-col'>
          <video controls src={videoUrl} className='w-96 h-80 rounded-xl border border-gray-300 dark:border-gray-700' />

          <div>
            <h3 className='text-sm font-bold text-indigo-600 dark:text-indigo-400'>Transcript</h3>
            <p className='mt-1 text-gray-800 dark:text-gray-200 whitespace-pre-wrap'>{transcript || "No transcript available."}</p>
          </div>
          <div>
            <h3 className='text-sm font-bold text-indigo-600 dark:text-indigo-400'>Written</h3>
            <p className='mt-1 text-gray-800 dark:text-gray-200 whitespace-pre-wrap'>{written || "No nothing was written."}</p>
          </div>
        </div>

        <div className='flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'>
          <button
            onClick={onReRecord}
            className='flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-white border border-red-600 hover:bg-red-600 rounded-full font-medium'>
            <Trash2 className='w-4 h-4' /> Re-record
          </button>
          <button
            onClick={onConfirm}
            className='flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-full font-medium'>
            <CheckCircle2 className='w-4 h-4' /> Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );
}
