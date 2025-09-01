# AI Chatbot (React + FastAPI + Groq)

This is a full-stack chatbot application built with:
- **Frontend**: React + TypeScript
- **Backend**: FastAPI (Python)
- **AI Model**: Groq (LLaMA 3.1-8B-Instant)

The chatbot supports:
- Multiple conversations with history.
- Persistent storage of chat history using `localStorage`.
- Clean UI with sidebar for previous chats and "New Chat" button.

---

## Features
- Start new chats and switch between past ones.
- Persistent chat history even after refreshing.
- AI responses using Groq API.
- Message formatting for better readability.
---
Create a .env file in backend/:

GROQ_API_KEY=your_groq_api_key_here
