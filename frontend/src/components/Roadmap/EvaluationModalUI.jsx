import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import { Dialog } from "@headlessui/react";
import { handleError } from "../../utils";
const url = import.meta.env.VITE_API_URL;

export default function EvaluationModalUI({ evaluationModal, setEvaluationModal, setNodes }) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleSendMessage = useCallback(async () => {
    if (!evaluationModal.inputMessage.trim() && !evaluationModal.file) {
      return;
    }

    // Add user message to chat
    const userMessage = {
      sender: "user",
      text: evaluationModal.inputMessage,
      file: evaluationModal.file ? evaluationModal.file.name : null,
    };

    setEvaluationModal((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      inputMessage: "",
      file: null,
    }));

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("taskId", evaluationModal.taskId);
      formData.append("subtaskId", evaluationModal.stId);
      formData.append("text", evaluationModal.inputMessage);

      if (evaluationModal.file) {
        formData.append("file", evaluationModal.file);
      }

      // Call API endpoint
      const response = await axios.post(`${url}/roadmap/evaluate-subtask`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        // Add AI response to chat
        const aiMessage = {
          sender: "ai",
          text: response.data.data.evaluation.analysis,
          completed: response.data.data.completed,
        };

        setEvaluationModal((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
        }));

        // If task is marked completed, update the nodes
        if (response.data.data.completed) {
          setNodes((prevNodes) =>
            prevNodes.map((node) => {
              const updatedSubtasks = node.data.subtasks?.map((subtask) =>
                subtask.id === evaluationModal.stId
                  ? {
                      ...subtask,
                      completed: true,
                      evaluation: response.data.data.evaluation,
                    }
                  : subtask
              );

              return {
                ...node,
                data: {
                  ...node.data,
                  subtasks: updatedSubtasks,
                },
              };
            })
          );

          // Close modal after short delay
          setTimeout(() => {
            setEvaluationModal((prev) => ({ ...prev, open: false }));
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error evaluating subtask:", error);
      const errorMessage = {
        sender: "ai",
        text: "Sorry, there was an error processing your submission. Please try again.",
        error: true,
      };

      setEvaluationModal((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
    }
  }, [evaluationModal, setNodes, setEvaluationModal]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEvaluationModal((prev) => ({
        ...prev,
        file,
      }));
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      if (evaluationModal.inputMessage.length < 4 && !evaluationModal.file) {
        handleError("Please enter a message or upload a file before submitting.");
        setIsLoading(false);
        return;
      }
      // Log the modal state for debugging
      console.log("Evaluation Modal State:", {
        taskId: evaluationModal.taskId,
        stId: evaluationModal.stId,
        inputMessage: evaluationModal.inputMessage,
      });

      // Convert IDs to numbers and validate
      const taskId = parseInt(evaluationModal.taskId);
      const subtaskId = parseInt(evaluationModal.stId);

      if (isNaN(taskId) || isNaN(subtaskId)) {
        throw new Error(`Invalid IDs: taskId=${taskId}, subtaskId=${subtaskId}`);
      }

      const formData = new FormData();
      formData.append("taskId", taskId);
      formData.append("subtaskId", subtaskId);
      formData.append("text", evaluationModal.inputMessage);

      if (evaluationModal.file) {
        formData.append("file", evaluationModal.file);
      }

      // Update nodes to show evaluating state
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          const updatedSubtasks = node.data.subtasks?.map((subtask) =>
            subtask.id === evaluationModal.stId ? { ...subtask, evaluating: true } : subtask
          );
          return {
            ...node,
            data: { ...node.data, subtasks: updatedSubtasks },
          };
        })
      );

      const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const response = await axios.post(`${url}/roadmap/evaluate-subtask`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        const aiMessage = {
          sender: "ai",
          text: response.data.data.evaluation.analysis,
          completed: response.data.data.completed,
        };

        setEvaluationModal((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
        }));

        // Update completion status
        if (response.data.data.completed) {
          setNodes((prevNodes) =>
            prevNodes.map((node) => {
              const updatedSubtasks = node.data.subtasks?.map((subtask) =>
                subtask.id === evaluationModal.stId
                  ? {
                      ...subtask,
                      completed: true,
                      evaluating: false,
                      evaluation: response.data.data.evaluation,
                    }
                  : subtask
              );
              return {
                ...node,
                data: { ...node.data, subtasks: updatedSubtasks },
              };
            })
          );

          // Close modal after feedback is shown
          setTimeout(closeModal, 3000);
        }
      }
    } catch (error) {
      console.error("Error evaluating subtask:", error);
      // Show error state in the modal
      setEvaluationModal((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            sender: "system",
            text: "Failed to evaluate subtask. Please try again." + error,
            error: true,
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };
  const closeModal = useCallback(() => {
    setEvaluationModal((prev) => ({
      ...prev,
      open: false,
      messages: [],
      inputMessage: "",
      file: null,
    }));
  }, [setEvaluationModal]);
  return (
    <Dialog open={evaluationModal.open} onClose={closeModal} className='relative z-50'>
      {/* adding a close button too */}
      <button
        type='button'
        onClick={closeModal}
        className='absolute top-2 right-2 text-sm font-medium text-gray-700 dark:text-gray-300
                  bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200
                  dark:hover:bg-gray-600 transition-colors'>
        ❌
      </button>
      <div className='fixed inset-0 bg-black/30 backdrop-blur-sm' aria-hidden='true' />
      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <Dialog.Panel className='mx-auto max-w-2xl w-full rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl'>
          <Dialog.Title className='text-lg font-medium mb-4 text-gray-900 dark:text-gray-100'>
            Evaluate Task: {evaluationModal.taskName}
          </Dialog.Title>
          <Dialog.Description className='text-sm text-gray-600 dark:text-gray-300 mb-6'>
            Subtask: {evaluationModal.subTaskName}
          </Dialog.Description>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Upload Files (Optional)</label>
              <div className='relative'>
                <input type='file' ref={fileInputRef} onChange={handleFileChange} className='hidden' />
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg
                    hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200
                    text-gray-600 dark:text-gray-300 text-sm'>
                  {evaluationModal.file ? (
                    <div className='flex items-center justify-between'>
                      <span>{evaluationModal.file.name}</span>
                      <div className='w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                        <div className='h-full bg-blue-500 transition-all duration-300' style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    "Click to upload or drag and drop files here"
                  )}
                </button>
              </div>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Description (Optional)</label>
              <textarea
                value={evaluationModal.inputMessage}
                onChange={(e) =>
                  setEvaluationModal((prev) => ({
                    ...prev,
                    inputMessage: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                rows={4}
                placeholder='Describe your implementation...'
              />
            </div>

            <div className='space-y-4 max-h-60 overflow-y-auto'>
              {evaluationModal.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    msg.sender === "ai"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                      : msg.error
                      ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                      : "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className='flex justify-end gap-3 mt-6'>
              <button
                type='button'
                onClick={closeModal}
                className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                  bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200
                  dark:hover:bg-gray-600 transition-colors'>
                Cancel
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className='px-4 py-2 text-sm font-medium text-white bg-blue-500
                  rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50
                  disabled:cursor-not-allowed flex items-center gap-2'>
                {isLoading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Evaluating...
                  </>
                ) : (
                  "Submit for Evaluation"
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
