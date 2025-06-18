const axios = require("axios");
const Profile = require("../models/ProfileModel.js");
const Job = require("../models/JobModel");
const fs = require("fs");

const fetchJobsJSearch = async (req, res) => {
  const { page, country, work_from_home, query } = req.query;
  const options = {
    method: "GET",
    url: "https://jsearch.p.rapidapi.com/search",
    params: {
      query: query + " jobs",
      page: page,
      num_pages: "10",
      country: country,
      date_posted: "week",
      work_from_home: work_from_home,
    },
    headers: {
      "x-rapidapi-key": "e7ff5ba837mshd385fbd3d86d521p1897fajsn6965aaf24cd6",
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);
    const jobs = response.data.data.map((job) => ({
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
      isRemote: work_from_home == "true" ? true : false,
      qualifications: job.job_highlights?.Qualifications || [],
      responsibilities: job.job_highlights?.Responsibilities || [],
    }));
    console.log(response.data.data);
    //save to database
    await Job.insertMany(jobs, { ordered: false });
    res.status(200).json({ message: "fetched", jobs: response.data.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
};

module.exports = {
  fetchJobsJSearch,
};
