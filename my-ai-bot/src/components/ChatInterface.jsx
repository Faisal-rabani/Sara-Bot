import React, { useState, useEffect, useRef } from "react";

const ChatInterface = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "What can i help with ?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, name: "Welcome Chat", date: "Today", active: true },
    { id: 2, name: "Project Planning", date: "Yesterday", active: false },
    { id: 3, name: "Code Review", date: "Dec 15", active: false },
    { id: 4, name: "Design Discussion", date: "Dec 14", active: false },
    { id: 5, name: "API Integration", date: "Dec 13", active: false },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ✅ Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Main sendMessage function (connected to backend)
  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: "user",
      timestamp: new Date(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await response.json();
      const aiReply =
        data.choices?.[0]?.message?.content ||
        data.reply || // if your backend returns { reply: "..." }
        "⚠️ No response from AI";

      // Add AI message
      const aiMessage = {
        id: Date.now() + 1,
        text: aiReply,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 2, text: "⚠️ Unable to connect to server.", sender: "ai", timestamp: new Date() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ✅ Send with Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ✅ Format timestamp
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Select a chat from sidebar
  const selectChat = (chatId) => {
    setChatHistory((prev) =>
      prev.map((chat) => ({ ...chat, active: chat.id === chatId }))
    );
    setMessages([
      {
        id: 1,
        text: "What can help you today ?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  // ✅ Create a new chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      name: "New Chat",
      date: "Now",
      active: true,
    };
    setChatHistory((prev) => [
      newChat,
      ...prev.map((chat) => ({ ...chat, active: false })),
    ]);
    setMessages([
      {
        id: 1,
        text: "What can i help you ?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="contaner bg-gray-50 flex h-screen">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0"
        } bg-gray-900 text-white overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={createNewChat}
            className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left flex items-center gap-3"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={`p-3 rounded-lg cursor-pointer mb-1 ${
                chat.active ? "bg-gray-700" : "hover:bg-gray-800"
              }`}
            >
              <div className="font-medium text-sm truncate">{chat.name}</div>
              <div className="text-xs text-gray-400 mt-1">{chat.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="head_con bg-white border-b border-gray-200 p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn bg-slate-800 p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="w-5 h-5 "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="tital">
            <h1 className="text-lg font-semibold text-gray-900">SageBot</h1>
            <p className="text-sm text-gray-500">Always here to help</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex justify-center">
          <div className="w-full max-w-2xl space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 shadow-sm border border-gray-200"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 shadow-sm border px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-400"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <textarea
              ref={inputRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="1"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!currentMessage.trim()}
              className={`p-3 rounded-xl ${
                currentMessage.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
