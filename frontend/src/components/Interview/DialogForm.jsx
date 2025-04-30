import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { handleError } from "../../utils";
import { Briefcase, Building, BookOpen, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Spinner } from "../../lib/Spinner";
const options = {
  company: [
    "Startup",
    "Small Business",
    "Mid-Sized Company",
    "Enterprise",
    "Freelance",
    "Agency",
    "Multinational Corporation"
  ],
  industry: [
    "Technology & IT",
    "Finance & Banking",
    "Healthcare Admin & Research",
    "Marketing & Advertising",
    "Legal",
    "Business & Management",
    "Sales & E-Commerce",
    "Government & Policy",
    "Education & EdTech",
    "Travel, Hospitality & Tourism",
    "Real Estate",
    "Other"
  ],
  experience: ["0-1", "1-2", "2-3", "4-6", "6+"],
};

export default function DialogForm({ start, setInterviewData, interviewData, job, jobOrMock, setJobOrMock }) {
  useEffect(() => {
    console.log("job" + job);
    console.log("mock or job" + jobOrMock);
  }, [job, jobOrMock])
  const [loading, setLoading] = useState(false);
  const startIt = () => {
    if (interviewData.position === "" || interviewData.company === "" || interviewData.industry === "" || interviewData.experience === "") {
      handleError("Please fill all the fields");
      return;
    }
    setLoading(true);
    start();
    setLoading(false);
  }

  return (
    <>
      <div className="flex justify-center align-middle mb-3">
        <button className={`py-2 px-4 font-medium text-sm focus:outline-none ${jobOrMock === "mock"
          ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`} onClick={() => setJobOrMock("mock")}>Mock Interview</button>
        <button className={`py-2 px-4 font-medium text-sm focus:outline-none ${jobOrMock === "job"
          ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`} onClick={() => setJobOrMock("job")}>Job Interview</button>
      </div>
      {jobOrMock === "mock" ? (
        <MockInterviewCard interviewData={interviewData} setInterviewData={setInterviewData} />) : ""}
      {jobOrMock === "job" && job ? (<JobDataCard job={job} />) : ""}

      <div className="pt-4">
        <button
          onClick={startIt}
          className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center"
        >
          {loading ? (
            <Spinner />
          )
            : ("")
          }
          Start Interview
        </button>
      </div>
    </>
  );
}

function MockInterviewCard({ interviewData, setInterviewData }) {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="space-y-5 p-0">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 dark:text-primary-400">
            <Briefcase size={18} />
          </div>
          <Input
            type="text"
            placeholder="Position or Role"
            className="pl-10 border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={interviewData.position}
            onChange={(e) =>
              setInterviewData((prev) => ({
                ...prev,
                position: e.target.value,
              }))
            }
          />
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 dark:text-primary-400">
            <Building size={18} />
          </div>
          <Select
            onValueChange={(val) =>
              setInterviewData((prev) => ({ ...prev, company: val }))
            }
          >
            <SelectTrigger className="pl-10 border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">
              <SelectValue placeholder="Company Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-800">
              {options.company.map((item) => (
                <SelectItem key={item} value={item} className="text-gray-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600">
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 dark:text-primary-400">
            <BookOpen size={18} />
          </div>
          <Select
            onValueChange={(val) =>
              setInterviewData((prev) => ({ ...prev, industry: val }))
            }
          >
            <SelectTrigger className="pl-10 border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-800 max-h-60">
              {options.industry.map((item) => (
                <SelectItem key={item} value={item} className="text-gray-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600">
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 dark:text-primary-400">
            <Clock size={18} />
          </div>
          <Select
            onValueChange={(val) =>
              setInterviewData((prev) => ({
                ...prev,
                experience: `${val} years`,
              }))
            }
          >
            <SelectTrigger className="pl-10 border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">
              <SelectValue placeholder="Experience Level" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-800">
              {options.experience.map((item) => (
                <SelectItem key={item} value={item} className="text-gray-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600">
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
function JobDataCard({ job }) {
  useEffect(() => { console.log("in job card") }, []);
  const timeAgo = (postedAt) => {
    const diffMs = Date.now() - new Date(postedAt).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return new Date(postedAt).toLocaleDateString();
  };
  return (
    <>
      {job ? (
        <div className="text-black dark:text-white">
          <div className="flex flex-row p-2"> <h3 className="mr-2">Job Title: </h3> {" "} <h2>{job.title ? job.title : "title"}</h2></div>
          <div className="flex flex-row p-2"> <h3 className="mr-2">Company: </h3> {" "}<a href={job.company.website} target="_blank"><h2>{job.company ? job.company.name : "company"}</h2></a></div>
          <div className="flex flex-row p-2"> <h3 className="mr-2">Posted: </h3>{" "} <h2>{timeAgo(job.postedAt)}</h2></div>
        </div>
      ) : (
        <div>
          <h2>no job</h2>
          <Link to={"/jobs"}><h2 className="text-black dark:text-white">Find Jobs to practice interview</h2></Link>
        </div>
      )}
    </>
  )
}