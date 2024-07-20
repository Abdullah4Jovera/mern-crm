// utils/logActivity.js
const ActivityLog = require('../models/activityLogModel.js');

const logActivity = async (leadId, leadModel, action, userId, details = '') => {
  try {
    const newLog = new ActivityLog({
      leadId,
      leadModel,
      action,
      userId,
      details
    });
    await newLog.save();
    return newLog;
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = logActivity;
