const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        // required: true
    },
    purpose: {
        type: String,
        // required: true
    },
    address: {
        type: String,
        // required: true
    },
    price: {
        type: Number,
        // required: true
    },
    Mainimage: {
        type: String
    },
    images: [{
        type: String
    }],
    description: {
        type: String,
        // required: true
    },
    propertyType: {
        type: String,
        // required: true
    },
    bedRooms: {
        type: Number,
        // required: true
    },
    bathrooms: {
        type: Number,
        // required: true
    },
    builtUp: {
        type: Number,
        // required: true
    },
    plotSize: {
        type: Number,
        // required: true
    },
    furnishing: {
        type: String,
        // required: true
    },
    completion: {
        type: String,
        // required: true
    },
    usage: {
        type: String,
        // required: true
    },
    ownership: {
        type: String,
        // required: true
    },
    income: {
        type: Number
    },
    contactPersonName: {
        type: String,
        // required: true
    },
    contact: {
        type: String,
        // required: true
    },
    truCheck: {
        type: String,
        default: false
    },
    features: [{
        type: String
    }],
    referenceNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        // required: true
    },
    totalFloors: {
        type: Number,
        // required: true
    },
    totalParkingSpace: {
        type: Number,
        // required: true
    },
    elevators: {
        type: Number,
        // required: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
  