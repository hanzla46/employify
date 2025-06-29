import { useState } from "react";
const url = import.meta.env.VITE_API_URL || "http://localhost:5000";
import axios from "axios";
axios.defaults.withCredentials = true;
export function Connect() {
  // DM Sniper State
  const [dmProfile, setDmProfile] = useState("");
  const [dmPurpose, setDmPurpose] = useState("");
  const [dmResult, setDmResult] = useState("");
  const [dmLoading, setDmLoading] = useState(false);

  // Post Wizard State
  const [postInput, setPostInput] = useState("");
  const [postResult, setPostResult] = useState("");
  const [postLoading, setPostLoading] = useState(false);

  // Handlers (replace with real API calls)
  const handleDmSubmit = async (e) => {
    e.preventDefault();
    setDmLoading(true);
    setDmResult("");
    const res = await axios.get(url + "/connect/cold-message", {
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
    // TODO: Replace with backend call
    setTimeout(() => {
      setPostResult(
        `Excited to share: ${postInput}\n\nGrateful for the journey and everyone who’s been part of it. Let’s keep growing! #LinkedIn #Career`
      );
      setPostLoading(false);
    }, 1200);
  };

  return (
    <div className='max-w-2xl mx-auto py-12 px-4'>
      <h1 className='text-3xl font-bold mb-8 text-center'>🔗 Connect: LinkedIn Power Tools</h1>
      {/* DM Sniper */}
      <section className='mb-12 bg-white dark:bg-gray-900 rounded-xl shadow p-6'>
        <h2 className='text-xl font-semibold mb-2'>👑 DM Sniper: The Perfect Cold-Message Generator</h2>
        <p className='mb-4 text-gray-500 dark:text-gray-300'>Let them slide into DMs without sounding like a desperate intern from hell.</p>
        <form onSubmit={handleDmSubmit} className='space-y-4'>
          <input
            className='w-full border rounded px-3 py-2'
            type='text'
            placeholder='Target’s LinkedIn profile username or URL'
            value={dmProfile}
            onChange={(e) => setDmProfile(e.target.value)}
            required
          />
          <select className='w-full border rounded px-3 py-2' value={dmPurpose} onChange={(e) => setDmPurpose(e.target.value)} required>
            <option value=''>Purpose (referral, collab, advice...)</option>
            <option value='referral'>Referral</option>
            <option value='collab'>Collaboration</option>
            <option value='advice'>Advice</option>
            <option value='networking'>Networking</option>
            <option value='other'>Other</option>
          </select>
          <button type='submit' className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold' disabled={dmLoading}>
            {dmLoading ? "Generating..." : "Generate Message"}
          </button>
        </form>
        {dmResult && (
          <div className='mt-6 bg-gray-100 dark:bg-gray-800 rounded p-4 border border-green-200 dark:border-green-700'>
            <div className='font-semibold mb-2'>Your DM:</div>
            <pre className='whitespace-pre-wrap text-gray-800 dark:text-gray-100'>{dmResult}</pre>
          </div>
        )}
      </section>

      {/* Post Wizard */}
      <section className='bg-white dark:bg-gray-900 rounded-xl shadow p-6'>
        <h2 className='text-xl font-semibold mb-2'>🧠 Post Wizard / Hype Generator</h2>
        <p className='mb-4 text-gray-500 dark:text-gray-300'>“Just posted on LinkedIn” but it’s not ✨ cringe ✨ anymore.</p>
        <form onSubmit={handlePostSubmit} className='space-y-4'>
          <textarea
            className='w-full border rounded px-3 py-2'
            rows={4}
            placeholder='What do you want to post about? (achievement, update, etc.)'
            value={postInput}
            onChange={(e) => setPostInput(e.target.value)}
            required
          />
          <button type='submit' className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold' disabled={postLoading}>
            {postLoading ? "Generating..." : "Generate LinkedIn Post"}
          </button>
        </form>
        {postResult && (
          <div className='mt-6 bg-gray-100 dark:bg-gray-800 rounded p-4 border border-blue-200 dark:border-blue-700'>
            <div className='font-semibold mb-2'>Your LinkedIn Post:</div>
            <pre className='whitespace-pre-wrap text-gray-800 dark:text-gray-100'>{postResult}</pre>
          </div>
        )}
      </section>
    </div>
  );
}

export default Connect;
