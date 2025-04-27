import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hi there! I can help you with event planning and suggestions. How can I assist you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  // Function to format message content with proper Markdown-like styling
  const formatMessageContent = (content) => {
    // Process bold text (wrapped in ** **)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let formattedContent = content.replace(boldRegex, '<strong>$1</strong>');

    // Process bullet points
    const lines = formattedContent.split('\n');
    const processedLines = lines.map(line => {
      if (line.trim().startsWith('* ')) {
        return `<div class="flex items-start my-1">
                  <span class="inline-block w-2 h-2 mt-1.5 mr-2 bg-indigo-500 rounded-full"></span>
                  <span>${line.substring(2)}</span>
                </div>`;
      }
      return line;
    });

    return processedLines.join('\n');
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = { type: 'user', content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://gem-arc-backend.onrender.com/api/chatbot/query',
        { query: inputMessage },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessages((prev) => [...prev, { type: 'bot', content: response.data.response }]);
    } catch (error) {
      console.error('Error communicating with chatbot:', error);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', content: 'Sorry, I encountered an error. Please try again later.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-100000">
  {isOpen ? (
    <div className="flex flex-col w-[30rem] h-[40rem] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-300">
      <div className="bg-indigo-700 text-white p-6 flex justify-between items-center rounded-t-lg">
        <h3 className="font-semibold text-xl">GEM-ARC Assistant</h3>
        <button onClick={toggleChatbot} className="text-white hover:bg-indigo-800 rounded-full p-2 transition duration-300 ease-in-out">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-6 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-5 py-4 rounded-lg max-w-[85%] ${msg.type === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-lg'}`}>
              {msg.type === 'bot' ? (
                <div className="whitespace-pre-line formatted-message" dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-6">
            <div className="inline-block px-5 py-4 rounded-lg bg-white text-gray-800 rounded-bl-none shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="border-t border-gray-300 p-6">
  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
    <input
      type="text"
      value={inputMessage}
      onChange={handleInputChange}
      placeholder="Type your message..."
      className="w-full sm:flex-1 border px-4 py-2 rounded-md shadow-md text-base focus:outline-none focus:ring-2 focus:ring-indigo-700"
      disabled={isLoading}
    />
    <button
      type="submit"
      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-700"
      disabled={isLoading}
    >
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
        <span>Send</span>
      </div>
    </button>
  </div>
</form>

    </div>
  ) : (
    <button
      onClick={toggleChatbot}
      className="bg-indigo-600 text-white p-5 rounded-full shadow-2xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300 ease-in-out"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </button>
  )}

  <style jsx>{`
    .formatted-message strong {
      font-weight: 600;
    }
    .formatted-message div {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
  `}</style>
</div>

  );
};

export default Chatbot;