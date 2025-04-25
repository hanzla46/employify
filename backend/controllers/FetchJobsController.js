const axios = require("axios");
const Profile = require("../models/ProfileModel.js");
const Job = require("../models/JobModel");
const { CalculateRelevancyScores } = require("../Services/JobScores.js");
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
      "x-rapidapi-key": "ff82a3cb34msh70d1e319df0556bp1011c1jsnf3a797ae2c39",
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
      salary: job.salary_min
        ? `${job.job_min_salary} - ${job.job_max_salary}`
        : 0,
      description: job.job_description,
      location: job.job_city,
      postedAt: new Date(job.job_posted_at_datetime_utc),
      source: "jsearch",
      externalLink: job.job_apply_link,
      applyOptions: job.apply_options,
      isRemote: job.job_is_remote,
      qualifications: job.job_highlights?.Qualifications || [],
      responsibilities: job.job_highlights?.Responsibilities || [],
    }));
    console.log(response.data.data);
    //save to database
    await Job.insertMany(jobs, { ordered: false });
    res.status(200).json({ message: "fetched", jobs: response.data.data });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching jobs", error: error.message });
  }
};
const getJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      const jobs = await Job.find();
      return res.status(200).json({ message: "fetched all jobs", jobs: jobs });
    }
    let skillRegex = null;
    if (profile.hardSkills && profile.hardSkills.length > 0) {
      const skillWords = profile.jobKeywords.map((s) =>
        s.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      );
      const pattern = skillWords.join("|");
      skillRegex = new RegExp(pattern, "i");
      console.log("Generated Skill Regex:", skillRegex);
    } else {
      console.log(
        `User ${userId} has no hard skills listed. No jobs will match skill criteria.`
      );
    }
    const locationOrRemoteConditions = [{ isRemote: true }];
    if (profile.location) {
      const userCityRegex = new RegExp(
        profile.location.city.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      locationOrRemoteConditions.push({ location: { $regex: userCityRegex } });
      const userCountryRegex = new RegExp(
        profile.location.country.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      locationOrRemoteConditions.push({
        location: { $regex: userCountryRegex },
      });
      console.log("Adding User City Location Condition:", {
        location: locationOrRemoteConditions,
      });
    } else {
      console.log(
        `User ${userId} has no city specified in profile. Location matching will only consider 'isRemote: true'.`
      );
    }
    const finalQuery = {
      $and: [
        skillRegex ? { description: { $regex: skillRegex } } : { _id: null },
        { $or: locationOrRemoteConditions },
      ],
    };
    console.log("Final Mongoose Query:", JSON.stringify(finalQuery, null, 2));
    const matchingJobs = await Job.find(finalQuery).lean();
    console.log(
      `Found ${matchingJobs.length} matching jobs for user ${userId}.`
    );
    let profileSummary =
      profile.summary ||
      "Full Stack Developer with 2 years of hands-on experience in building and deploying scalable web applications. Proficient in React, Next.js, Tailwind, Node.js, and MongoDB, with a strong foundation in REST APIs and authentication systems. Successfully completed multiple projects, including a career development platform with AI-driven resume analysis and interview simulations. Previously worked at a fast-paced startup, leading development of key features such as role-based access control and third-party integrations (Stripe, Google OAuth). Skilled in Git, Docker, and deploying apps via Vercel and DigitalOcean";
    const relevancyScores = await CalculateRelevancyScores(
      matchingJobs,
      profileSummary
    );
    const scoreMap = new Map(
      relevancyScores.map((item) => [item.id, item.score])
    );
    console.log("Relevancy Scores:", scoreMap);
    const sortedJobs = matchingJobs
      .map((job) => ({
        ...job,
        score: scoreMap.get(job._id.toString()) || 0,
      }))
      .sort((a, b) => b.score - a.score);
    res
      .status(200)
      .json({ message: "fetched matching jobs", jobs: sortedJobs });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching jobs", error: error.message });
  }
};
module.exports = { fetchJobsJSearch, getJobs };
