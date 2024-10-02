import { useState } from 'react';
import axios from 'axios';
import './Chat.css'; // Optional: for styling

const Chat = () => {
  const [categoryId, setCategoryId] = useState('');
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [userName, setUserName] = useState(''); // State for user's name
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [askField, setAskField] = useState(''); // State to track which field to ask for

  const startChat = async () => {
    if (!categoryId) return;

    // Reset chat state for new category
    setMessages([]);
    setOptions([]);
    setAnswers([]);
    setAskField('');

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
    const newMessages = [...messages, { role: 'user', content: option }];
    setMessages(newMessages);
    setAnswers([...answers, option]);

    try {
      const response = await axios.post('http://localhost:5000/chat/answer', {
        categoryId,
        answers: [...answers, option],
      });

      if (response.data.serviceId) {
        setMessages([...newMessages, { role: 'bot', content: `Service ID: ${response.data.serviceId}` }]);
        setAskField('zipCode'); // Enable ZIP code input
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'bot', content: 'What is your Zip Code?' } // Ask for Zip Code
        ]);
        setOptions([]);
      } else {
        setMessages([...newMessages, { role: 'bot', content: response.data.question }]);
        setOptions(response.data.options);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle ZIP code submission
  const handleZipCodeSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: zipCode }];
    setMessages(newMessages);
    setZipCode('');
    setAskField('userName'); // Ask for user name next
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: 'What is your Name?' } // Ask for Name
    ]);
  };

  // Handle User Name submission
  const handleUserNameSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: userName }];
    setMessages(newMessages);
    setUserName('');
    setAskField('email'); // Ask for email next
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: 'What is your Email?' } // Ask for Email
    ]);
  };

  // Handle Email submission
  const handleEmailSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: email }];
    setMessages(newMessages);
    setEmail('');
    setAskField('address'); // Ask for address next
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: 'What is your Address?' } // Ask for Address
    ]);
  };

  // Handle Address submission
  const handleAddressSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: address }];
    setMessages(newMessages);
    setAddress('');
    setAskField('phoneNumber'); // Ask for phone number next
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: 'What is your Phone Number?' } // Ask for Phone Number
    ]);
  };

  // Handle Phone Number submission
  const handlePhoneNumberSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: phoneNumber }];
    setMessages(newMessages);
    setPhoneNumber('');
    setMessages([...newMessages, { role: 'bot', content: 'Thank you for providing your information!' }]);
    setAskField(''); // Reset asking field
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
              <div
                key={index}
                className={msg.role === 'user' ? 'user-message' : 'bot-message'}
              >
                {msg.content}
              </div>
            ))}
          </div>

          {/* Show options if available */}
          {options.length > 0 && (
            <div className="options">
              {options.map((option, index) => (
                <button key={index} onClick={() => handleSendMessage(option)}>
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Show input for ZIP code if required */}
          {askField === 'zipCode' && (
            <div className="input-box">
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter your ZIP code"
              />
              <button onClick={handleZipCodeSubmit}>Submit ZIP code</button>
            </div>
          )}

          {/* Show input for User Name if required */}
          {askField === 'userName' && (
            <div className="input-box">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your Name"
              />
              <button onClick={handleUserNameSubmit}>Submit Name</button>
            </div>
          )}

          {/* Show input for Email if required */}
          {askField === 'email' && (
            <div className="input-box">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email"
              />
              <button onClick={handleEmailSubmit}>Submit Email</button>
            </div>
          )}

          {/* Show input for Address if required */}
          {askField === 'address' && (
            <div className="input-box">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your Address"
              />
              <button onClick={handleAddressSubmit}>Submit Address</button>
            </div>
          )}

          {/* Show input for Phone Number if required */}
          {askField === 'phoneNumber' && (
            <div className="input-box">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your Phone Number"
              />
              <button onClick={handlePhoneNumberSubmit}>Submit Phone Number</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
