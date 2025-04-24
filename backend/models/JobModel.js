const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  id: { type: String, required: true },
  company: {
    name: String,
    logo: String,
    website: String
  },
  location: String,
  type: { type: String, default: 'Full-time' },
  salary: String,
  skills: [String],
  description: String,
  postedAt: { type: String, default: "" },
  source: { type: String, enum: ['jsearch', 'fantastic_jobs', 'manual'], required: true },
  externalLink: String,
  isRemote: { type: Boolean, default: false },
  applyOptions: [{
    publisher: { type: String },
    apply_link: String,
    is_direct: { type: Boolean, default: false },
  }],


  // AI Meta Fields (for future matching engine)
  score: Number,
  relevanceTags: [String],
  aiNotes: String,

  // Raw payload from public APIs for logging/debugging
  rawData: { type: Object }
});

module.exports = mongoose.model('Job', JobSchema);
