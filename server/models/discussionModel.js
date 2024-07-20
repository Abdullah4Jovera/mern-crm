const mongoose = require('mongoose');
const { Schema } = mongoose;

const discussionSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  leadType: {
    type: String,
    required: true,
    // You can add specific validation or default values if needed
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'leadType', // Dynamic reference to different lead types
  },
}, { timestamps: true });

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;
