const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const videoSchema = new mongoose.Schema({
    title: { type: String, },
    description: { type: String },
    url: { type: String,},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    comments: [commentSchema],
    tags: [String],
    duration: { type: Number }, // duration in seconds
    views: { type: Number, default: 0 }
});

// Middleware to update the 'updatedAt' field on document save
videoSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
