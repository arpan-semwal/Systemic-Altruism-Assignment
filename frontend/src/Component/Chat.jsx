/* eslint-disable react/prop-types */
import { useState } from 'react';
import axios from 'axios';
import './Chat.css'; // Optional: for styling

const Modal = ({ isOpen, onClose, summary }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Summary of Your Information</h3>
        <div>
          <strong>Zip Code:</strong> {summary.zipCode}
        </div>
        <div>
          <strong>Name:</strong> {summary.userName}
        </div>
        <div>
          <strong>Email:</strong> {summary.email}
        </div>
        <div>
          <strong>Address:</strong> {summary.address}
        </div>
        <div>
          <strong>Phone Number:</strong> {summary.phoneNumber}
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const UserDetailsForm = ({ userDetails, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="user-details-form">
      <h3>Your Information</h3>
      <div>
        <strong>Zip Code:</strong>
        <input type="text" value={userDetails.zipCode} readOnly />
      </div>
      <div>
        <strong>Name:</strong>
        <input type="text" value={userDetails.userName} readOnly />
      </div>
      <div>
        <strong>Email:</strong>
        <input type="email" value={userDetails.email} readOnly />
      </div>
      <div>
        <strong>Address:</strong>
        <input type="text" value={userDetails.address} readOnly />
      </div>
      <div>
        <strong>Phone Number:</strong>
        <input type="text" value={userDetails.phoneNumber} readOnly />
      </div>
      <button type="submit">Submit Information</button>
    </form>
  );
};

const Chat = () => {
  const [categoryId, setCategoryId] = useState('');
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [askField, setAskField] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState({});
  const [serviceId, setServiceId] = useState('');
  const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);

  const startChat = async () => {
    if (!categoryId) return;
  
    // Reset all saved fields when a new category is entered
    setZipCode('');
    setUserName('');
    setEmail('');
    setAddress('');
    setPhoneNumber('');
    setServiceId('');
    setAskField('');
    setShowUserDetailsForm(false);
    setShowSummary(false);
    setSummary({});
    
    // Reset the chat messages and options
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
    const newMessages = [...messages, { role: 'user', content: option }];
    setMessages(newMessages);
    setAnswers([...answers, option]);

    try {
      const response = await axios.post('http://localhost:5000/chat/answer', {
        categoryId,
        answers: [...answers, option],
      });

      if (response.data.serviceId) {
        setServiceId(response.data.serviceId);
        setAskField('zipCode');
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'bot', content: 'What is your Zip Code?' }
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

  const handleZipCodeSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: zipCode }];
    setMessages(newMessages);
    setAskField('userName');
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: 'What is your Name?' }
    ]);
  };

  const handleUserNameSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: userName }];
    setMessages(newMessages);
    setAskField('email');
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: 'What is your Email?' }
    ]);
  };

  const handleEmailSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: email }];
    setMessages(newMessages);
    setAskField('address');
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: 'What is your Address?' }
    ]);
  };

  const handleAddressSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: address }];
    setMessages(newMessages);
    setAskField('phoneNumber');
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: 'What is your Phone Number?' }
    ]);
  };

  const handlePhoneNumberSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: phoneNumber }];
    setMessages(newMessages);
    
    // Instead of showing the input fields again, we set the askField to null
    setAskField(null);
    setSummary({ zipCode, userName, email, address, phoneNumber });
    setShowUserDetailsForm(true); // Show the user details form
};
  const handleSubmitUserDetails = () => {
    // Handle the submission of the user details form here
    console.log("User details submitted:", summary);
    setShowUserDetailsForm(false); // Close the form after submission
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: `Thank you for providing the information. Your Service ID is ${serviceId}.` }
    ]);
    setShowSummary(true);
  };

  // Function to handle modal close
  const handleCloseSummary = () => {
    setShowSummary(false);
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

          {options.length > 0 && (
            <div className="options">
              {options.map((option, index) => (
                <button key={index} onClick={() => handleSendMessage(option)}>
                  {option}
                </button>
              ))}
            </div>
          )}

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

          {showUserDetailsForm && (
            <UserDetailsForm
              userDetails={{ zipCode, userName, email, address, phoneNumber }}
              onSubmit={handleSubmitUserDetails}
            />
          )}

          {showSummary && (
            <Modal
              isOpen={showSummary}
              onClose={handleCloseSummary}
              summary={summary}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
