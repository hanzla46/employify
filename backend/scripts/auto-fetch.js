require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");
const Job = require("../models/JobModel"); // 🧠 your Mongoose model
const autoFetchJobs = async () => {
  const countries = ["PK", "US", "IN", "GB", "CA", "DE", "SG", "AU", "NL", "KE"];
  const queries = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Machine Learning Engineer",
    "AI Engineer",
    "Data Scientist",
    "Data Engineer",
    "Cloud Engineer",
    "Mobile App Developer",
    "Computer Vision Engineer",
    "NLP Engineer",
    "Cybersecurity Analyst",
    "QA Engineer",
    "Product Manager",
    "System Architect",
    "Embedded Systems Engineer",
    "Blockchain Developer",
    "Computer Science Researcher",
  ];
  const workModes = ["true", "false"];

  let keyIndex = 0;
  const apiKeys = ["ff82a3cb34msh70d1e319df0556bp1011c1jsnf3a797ae2c39"];

  function getNextApiKey() {
    const key = apiKeys[keyIndex];
    keyIndex = (keyIndex + 1) % apiKeys.length;
    return key;
  }

  try {
    for (const country of countries) {
      for (const query of queries) {
        for (const work_from_home of workModes) {
          let page = 1;
          while (page <= 100) {
            const options = {
              method: "GET",
              url: "https://jsearch.p.rapidapi.com/search",
              params: {
                query: `${query} jobs`,
                page: page,
                num_pages: 20,
                country,
                date_posted: "week",
                work_from_home,
              },
              headers: {
                "x-rapidapi-key": getNextApiKey(),
                "x-rapidapi-host": "jsearch.p.rapidapi.com",
              },
            };

            const maxRetries = 5;
            let retries = 0;
            let data = null;

            while (retries < maxRetries) {
              try {
                const response = await axios.request(options);
                data = response.data;
                break;
              } catch (err) {
                if (err.response && err.response.status === 502) {
                  retries++;
                  const waitTime = 1000 * retries;
                  console.warn(
                    `🛑 JSearch 502 error – retrying in ${waitTime / 1000}s (attempt ${retries}/${maxRetries})`
                  );
                  await new Promise((resolve) => setTimeout(resolve, waitTime));
                } else {
                  throw err;
                }
              }
            }

            if (!data) {
              console.error("💀 All retries failed. Skipping this request...");
              continue;
            }

            const jobs = data.data.map((job) => ({
              title: job.job_title,
              id: job.job_id,
              company: {
                name: job.employer_name,
                logo: job.employer_logo,
                website: job.employer_website,
              },
              type: job.job_employment_type,
              salary: job.salary_min ? `${job.job_min_salary} - ${job.job_max_salary}` : 0,
              description: job.job_description,
              location: job.job_city,
              postedAt: new Date(job.job_posted_at_datetime_utc),
              source: "jsearch",
              externalLink: job.job_apply_link,
              applyOptions: job.apply_options,
              isRemote: work_from_home === "true",
              qualifications: job.job_highlights?.Qualifications || [],
              responsibilities: job.job_highlights?.Responsibilities || [],
            }));

            console.log(
              `Pulled ${jobs.length} 🔥 jobs for ${query} in ${country} (remote=${work_from_home}) pages ${page}–${
                page + 19
              }`
            );

            try {
              await Job.insertMany(jobs, { ordered: false });
            } catch (err) {
              if (err.name === "BulkWriteError" && err.code === 11000) {
                console.warn("⚠️ Duplicate job(s) found, skipping those...");
              } else {
                console.error("❌ Unexpected DB error:", err.message);
              }
            }

            page += 20;
            await new Promise((r) => setTimeout(r, 1200)); // throttle ⚠️
          }
        }
      }
    }
    console.log("All jobs fetched successfully 🔥🧠");
  } catch (err) {
    console.error("Automation meltdown 🔥:", err.message);
  }
};
(async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB 🐱‍👤");
  await autoFetchJobs();
  process.exit(); // 🌚 peace out
})();
