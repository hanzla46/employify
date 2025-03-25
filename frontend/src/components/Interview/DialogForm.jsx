import { useState } from "react";
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
import { Spinner } from "../../lib/Spinner";
const options = {
  company: ["Multinational", "Midsized", "Startup"],
  industry: [
    "Health",
    "Tech",
    "Govt",
    "Others",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Telecommunications",
    "Energy",
    "Entertainment",
    "Transportation",
    "Real Estate",
    "Hospitality",
    "Agriculture",
    "Pharmaceuticals",
    "Legal",
    "Media",
    "Automotive",
  ],
  experience: ["0-1", "1-3", "3-5", "5-10", "10+"],
};

export default function DialogForm({ start, setInterviewData, interviewData }) {
  const [loading, setLoading] = useState(false);
  const startIt = () => {
    if(interviewData.position === "" || interviewData.company === "" || interviewData.industry === "" || interviewData.experience === ""){
        handleError("Please fill all the fields");
        return;
    }
    setLoading(true);
    start();
    setLoading(false);
  }
  
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
      </CardContent>
    </Card>
  );
}