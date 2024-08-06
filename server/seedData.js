const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const PersonalLoanLead = require('./models/personalLoanLeadModel'); // Update the path to where your model is located

// Connect to MongoDB
mongoose.connect('mongodb+srv://abdullahjovera:pAh1IDi9VBvyUNl3@cluster0.kerlawf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { // Update with your MongoDB connection string
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const getRandomEnumValue = (enumArray) => enumArray[Math.floor(Math.random() * enumArray.length)];

const generateRandomData = async () => {
  const specificUserId = new mongoose.Types.ObjectId('6698e82a4b536144f00480b5'); // Use new mongoose.Types.ObjectId()

  const documents = [];

  for (let i = 0; i < 1000; i++) {
    documents.push({
      service: 'Personal Loan',
      client: new mongoose.Types.ObjectId(), // Use new mongoose.Types.ObjectId()
      selectedUsers: [specificUserId], // Include the specific ObjectId here
      stage: getRandomEnumValue(['New Lead', 'Marketing Lead', 'Rejected', 'Follow Up', 'Under Calculation', 'Final Discussion', 'Service App Req']),
      description: faker.lorem.sentence(),
      source: getRandomEnumValue(['Marketing', 'Telesales', 'Self']),
      labels: [faker.lorem.word()],
      transferredTo: {
        leadType: faker.lorem.word(),
        leadId: new mongoose.Types.ObjectId(), // Use new mongoose.Types.ObjectId()
      },
      transferredfrom: {
        leadType: faker.lorem.word(),
        leadId: new mongoose.Types.ObjectId(), // Use new mongoose.Types.ObjectId()
      },
      createdBy: new mongoose.Types.ObjectId(), // Use new mongoose.Types.ObjectId()
      updatedBy: new mongoose.Types.ObjectId(), // Use new mongoose.Types.ObjectId()
      discussions: [new mongoose.Types.ObjectId()], // Use new mongoose.Types.ObjectId()
      activityLogs: [new mongoose.Types.ObjectId()], // Use new mongoose.Types.ObjectId()
      files: [{
        url: faker.image.imageUrl(),
        filename: faker.system.commonFileName(),
      }],
      createdby: new mongoose.Types.ObjectId(), // Use new mongoose.Types.ObjectId()
      isconverted: faker.datatype.boolean(),
      delstatus: faker.datatype.boolean(),
      updatedby: [new mongoose.Types.ObjectId()], // Use new mongoose.Types.ObjectId()
    });
  }

  await PersonalLoanLead.insertMany(documents);
  console.log('1000 documents inserted successfully');
  mongoose.connection.close();
};

generateRandomData().catch((err) => {
  console.error('Error generating data:', err);
  mongoose.connection.close();
});
