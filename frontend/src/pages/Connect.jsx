import { useEffect, useState } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import {handleSuccess, handleError} from "../utils";
import { Clipboard } from "lucide-react";
const url = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function Connect() {
  useEffect(() => {
    document.title = "Connect | Employify";
  }, []);
  const [dmProfile, setDmProfile] = useState("");
  const [dmPurpose, setDmPurpose] = useState("");
  const [dmResult, setDmResult] = useState("");
  const [dmLoading, setDmLoading] = useState(false);

  // Post Wizard state
  const [postMode, setPostMode] = useState("auto"); // "auto" or "custom"
  const [customTone, setCustomTone] = useState("");
  const [postInput, setPostInput] = useState("");
  const [postResult, setPostResult] = useState("");
  const [postLoading, setPostLoading] = useState(false);
 const handleCopyClick = async () => {
    try {
      if(!postResult) {
        handleError("No post generated to copy!");
        return;
      }
      await navigator.clipboard.writeText(postResult);
      handleSuccess("Post copied to clipboard!");
    } catch (err) {
      handleError('Failed to copy text: ' + err);
    }
  };
  const handleDmSubmit = async (e) => {
    e.preventDefault();
    setDmLoading(true);
    setDmResult("");
    const res = await axios.get(`${url}/connect/cold-message`, {
      params: {
        username: dmProfile,
        purpose: dmPurpose,
      },
    });
    setDmResult(res.data.coldMessage);
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
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white px-6 py-14'>
      <div className='max-w-5xl mx-auto'>
        <header className='text-center mb-3'>
          <h1 className='text-4xl font-extrabold mb-2'>🔗 Connect: LinkedIn Power Tools</h1>
          <p className='text-zinc-600 dark:text-zinc-400 text-lg'>Slide into DMs or go viral — with zero cringe, maximum clout 💼✨</p>
        </header>

        <div className='grid md:grid-cols-2 gap-10'>
          {/* DM Sniper */}
          <section className='bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow-md p-6'>
            <h2 className='text-2xl font-semibold mb-2'>👑 DM Sniper</h2>
            <p className='text-zinc-600 dark:text-zinc-400 mb-4'>Slide into DMs without sounding like a desperate intern from hell.</p>
            <form onSubmit={handleDmSubmit} className='space-y-4'>
              <input
                className='w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500'
                type='text'
                placeholder='LinkedIn username or profile URL'
                value={dmProfile}
                onChange={(e) => setDmProfile(e.target.value)}
                required
              />
              <select
                className='w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500'
                value={dmPurpose}
                onChange={(e) => setDmPurpose(e.target.value)}
                required>
                <option value=''>Purpose (referral, collab, advice...)</option>
                <option value='referral'>Referral</option>
                <option value='collab'>Collaboration</option>
                <option value='advice'>Advice</option>
                <option value='networking'>Networking</option>
                <option value='other'>Other</option>
              </select>
              <button
                type='submit'
                className='bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow transition-all duration-200'
                disabled={dmLoading}>
                {dmLoading ? "Generating..." : "Generate Message"}
              </button>
            </form>
            {dmResult && (
              <div className='mt-6 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-600 rounded p-4'>
                <div className='font-semibold mb-2 text-green-900 dark:text-green-200'>Your DM:</div>
                <pre className='whitespace-pre-wrap text-zinc-800 dark:text-zinc-100'>{dmResult}</pre>
              </div>
            )}
          </section>

          {/* Post Wizard */}
          <section className='bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow-md p-6'>
            <h2 className='text-2xl font-semibold mb-2'>🧠 Post Wizard</h2>
            <p className='text-zinc-600 dark:text-zinc-400 mb-4'>“Just posted on LinkedIn” but it’s not ✨ cringe ✨ anymore.</p>
            <div className='flex gap-4 mb-4'>
              <button
                type='button'
                className={`px-3 py-1 rounded font-semibold border ${
                  postMode === "auto"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                }`}
                onClick={() => setPostMode("auto")}>
                Auto
              </button>
              <button
                type='button'
                className={`px-3 py-1 rounded font-semibold border ${
                  postMode === "custom"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                }`}
                onClick={() => setPostMode("custom")}>
                Custom
              </button>
            </div>
            <form onSubmit={handlePostSubmit} className='space-y-4'>
              {postMode === "custom" && (
                <>
                  <textarea
                    className='w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    rows={4}
                    placeholder='What do you want to post about? (achievement, update, etc.)'
                    value={postInput}
                    onChange={(e) => setPostInput(e.target.value)}
                    required
                  />
                  <select
                    className='w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400'
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                    required>
                    <option value=''>Select Tone</option>
                    <option value='professional'>Professional</option>
                    <option value='casual'>Casual</option>
                    <option value='inspirational'>Inspirational</option>
                    <option value='celebratory'>Celebratory</option>
                  </select>
                </>
              )}
              <button
                type='submit'
                className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition-all duration-200'
                disabled={postLoading}>
                {postLoading ? "Generating..." : postMode === "auto" ? "Generate LinkedIn Post" : "Generate Custom Post"}
              </button>
            </form>
            {postResult && (
              <div className='mt-6 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600 rounded p-4'>
                <button
                  type='button'
                  className='float-right text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-all duration-200'
                  onClick={handleCopyClick}>
                  <Clipboard />
                </button>
                <div className='font-semibold mb-2 text-blue-900 dark:text-blue-200'>Your LinkedIn Post:</div>
                <pre className='whitespace-pre-wrap text-zinc-800 dark:text-zinc-100'>{postResult}</pre>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Connect;
