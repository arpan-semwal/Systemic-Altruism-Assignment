// backend/server.js
const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const OpenAI = require('openai'); // Import OpenAI
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Load Excel data
const workbook = xlsx.readFile('./services.xlsx'); // Assuming data is in services.xlsx
const sheet_name_list = workbook.SheetNames;
const servicesData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use your OpenAI API key from .env
});

// Function to get distinct options for a specific question in a specific category
const getDistinctOptions = (categoryId, question) => {
  const services = servicesData.filter(service => service['Category ID'] == categoryId);
  const optionsSet = new Set();

  services.forEach(service => {
    const funnel = service['Question Funnel']?.split(' | ') || []; // Safely access Question Funnel
    const questionPart = funnel.find(f => f.includes(question));
    
    if (questionPart) {
      const option = questionPart.split('>')[1]?.trim(); // Safely access option
      if (option) { // Check if option is defined
        optionsSet.add(option);
      }
    }
  });

  return Array.from(optionsSet);
};


// Function to find service ID based on user answers
const getServiceId = (categoryId, answers) => {
  const services = servicesData.filter(service => service['Category ID'] == categoryId);
  
  return services.find(service => {
    const funnel = service['Question Funnel'].split(' | ');
    return funnel.every((q, idx) => {
      const [question, answer] = q.split(' > ');
      return answers[idx] === answer.trim();
    });
  });
};

// Get next question based on previous answers
const getNextQuestion = (categoryId, answers) => {
  const services = servicesData.filter(service => service['Category ID'] == categoryId);
  const matchedService = services.find(service => {
    const funnel = service['Question Funnel']?.split(' | ') || []; // Safely access Question Funnel
    return funnel.slice(0, answers.length).every((q, idx) => {
      const [question, answer] = q.split(' > ');
      return answers[idx] === answer?.trim(); // Safely access answer
    });
  });

  if (matchedService) {
    const funnel = matchedService['Question Funnel']?.split(' | ') || []; // Safely access Question Funnel
    if (answers.length < funnel.length) {
      const nextQuestion = funnel[answers.length]?.split('>')[0]?.trim(); // Safely access nextQuestion
      const options = getDistinctOptions(categoryId, nextQuestion);
      return { nextQuestion, options };
    }
  }

  return null;
};

// Function to use OpenAI to generate a question
const generateQuestionWithOpenAI = async (previousContext) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that guides users through home improvement service options.',
        },
        {
          role: 'user',
          content: previousContext,
        },
      ],
      max_tokens: 100,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating question with OpenAI:', error);
    return null;
  }
};

// Route to start the chatbot with the first question
app.post('/chat/start', async (req, res) => {
  const { categoryId } = req.body;

  // Get the first question for the given category
  const firstService = servicesData.find(service => service['Category ID'] == categoryId);
  if (!firstService) {
    return res.status(404).json({ error: "Category ID not found" });
  }

  const firstQuestion = firstService['Question Funnel'].split(' | ')[0].split('>')[0].trim(); // First question
  const options = getDistinctOptions(categoryId, firstQuestion);

  // Generate an initial question using OpenAI
  const openAIQuestion = await generateQuestionWithOpenAI(firstQuestion);

  res.json({
    question: openAIQuestion || firstQuestion,
    options
  });
});

// Route to handle the next question based on the previous answer
app.post('/chat/answer', async (req, res) => {
  const { categoryId, answers } = req.body;

  // Check if there is a next question
  const nextQuestionObj = getNextQuestion(categoryId, answers);

  if (nextQuestionObj) {
    // Generate the next question using OpenAI
    const openAIQuestion = await generateQuestionWithOpenAI(nextQuestionObj.nextQuestion);

    res.json({
      question: openAIQuestion || nextQuestionObj.nextQuestion,
      options: nextQuestionObj.options
    });
  } else {
    // If no next question, return the service ID
    const service = getServiceId(categoryId, answers);
    if (service) {
      res.json({
        message: "All questions answered.",
        serviceId: service['Service ID'],
      });
    } else {
      res.status(404).json({ error: "Service not found for the selected answers." });
    }
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
