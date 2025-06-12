import { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import { Bot, Video, Mic, Send, CheckCircle, PauseCircle, Info, Sparkles, AlertCircle, BarChart } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import ProtectedRoute from "../Context/ProtectedRoute";
import { JobsContext } from "../Context/JobsContext";
import { handleSuccess, handleError } from "../utils";
import DialogForm from "../components/Interview/DialogForm";
import { Spinner } from "../lib/Spinner";
import { useSearchParams } from "react-router-dom";
import FancyButton from "../components/Button";
import toWav from "audiobuffer-to-wav";

const url = import.meta.env.VITE_API_URL;

export function Interview() {
  useEffect(() => {
    document.title = "Interview | Employify AI";
    return () => {
      // Cleanup speech recognition
      SpeechRecognition.stopListening();
    };
  }, []);

  // Existing state
  const [jobOrMock, setJobOrMock] = useState("mock");
  const { jobs } = useContext(JobsContext);
  const [jobId, setJobId] = useState("");
  const [job, setJob] = useState(null);
  const [searchParams] = useSearchParams();
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [question, setQuestion] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [category, setCategory] = useState("");
  const [written, setWritten] = useState("");
  const [score, setScore] = useState();
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
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
  const textareaRef = useRef(null);

  // New recording state
  const [audioChunks, setAudioChunks] = useState([]);
  const [videoChunks, setVideoChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoRecorder, setVideoRecorder] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const videoRef = useRef(null);

  // Job selection effect
  useEffect(() => {
    setJobId(searchParams.get("jobId") || "");
  }, [searchParams]);

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

  // Question audio effect
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

  // Setup audio recording
  const setupAudioRecording = async () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks((prev) => [...prev, e.data]);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        const wavBuffer = toWav(audioBuffer);
        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
        setAudioBlob(wavBlob);
        setAudioChunks([]);
      };

      setMediaRecorder(recorder);
      return recorder;
    } catch (error) {
      console.error("Audio setup error:", error);
      handleError("Failed to initialize audio recording");
      return null;
    }
  };

  // Setup video recording
  const setupVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setVideoChunks((prev) => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(videoChunks, { type: "video/webm" });
        setRecordedBlob(blob);
        setVideoChunks([]);
      };

      // Update video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setVideoRecorder(recorder);
      return recorder;
    } catch (error) {
      console.error("Video setup error:", error);
      handleError("Failed to initialize video recording " + error.message);
      return null;
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRecorder) {
        videoRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
      SpeechRecognition.stopListening();
    };
  }, [mediaRecorder, videoRecorder, audioContext]);

  // Start interview
  const startInterview = async () => {
    setLoading(true);
    try {
      // Initialize all recording devices first
      const audioRecorder = await setupAudioRecording();
      const videoRecorder = await setupVideoRecording();

      if (!audioRecorder || !videoRecorder) {
        console.log("Failed to initialize recording devices");
      }

      // Start backend interview process
      const response = await axios.post(url + "/interview/start", { interviewData, jobOrMock, job }, { withCredentials: true });

      if (response.data.success) {
        // Start all recordings
        audioRecorder.start(1000); // Collect data every second
        videoRecorder.start(1000);
        SpeechRecognition.startListening({ continuous: true });

        setQuestionCount(1);
        setQuestion(response.data.question);
        setCategory(response.data.category);
        setIsStarted(true);
        setIsAudioRecording(true);
        setIsVideoRecording(true);
        setInfoBox(false);

        // Scroll to top
        const section = document.getElementById("top");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Failed to start interview:", error);
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

  // Send response
  const sendResponse = async () => {
    if (!transcript && !written) {
      handleError("Response can't be empty");
      return;
    }
    setLoading(true);

    try {
      // Stop all recordings
      if (mediaRecorder) mediaRecorder.stop();
      if (videoRecorder) videoRecorder.stop();
      SpeechRecognition.stopListening();

      // Wait for blobs to be processed
      await new Promise((resolve) => setTimeout(resolve, 500));

      const formData = new FormData();
      if (audioBlob) formData.append("audio", audioBlob, "audio.wav");
      if (recordedBlob) formData.append("video", recordedBlob, "recording.webm");
      formData.append("question", question);
      formData.append("category", category);
      formData.append("answer", transcript);
      formData.append("written", written);

      const response = await axios.post(url + "/interview/continue", formData, {
        withCredentials: true,
        headers: { Accept: "application/json" },
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

        // Restart recordings for next question
        if (mediaRecorder) mediaRecorder.start(1000);
        if (videoRecorder) videoRecorder.start(1000);
        SpeechRecognition.startListening({ continuous: true });
        setIsAudioRecording(true);
        setIsVideoRecording(true);

        if (response.data.completed) {
          setIsCompleted(true);
          setIsStarted(false);
        }
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

  // Toggle audio recording
  const toggleAudioRecording = async () => {
    if (!mediaRecorder) return;

    if (isAudioRecording) {
      mediaRecorder.stop();
      SpeechRecognition.stopListening();
    } else {
      mediaRecorder.start(1000);
      SpeechRecognition.startListening({ continuous: true });
    }
    setIsAudioRecording(!isAudioRecording);
  };

  // Toggle video recording
  const toggleVideoRecording = async () => {
    if (!videoRecorder) return;

    if (isVideoRecording) {
      videoRecorder.stop();
    } else {
      videoRecorder.start(1000);
    }
    setIsVideoRecording(!isVideoRecording);
  };

  // Key event handler
  useEffect(() => {
    if (!isStarted) return;

    const handleKeyPress = (event) => {
      if (event.key === "Enter" && document.activeElement !== textareaRef.current && !loading) {
        sendResponse();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isStarted, loading]);

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser doesn't support speech recognition</p>;
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white dark:from-gray-800 dark:via-indigo-950/30 dark:to-gray-700'>
      <div className='container mx-auto px-4 py-10 pb-2 pt-16'>
        <div className='w-full max-w-full mx-auto'>
          <div className='flex items-center justify-between mb-2'>
            {isStarted && (
              <div className='px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium flex items-center'>
                <div className={`w-3 h-3 rounded-full mr-2 ${isAudioRecording ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                {isAudioRecording || isVideoRecording ? "Recording" : "Paused"}
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
                RecordAudio={toggleAudioRecording}
                videoRecording={isVideoRecording}
                isAudioRecording={isAudioRecording}
                handleVideoRecord={toggleVideoRecording}
                sendResponse={sendResponse}
                loading={loading}
              />

              {infoBox && (
                <div className='p-3'>
                  <div className='grid grid-cols-1 md:grid-cols-19 gap-2'>
                    <div className='md:col-span-6'>
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
                        <DialogForm
                          start={startInterview}
                          setInterviewData={setInterviewData}
                          interviewData={interviewData}
                          job={job}
                          jobOrMock={jobOrMock}
                          setJobOrMock={setJobOrMock}
                          loading={loading}
                          setLoading={setLoading}
                        />
                      </div>
                    </div>
                    <div className='md:col-span-6'>
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
                    <QuestionAndScore questionCount={questionCount} question={question} score={score} summary={summary} />
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
                    <VideoComponent stream={videoRecorder?.stream} isVideoRecording={isVideoRecording} videoRef={videoRef} />
                    <div className='mt-5 relative group'>
                      <FancyButton disabled={questionCount < 4} text={"End Interview"} />
                      {questionCount < 4 && (
                        <span className='pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg z-10 whitespace-nowrap'>
                          Answer at least 4 Questions
                        </span>
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
  handleVideoRecord,
  RecordAudio,
  sendResponse,
  isAudioRecording,
  videoRecording,
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
          <div className='flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg'>
            <button
              disabled={loading}
              aria-label='Toggle microphone'
              className={`p-3 rounded-full transition-all duration-300 shadow-md disabled:opacity-50 ${
                isAudioRecording ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-600"
              }`}
              onClick={RecordAudio}>
              <Mic className='h-5 w-5' />
            </button>

            <button
              disabled={loading}
              aria-label='Toggle video'
              onClick={handleVideoRecord}
              className={`p-3 rounded-full transition-all duration-300 shadow-md disabled:opacity-50 ${
                videoRecording ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-600"
              }`}>
              <Video className='h-5 w-5' />
            </button>

            {loading ? (
              <Spinner />
            ) : (
              <button
                onClick={sendResponse}
                aria-label='Send message'
                className='p-3 bg-white text-indigo-600 rounded-full hover:bg-indigo-50 transition-all duration-300 shadow-md'>
                <Send className='h-5 w-5' />
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

function QuestionAndScore({ question, score, summary, questionCount }) {
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
          Current Question &nbsp; &nbsp; <b>{questionCount}</b>
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

function VideoComponent({ stream, isVideoRecording }) {
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
        {isVideoRecording && (
          <div className='flex items-center px-3 py-1 bg-black/30 rounded-full'>
            <div className='h-3 w-3 rounded-full bg-red-500 animate-pulse mr-2'></div>
            <span className='text-xs text-white'>Recording</span>
          </div>
        )}
      </div>

      <div className='relative flex-grow bg-gray-900 flex items-center justify-center'>
        {stream ? <video ref={videoRef} autoPlay muted playsInline className='w-full h-64 object-cover transform -scale-x-100' /> : ""}
        {!isVideoRecording && (
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
            Recorded Speech
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
