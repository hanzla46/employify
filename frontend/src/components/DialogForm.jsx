import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import FancyButton from "./Button";

const options = {
  company: ["Multinational", "Midsized", "Startup"],
  industry: [
    "Health", "Tech", "Govt", "Others", "Finance", "Education", "Retail", "Manufacturing",
    "Telecommunications", "Energy", "Entertainment", "Transportation", "Real Estate", "Hospitality",
    "Agriculture", "Pharmaceuticals", "Legal", "Media", "Automotive"
  ],
  experience: ["0-1", "1-3", "3-5", "5-10", "10+"],
};

export default function DialogForm({ start, setInterviewData, interviewData }) {
  return (
    <Card className="p-6 mt-10 space-y-6 w-72">
      <CardContent className="space-y-6">
        {/* Text Input */}
        <div className="space-y-1">
          <Label className="text-sm font-medium text-indigo-600 dark:text-white">Position</Label>
          <Input
            type="text"
            placeholder="Type something..."
            className="w-full"
            value={interviewData.position}
            onChange={(e) =>
              setInterviewData((prev) => ({ ...prev, position: e.target.value }))
            }
          />
        </div>

        {/* Dropdowns */}
        <div className="space-y-1">
          <Label className="text-sm font-medium text-indigo-600 dark:text-white">Select Company</Label>
          <Select
            onValueChange={(val) =>
              setInterviewData((prev) => ({ ...prev, company: val }))
            }
          >
            <SelectTrigger className="w-full text-indigo-600 dark:text-white">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              {options.company.map((item) => (
                <SelectItem className="bg-white" key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-medium text-indigo-600 dark:text-white">Select Industry</Label>
          <Select
            onValueChange={(val) =>
              setInterviewData((prev) => ({ ...prev, industry: val }))
            }
          >
            <SelectTrigger className="w-full text-indigo-600 dark:text-white">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              {options.industry.map((item) => (
                <SelectItem className="bg-white" key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-indigo-600 dark:text-white">Experience level (Years)</Label>
          <Select
            onValueChange={(val) =>
              setInterviewData((prev) => ({ ...prev, experience: `${val} years` }))
            }
          >
            <SelectTrigger className="w-full text-indigo-600 dark:text-white">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              {options.experience.map((item) => (
                <SelectItem className="bg-white" key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4">
          <FancyButton text="Start Interview" />
        </div>
      </CardContent>
    </Card>
  );
}


