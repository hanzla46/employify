export default function FancyButton(props) {
    return (
      <button className="relative px-6 py-3 font-medium text-white transition-all duration-300 bg-indigo-600 rounded-lg shadow-md group hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600">
        <span className="absolute inset-0 w-full h-full transform scale-0 bg-indigo-400 rounded-lg opacity-30 transition-all duration-300 group-hover:scale-100 dark:bg-indigo-300"></span>
        <span className="relative z-10">{props.text}</span>
      </button>
    );
  }