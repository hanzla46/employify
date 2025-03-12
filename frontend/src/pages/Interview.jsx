import "regenerator-runtime/runtime";
import Webcam from "react-webcam";
import { useRef } from "react";
import axios from "axios";
import { Bot, Video, Mic, Send } from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { handleSuccess, handleError } from "../utils";
import DialogForm from "../components/DialogForm";

const url = "https://employify-backend.vercel.app";

export function Interview() {
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [written, setWritten] = useState("");
  const [score, setScore] = useState();
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const webcamRef = useRef(null);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [summary, setSummary] = useState("");
  const [interviewData, setInterviewData] = useState({
    position: "",
    company: "",
    industry: "",
    experience: "",
  });
  const [infoBox, setInfoBox] = useState(true);
  let body = {};
  const startInterview = async () => {
    try {
      const response = await axios.get(
        url + "/interview/start",
        interviewData,
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setQuestion(response.data.question);
        setCategory(response.data.category);
        handleSuccess("started!!!!");
        setIsStarted(true);
        startVideoRecording();
        SpeechRecognition.startListening({ continuous: true });
        setIsAudioRecording(true);
        setInfoBox(false);
      } else {
        handleError("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Failed to start interview:", error.message);
    }
  };

  const sendResponse = async () => {
    if (!transcript && !written) return;
    console.log(transcript);
    SpeechRecognition.stopListening();
    setIsAudioRecording(false);
    stopVideoRecording();
    let videoFile = null;
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      videoFile = new File([blob], "interview-recording.webm", {
        type: "video/webm",
      });
    }
    const formData = new FormData();
    formData.append("question", question);
    formData.append("answer", transcript);
    formData.append("written", written);
    if (videoFile) {
      formData.append("video", videoFile);
    }
    formData.append("category", category);
    setVideoURL(null);
    setRecordedChunks([]);
    try {
      const response = await axios.post(url + "/interview/continue", formData, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        setQuestion(response.data.question);
        setCategory(response.data.category);
        setScore(response.data.score);
        setSummary(response.data.aiSummary);
        resetTranscript();
        setWritten("");
        setIsAudioRecording(true);
        SpeechRecognition.startListening({ continuous: true });
        startVideoRecording();
        if (
          response.data.completion == true ||
          response.data.completion == "true"
        ) {
          setIsCompleted(true);
          setIsStarted(false);
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
  const startVideoRecording = () => {
    setRecordedChunks([]); // Reset previous recordings
    setVideoURL(null); // Reset video URL

    if (webcamRef.current) {
      const stream = webcamRef.current.stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        if (recordedChunks.length > 0) {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const newVideoURL = URL.createObjectURL(blob);
          setVideoURL(newVideoURL);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsVideoRecording(true);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsVideoRecording(false);
    }
  };
  //everything starts from here
  const start = () => {
    //setIsStarted(true);
    startInterview();
  };
  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="w-4/5 mx-auto">
          <h1 className="text-3xl font-bold mb-3 dark:text-white">
            AI Mock Interview
          </h1>
          <ProtectedRoute>
            <div className="relative flex-col bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 mb-8">
              {infoBox && (
                <div className="fixed overflow-x-hidden overflow-y-auto inset-0 top-14 left-0 w-full md:w-full h-full flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4">
                    <DialogForm
                      start={start}
                      setInterviewData={setInterviewData}
                      interviewData={interviewData}
                    />
                  </div>
                </div>
              )}
              <Top
                start={start}
                isStarted={isStarted}
                isCompleted={isCompleted}
                RecordAudio={RecordAudio}
                videoRecording={isVideoRecording}
                isAudioRecording={isAudioRecording}
                handleVideoRecord={handleVideoRecord}
                sendResponse={sendResponse}
              />
              {isStarted ? (
                <div className="flex flex-row justify-between gap-2">
                  <QnS question={question} score={score} summary={summary} />
                  <VideoComp webcamRef={webcamRef} />
                  <Responses
                    written={written}
                    setWritten={setWritten}
                    transcript={transcript}
                  />
                </div>
              ) : (
                ""
              )}
              {isCompleted ? (
                <h1 className="text-3xl text-gray-700 dark:text-white justify-center m-10">
                  Interview Completed
                </h1>
              ) : (
                ""
              )}
            </div>
          </ProtectedRoute>
        </div>
      </div>
    </div>
  );
}

function Top({
  isStarted,
  isCompleted,
  handleVideoRecord,
  RecordAudio,
  sendResponse,
  isAudioRecording,
  videoRecording,
}) {
  return (
    <>
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
        <div className="flex items-center gap-4 mr-6">
          <button
            disabled={!isStarted || isCompleted}
            aria-label="Toggle microphone"
            className={`p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-35 ${
              isAudioRecording
                ? "text-green-600 md:text-green-600"
                : "text-red-600 md:text-red-600"
            } ${!isStarted || isCompleted ? "text-black" : ""}`}
            onClick={RecordAudio}
          >
            <Mic className="h-6 w-6" />
          </button>
          <button
            disabled={!isStarted || isCompleted}
            aria-label="Toggle video"
            onClick={handleVideoRecord}
            className={`p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-35 ${
              videoRecording
                ? "text-green-600 md:text-green-600"
                : "text-red-600 md:text-red-600"
            } ${!isStarted || isCompleted ? "text-black" : ""}`}
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
    </>
  );
}

function QnS({ question, score, summary }) {
  return (
    <div className="w-[30%] border border-gray-300 dark:border-gray-600 rounded-lg p-4">
      <div className="m-auto flex flex-col border-white dark:border-indigo-600">
        <div className="p-4">
          <p className="text-gray-800 dark:text-gray-200">
            {question ? question : "Question will be shown here"}
          </p>
        </div>
        <div className="p-4">
          <span className="text-xl text-gray-700 dark:text-white">
            {score ? score : "0/10"}
          </span>
        </div>
        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4">
          <span className="text-gray-800 dark:text-gray-200">
            {summary ? summary : "Summary will be shown here"}
          </span>
        </div>
      </div>
    </div>
  );
}
function VideoComp({ webcamRef }) {
  return (
    <div className="w-[30%] border border-gray-300 dark:border-gray-600 rounded-lg p-4">
      <div className="flex flex-col">
        <h3 className="text-gray-700 dark:text-white mb-3">Webcam</h3>
        <Webcam
          audio={true}
          ref={webcamRef}
          className="rounded-lg shadow-md w-full m-auto transform -scale-x-100"
        />
      </div>
    </div>
  );
}
function Responses({
  written,
  setWritten,
  transcript,
  videoURL,
  videoRef,
  webcamRef,
}) {
  //text area
  const textareaRef = useRef(null);
  const adjustHeight = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };
  return (
    <div className="flex flex-col gap-4 mb-6 h-auto w-[30%] border border-gray-300 dark:border-gray-600 rounded-lg p-4">
      <div className="flex-row">
        <div className="flex flex-col">
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
          {/* <FancyButton text={"reset"} onClick={() => resetTranscript()} /> */}
        </div>
        <div className="flex flex-col">
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
    </div>
  );
}
