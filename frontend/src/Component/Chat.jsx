// src/Chat.js
import  { useState } from 'react';
import axios from 'axios';
import './Chat.css'; // Optional: for styling

const Chat = () => {
  const [categoryId, setCategoryId] = useState('');
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const startChat = async () => {
    if (!categoryId) return;

    // Reset chat state for new category
    setMessages([]);
    setOptions([]);
    setAnswers([]);
    
    try {
      const response = await axios.post('http://localhost:5000/chat/start', { categoryId });
      setMessages([{ role: 'bot', content: response.data.question }]);
      setOptions(response.data.options);
      setIsChatOpen(true);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleSendMessage = async (option) => {
    setMessages([...messages, { role: 'user', content: option }]);
    setAnswers([...answers, option]);

    try {
      const response = await axios.post('http://localhost:5000/chat/answer', {
        categoryId,
        answers: [...answers, option],
      });

      if (response.data.serviceId) {
        setMessages([
          ...messages,
          { role: 'user', content: option },
          { role: 'bot', content: `Service ID: ${response.data.serviceId}` },
        ]);
        setOptions([]);
      } else {
        setMessages([
          ...messages,
          { role: 'user', content: option },
          { role: 'bot', content: response.data.question },
        ]);
        setOptions(response.data.options);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="category-input">
        <input
          type="text"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          placeholder="Enter Category ID"
        />
        <button onClick={startChat}>Start Chat</button>
      </div>

      {isChatOpen && (
        <div className="chat-box">
          <h2>Chatbot</h2>
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={msg.role === 'user' ? 'user-message' : 'bot-message'}>
                {msg.content}
              </div>
            ))}
          </div>

          <div className="options">
            {options.map((option, index) => (
              <button key={index} onClick={() => handleSendMessage(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
