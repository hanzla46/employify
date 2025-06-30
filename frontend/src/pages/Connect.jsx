import { useContext, useEffect, useState } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import { handleSuccess, handleError } from "../utils";
import { Clipboard, Wand2, MailPlus } from "lucide-react";
import { SkillsContext } from "../Context/SkillsContext";
import ProtectedRoute from "../Context/ProtectedRoute";
const url = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function Connect() {
  useEffect(() => {
    document.title = "Connect | Employify";
  }, []);

  const { hasProfile } = useContext(SkillsContext);

  const [dmProfile, setDmProfile] = useState("");
  const [dmPurpose, setDmPurpose] = useState("");
  const [dmResult, setDmResult] = useState("");
  const [dmLoading, setDmLoading] = useState(false);

  // Post Wizard state
  const [postMode, setPostMode] = useState("auto");
  const [customTone, setCustomTone] = useState("");
  const [postInput, setPostInput] = useState("");
  const [postResult, setPostResult] = useState("");
  const [postLoading, setPostLoading] = useState(false);

  const handleCopyClick = async () => {
    try {
      if (!postResult) {
        handleError("No post generated to copy!");
        return;
      }
      await navigator.clipboard.writeText(postResult);
      handleSuccess("Post copied to clipboard!");
    } catch (err) {
      handleError("Failed to copy text: " + err);
    }
  };

  const handleDmSubmit = async (e) => {
    e.preventDefault();
    setDmLoading(true);
    setDmResult("");
    try {
      const res = await axios.get(`${url}/connect/cold-message`, {
        params: {
          username: dmProfile,
          purpose: dmPurpose,
        },
      });
      setDmResult(res.data.coldMessage);
    } catch (err) {
      handleError("Error generating message: " + err.message);
    }
    setDmLoading(false);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostLoading(true);
    setPostResult("");
    try {
      const res = await axios.post(`${url}/connect/linkedin-post`, {
        content: postInput,
        tone: customTone,
        mode: postMode,
      });
      setPostResult(res.data.generatedPost);
    } catch (err) {
      setPostResult("Error generating post. Please try again.");
    }
    setPostLoading(false);
  };

  return (
    <div className='min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white px-6 py-14'>
      <div className='max-w-5xl mx-auto'>
        <header className='text-center mb-12'>
          <h1 className='text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700'>
            LinkedIn Connection Toolkit
          </h1>
          <p className='text-neutral-600 dark:text-neutral-300 text-lg max-w-2xl mx-auto'>
            AI-powered tools tailored to your professional profile for authentic networking and engagement
          </p>
        </header>
        <ProtectedRoute>
          {!hasProfile && (
            <div>
              {" "}
              <Link to={"/profile"}>
                {" "}
                <h2 className='text-red-600 dark:text-red-400 underline'>
                  ❗ Add Profile to unlock these features <span className='text-xl'>↗</span>
                </h2>
              </Link>
            </div>
          )}
          <div className='grid md:grid-cols-2 gap-8'>
            {/* DM Generator */}
            <section className='bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700'>
              <div className='flex items-center gap-3 mb-4'>
                <MailPlus className='text-blue-600' size={24} />
                <h2 className='text-xl font-semibold'>Personalized DM Generator</h2>
              </div>
              <p className='text-neutral-600 dark:text-neutral-400 mb-5 text-sm'>
                Messages customized using your profile data and recipient's background for authentic outreach
              </p>
              <form onSubmit={handleDmSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300'>Recipient's Profile</label>
                  <input
                    className='w-full bg-neutral-50 dark:bg-neutral-700/30 border border-neutral-200 dark:border-neutral-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    type='text'
                    placeholder='LinkedIn URL or username'
                    value={dmProfile}
                    onChange={(e) => setDmProfile(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300'>Purpose</label>
                  <select
                    className='w-full bg-neutral-50 dark:bg-neutral-700/30 border border-neutral-200 dark:border-neutral-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none'
                    value={dmPurpose}
                    onChange={(e) => setDmPurpose(e.target.value)}
                    required>
                    <option value=''>Select purpose</option>
                    <option value='referral'>Job referral</option>
                    <option value='collab'>Professional collaboration</option>
                    <option value='advice'>Career advice</option>
                    <option value='networking'>Industry networking</option>
                    <option value='other'>Other</option>
                  </select>
                </div>

                <button
                  type='submit'
                  className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 rounded-lg shadow transition-all duration-200 flex items-center justify-center'
                  disabled={dmLoading || !hasProfile}>
                  {dmLoading ? (
                    <span className='flex items-center'>
                      <svg
                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    "Create Personalized Message"
                  )}
                </button>
              </form>
              {dmResult && (
                <div className='mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
                  <div className='font-medium mb-2 text-blue-800 dark:text-blue-200 flex justify-between'>
                    <span>Your Tailored Message</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(dmResult)}
                      className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'>
                      <Clipboard size={18} />
                    </button>
                  </div>
                  <pre className='whitespace-pre-wrap text-neutral-800 dark:text-neutral-100 text-sm'>{dmResult}</pre>
                </div>
              )}
            </section>

            {/* Post Generator */}
            <section className='bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700'>
              <div className='flex items-center gap-3 mb-4'>
                <Wand2 className='text-indigo-600' size={24} />
                <h2 className='text-xl font-semibold'>AI Post Generator</h2>
              </div>
              <p className='text-neutral-600 dark:text-neutral-400 mb-5 text-sm'>
                Content crafted to match your professional brand and career narrative
              </p>

              <div className='flex gap-3 mb-5'>
                <button
                  type='button'
                  className={`flex-1 py-2 rounded-lg font-medium text-sm border transition-colors ${
                    postMode === "auto"
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                      : "bg-neutral-50 dark:bg-neutral-700/30 border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
                  }`}
                  onClick={() => setPostMode("auto")}>
                  Auto-Generate
                </button>
                <button
                  type='button'
                  className={`flex-1 py-2 rounded-lg font-medium text-sm border transition-colors ${
                    postMode === "custom"
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                      : "bg-neutral-50 dark:bg-neutral-700/30 border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
                  }`}
                  onClick={() => setPostMode("custom")}>
                  Custom Style
                </button>
              </div>

              <form onSubmit={handlePostSubmit} className='space-y-4'>
                {postMode === "custom" && (
                  <>
                    <div>
                      <label className='block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300'>Post Content</label>
                      <textarea
                        className='w-full bg-neutral-50 dark:bg-neutral-700/30 border border-neutral-200 dark:border-neutral-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                        rows={3}
                        placeholder='Key points, achievements, or topics...'
                        value={postInput}
                        onChange={(e) => setPostInput(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300'>Tone</label>
                      <select
                        className='w-full bg-neutral-50 dark:bg-neutral-700/30 border border-neutral-200 dark:border-neutral-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                        value={customTone}
                        onChange={(e) => setCustomTone(e.target.value)}
                        required>
                        <option value=''>Select professional tone</option>
                        <option value='professional'>Formal</option>
                        <option value='casual'>Conversational</option>
                        <option value='inspirational'>Motivational</option>
                        <option value='celebratory'>Achievement-focused</option>
                      </select>
                    </div>
                  </>
                )}

                <button
                  type='submit'
                  className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg shadow transition-all duration-200'
                  disabled={postLoading || !hasProfile}>
                  {postLoading
                    ? "Generating Professional Post..."
                    : postMode === "auto"
                    ? "Generate Using My Profile"
                    : "Create Custom Post"}
                </button>
              </form>
              {postResult && (
                <div className='mt-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4'>
                  <div className='font-medium mb-2 text-indigo-800 dark:text-indigo-200 flex justify-between'>
                    <span>Your Professional Post</span>
                    <button
                      onClick={handleCopyClick}
                      className='text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300'>
                      <Clipboard size={18} />
                    </button>
                  </div>
                  <pre className='whitespace-pre-wrap text-neutral-800 dark:text-neutral-100 text-sm'>{postResult}</pre>
                </div>
              )}
            </section>
          </div>

          <div className='mt-12 text-center text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto'>
            <p>
              All content is personalized using your Employify profile data to maintain consistent professional branding across your
              networking activities.
            </p>
          </div>
        </ProtectedRoute>
      </div>
    </div>
  );
}

export default Connect;
