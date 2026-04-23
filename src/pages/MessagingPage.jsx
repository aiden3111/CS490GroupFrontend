import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:5000");

const MessagingPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
    fetchConversations();
  }, [clientId, navigate]);

  useEffect(() => {
  socket.on("receive_message", (message) => {
    setMessages((prev) => [...prev, message]);
  });

  return () => {
    socket.off("receive_message");
  };
}, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/messaging/conversations/${clientId}`);
    const data = await res.json();
    setConversations(Array.isArray(data) ? data : []);
  };

  const openConversation = async (otherUser) => {
    setSelectedUser(otherUser);
    const room = [clientId, otherUser.other_user_id].sort().join("_");
    socket.emit("join", { room });

    const res = await fetch(`http://127.0.0.1:5000/api/messaging/${clientId}/${otherUser.other_user_id}`);
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;
    const room = [clientId, selectedUser.other_user_id].sort().join("_");
    socket.emit("send_message", {
      sender_id: clientId,
      receiver_id: selectedUser.other_user_id,
      content: newMessage,
      room,
    });
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleLogout = () => {
    localStorage.removeItem("authenticatedClientId");
    navigate("/LoginPage/");
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <ul className="nav-list">
          <li className="nav-item" onClick={() => navigate(`/LandingPage/${clientId}`)}>Dashboard</li>
          <li className="nav-item" onClick={() => navigate(`/MyCoach/${clientId}`)}>My Coach</li>
          <li className="nav-item" onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}>Workout Logs</li>
          <li className="nav-item" onClick={() => navigate(`/MealTrackPage/${clientId}`)}>Meal Tracker</li>
          <li className="nav-item" onClick={() => navigate(`/MoodTrackPage/${clientId}`)}>Mood Tracker</li>
          <li className="nav-item active">Messages</li>
          <li className="nav-item">Subscriptions</li>
          <li className="nav-item">Analytics</li>
          <li className="nav-item" onClick={() => navigate(`/UserProfile/${clientId}`)}>My Profile</li>
        </ul>
        <div className="sidebar-bottom">
          <button className="nav-item" onClickCapture={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="main-content">
        <div className="header">
          <h1>Messages</h1>
        </div>

        <div style={{ display: "flex", gap: "20px", height: "70vh" }}>
          {/* Left panel — conversations list */}
          <div style={{ width: "30%", borderRight: "1px solid #2e5c2e", overflowY: "auto" }}>
            <h3 style={{ padding: "10px" }}>Conversations</h3>
            {conversations.length === 0 ? (
              <p style={{ padding: "10px", color: "#aaa" }}>No conversations yet.</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.other_user_id}
                  onClick={() => openConversation(conv)}
                  className="mood-square"
                  style={{
                    cursor: "pointer",
                    backgroundColor: selectedUser?.other_user_id === conv.other_user_id ? "#1e3a1e" : "",
                    margin: "5px",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "bold" }}>{conv.first_name} {conv.last_name}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>{conv.last_message}</p>
                </div>
              ))
            )}
          </div>

          {/* Right panel — chat window */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {!selectedUser ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "#aaa" }}>Select a conversation to start messaging</p>
              </div>
            ) : (
              <>
                <div style={{ padding: "10px", borderBottom: "1px solid #2e5c2e" }}>
                  <h3>{selectedUser.first_name} {selectedUser.last_name}</h3>  
                  <p><strong>User Id:</strong> {selectedUser.other_user_id}</p>
                 
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.message_id}
                      style={{
                        display: "flex",
                        justifyContent: msg.sender_id === clientId ? "flex-end" : "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        className="mood-square"
                        style={{
                          maxWidth: "60%",
                          backgroundColor: msg.sender_id === clientId ? "#1e3a1e" : "#2a2a2a",
                          padding: "8px 12px",
                        }}
                      >
                        <p style={{ margin: 0 }}>{msg.content}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>
                          {new Date(msg.sent_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{ display: "flex", gap: "10px", padding: "10px", borderTop: "1px solid #2e5c2e" }}>
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ flex: 1 }}
                  />
                  <button className="nav-item" onClick={sendMessage}>Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;