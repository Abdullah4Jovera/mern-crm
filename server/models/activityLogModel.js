const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activityLogSchema = new Schema({
  leadId: { type: Schema.Types.ObjectId, required: true, refPath: 'leadModel' },
  leadModel: { type: String, required: true },
  action: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  details: { type: String }
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;