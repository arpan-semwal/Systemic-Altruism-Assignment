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
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [askField, setAskField] = useState('');
  const [showSummary, setShowSummary] = useState(false); // State to control summary dialog visibility

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
    setZipCode('');
    setAskField('userName'); // Ask for user name next
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: 'What is your Name?' }
    ]);
  };

  const handleUserNameSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: userName }];
    setMessages(newMessages);
    setUserName('');
    setAskField('email'); // Ask for email next
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: 'What is your Email?' }
    ]);
  };

  const handleEmailSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: email }];
    setMessages(newMessages);
    setEmail('');
    setAskField('address'); // Ask for address next
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: 'What is your Address?' }
    ]);
  };

  const handleAddressSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: address }];
    setMessages(newMessages);
    setAddress('');
    setAskField('phoneNumber'); // Ask for phone number next
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'bot', content: 'What is your Phone Number?' }
    ]);
  };

  const handlePhoneNumberSubmit = () => {
    const newMessages = [...messages, { role: 'user', content: phoneNumber }];
    setMessages(newMessages);
    setPhoneNumber('');
    setShowSummary(true); // Show summary dialog
  };

  // Function to handle form submission
  const handleSummarySubmit = () => {
    alert(`
      Summary of Information:
      Zip Code: ${zipCode}
      Name: ${userName}
      Email: ${email}
      Address: ${address}
      Phone Number: ${phoneNumber}
    `);
    // Optionally, you could send this data to your backend or process it further
    setShowSummary(false); // Close the summary dialog
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

      {/* Summary Dialog */}
      {showSummary && (
        <div className="summary-dialog">
          <h3>Summary of Your Information</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleSummarySubmit(); }}>
            <div>
              <label>Zip Code:</label>
              <input type="text" value={zipCode} readOnly />
            </div>
            <div>
              <label>Name:</label>
              <input type="text" value={userName} readOnly />
            </div>
            <div>
              <label>Email:</label>
              <input type="email" value={email} readOnly />
            </div>
            <div>
              <label>Address:</label>
              <input type="text" value={address} readOnly />
            </div>
            <div>
              <label>Phone Number:</label>
              <input type="text" value={phoneNumber} readOnly />
            </div>
            <button type="submit">Submit</button>
            <button type="button" onClick={() => setShowSummary(false)}>Close</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;
