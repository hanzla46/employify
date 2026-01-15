import React from "react";

export default function FancyButton({ text, disabled }) {
  return (
    <button
      disabled={disabled}
      className='bg-gradient-to-r from-[var(--color-primary-700)] to-purple-600 dark:from-[var(--color-primary-300)] dark:to-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-indigo-500/25 inline-flex items-center justify-center text-base disabled:opacity-50'>
      <div className='relative overflow-hidden'>
        <p className='group-hover:-translate-y-7 duration-[1s] ease-[cubic-bezier(0.19,1,0.22,1)]'>{text}</p>
        <p className='absolute top-6 left-0 group-hover:top-0 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]'>{text}</p>
      </div>
    </button>
  );
}
