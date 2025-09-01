import React, { useState, useEffect, useRef } from "react";
import "./App.css";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

interface Conversation {
  id: string;
  messages: ChatMessage[];
  title: string;
}

const App = () => {
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  /* Load conversations from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("conversations");
    if (saved) {
      const parsed: Conversation[] = JSON.parse(saved);
      setConversations(parsed);
      setActiveConversation(parsed[0] || null);
    }
  }, []);

  /* Save to localStorage whenever conversations update */
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  /* Auto-scroll to bottom when new message arrives */
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  /* Start a new conversation */
  const newChat = () => {
    const id = Date.now().toString();
    const conv: Conversation = { id, messages: [], title: "New Chat" };
    setConversations([conv, ...conversations]);
    setActiveConversation(conv);
  };

  /* Clear current chat */
  const clearChat = () => {
    if (!activeConversation) return;
    const updated = conversations.map((c) =>
      c.id === activeConversation.id ? { ...c, messages: [] } : c
    );
    setConversations(updated);
    setActiveConversation({ ...activeConversation, messages: [] });
  };

  /* Update a conversation in state */
  const updateConversation = (conv: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? conv : c))
    );
    setActiveConversation(conv);
  };

  /* Send user message and fetch AI response */
  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeConversation || message.trim() === "") return;

    setLoading(true);

    // Add user message
    const userMsg: ChatMessage = { sender: "user", text: message };
    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMsg],
      title:
        activeConversation.title === "New Chat"
          ? message.slice(0, 15) + (message.length > 15 ? "..." : "")
          : activeConversation.title,
    };
    updateConversation(updatedConversation);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversation_id: activeConversation.id,
        }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();

      // Add AI message
      const aiMsg: ChatMessage = { sender: "ai", text: data.response };
      updateConversation({
        ...updatedConversation,
        messages: [...updatedConversation.messages, aiMsg],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* Format text for paragraphs */
  const formatMessage = (text: string) =>
    text.split("\n").map((line, i) => (
      <p key={i} style={{ marginBottom: "4px" }}>
        {line}
      </p>
    ));

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <button onClick={newChat} className="new-chat-btn">
          + New Chat
        </button>
        <div className="conversation-list">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`conversation-item ${
                activeConversation?.id === c.id ? "active" : ""
              }`}
              onClick={() => setActiveConversation(c)}
            >
              {c.title}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-box">
        <div className="chat-header">
          <h1>AI Chatbot</h1>
          <button onClick={clearChat} className="clear-btn">
            Clear Chat
          </button>
        </div>

        <div ref={chatContainerRef} className="chat-messages">
          {activeConversation?.messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              <div className="bubble">{formatMessage(msg.text)}</div>
            </div>
          ))}
          {loading && <div className="typing">AI is typing...</div>}
        </div>

        {activeConversation && (
          <form onSubmit={sendMessage} className="chat-input">
  <input
    type="text"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder="Type your message..."
    className="chat-input-box"
  />
  <button
    type="submit"
    disabled={loading || !message.trim()}
    className="send-btn"
  >
    ➤
  </button>
</form>

        )}
      </div>
    </div>
  );
};

export default App;
