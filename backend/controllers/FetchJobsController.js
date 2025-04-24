const axios = require('axios');
const Job = require('../models/JobModel');
const fetchJobsJSearch = async (req, res) => {
  const options = {
    method: "GET",
    url: "https://jsearch.p.rapidapi.com/search",
    params: {
      query: "AI Engineer jobs",
      page: "2",
      num_pages: "2",
      country: "pk",
      date_posted: "week", //all, today, 3days, week, month
    },
    headers: {
      "x-rapidapi-key": "ff82a3cb34msh70d1e319df0556bp1011c1jsnf3a797ae2c39",
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);
    // console.log(response.data.data);
    const jobs = response.data.data.map((job) => ({
      title: job.job_title,
      id: job.job_id,
      company: {
        name: job.employer_name,
        logo: job.employer_logo,
        website: job.employer_website,
      },
      type: job.job_employment_type,
      salary: job.salary_min ? `${job.job_min_salary} - ${job.job_max_salary}` : "Not specified",
    //   skills: job.job_skills.split(",").map((skill) => skill.trim()),
      description: job.job_description,
      location: job.job_location,
      postedAt: job.job_posted_at_datetime_utc,
      source: "jsearch",
      externalLink: job.job_apply_link,
      applyOptions: job.apply_options,
      isRemote: job.job_is_remote,
    }));
    console.log(jobs);
    //save to database
    await Job.insertMany(jobs, { ordered: false });
    res.status(200).json({ message: "fetched", jobs:jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
  
};
const getJobs = async (req, res) => {
  try {
     const jobs = await Job.find();
    res.status(200).json({ message: "fetched", jobs: jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
}
module.exports = { fetchJobsJSearch , getJobs };
