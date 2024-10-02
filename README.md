Chatbot Application for Home Improvement Services
Objective
This project aims to develop an interactive chatbot application that guides users through a question-based flow to collect relevant information based on data provided in a CSV file related to home improvement services.

Technical Requirements
Frontend: Built using React with Vite for fast development.
Backend: Implemented using either FastAPI or Node.js.
CSV Integration: The chatbot reads and interprets data from a provided CSV file to facilitate user interactions.
Features
User Interaction Flow:

The chatbot engages users by asking relevant questions derived from the CSV file.
Utilizes a decision-tree approach to help users select appropriate services.
Collects a unique Service ID based on user responses.
Personal Information Collection:

After determining the Service ID, the chatbot collects the user's personal information, including:
Name
Email
Zip Code
Address
Phone Number
Submission Dialog:

Displays a confirmation dialog summarizing the collected information before submission.
