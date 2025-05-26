import { useCallback, useEffect } from "react";
import axios from "axios";
const url = import.meta.env.VITE_API_URL;
export default function EvaluationModalUI({ evaluationModal, setEvaluationModal, setNodes }) {
  useEffect(() => { console.log(url) }, [])
  const handleSendMessage = useCallback(async () => {
    if (!evaluationModal.inputMessage.trim() && !evaluationModal.file) return;

    // Add user message to chat
    const userMessage = {
      sender: 'user',
      text: evaluationModal.inputMessage,
      file: evaluationModal.file ? evaluationModal.file.name : null
    };

    setEvaluationModal(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      inputMessage: '',
      file: null
    }));

    try {
      // Prepare form data for API call
      const formData = new FormData();
      formData.append('message', evaluationModal.inputMessage);
      formData.append('stId', evaluationModal.stId);
      if (evaluationModal.file) {
        formData.append('file', evaluationModal.file);
      }

      // Call your API endpoint here
      const response = await axios.post(url + '/roadmap/evaluate-subtask', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Add AI response to chat
      const aiMessage = {
        sender: 'ai',
        text: response.data.message,
        completed: response.data.completed
      };

      setEvaluationModal(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));

      // If task is marked completed by AI, update the nodes
      if (response.data.completed) {
        setEvaluationModal(prev => ({
          ...prev,
          open: false
        }))
        setNodes(prevNodes =>
          prevNodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              subtasks: node.data.subtasks?.map(subtask =>
                subtask.id === evaluationModal.stId
                  ? { ...subtask, completed: true }
                  : subtask
              ),
            },
          }))
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setEvaluationModal(prev => ({
        ...prev,
        messages: [...prev.messages, {
          sender: 'ai',
          text: 'Sorry, there was an error processing your request.'
        }]
      }));
    }
  }, [evaluationModal, setNodes]);

  // Handle file upload
  const handleFileChange = (e) => {
    setEvaluationModal(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  return (

    <div className="fixed left-4 top-3 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{evaluationModal.taskName}</h2>
              <p className="text-sm text-gray-600">{evaluationModal.subTaskName}</p>
            </div>
            <button
              onClick={() => setEvaluationModal(prev => ({ ...prev, open: false }))}
              className="text-gray-500 hover:text-gray-700"
            >
              ❌
            </button>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {evaluationModal.messages.length > 0 &&
            <>
              {evaluationModal.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-lg p-3 ${msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'}`}
                  >
                    <p>{msg.text}</p>
                    {msg.file && (
                      <div className="mt-2 text-xs">
                        📎 {msg.file}
                      </div>
                    )}
                    {msg.completed && (
                      <div className="mt-2 text-green-600 font-semibold">
                        ✓ Task marked as completed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          }
        </div>

        {/* Input area */}
        <div className="border-t p-4">
          <div className="flex items-center">
            <input
              type="text"
              value={evaluationModal.inputMessage}
              onChange={(e) => setEvaluationModal(prev => ({ ...prev, inputMessage: e.target.value }))}
              placeholder="Type your evaluation..."
              className="flex-1 border rounded-l-lg p-2 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <label className="bg-gray-200 p-2 cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              📎
            </label>
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}
