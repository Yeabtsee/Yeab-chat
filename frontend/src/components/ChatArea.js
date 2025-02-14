import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faPaperPlane,
  faImage,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { saveAs } from "file-saver";
import socket from "../socket";

const ChatArea = ({
  username,
  message,
  setMessage,
  messages,
  setMessages,
  profiles,
  setUsers,
  selectedUser,
  setSelectedUser,
  typingUser,
  isMobile,
}) => {
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [enlargedImage, setEnlargedImage] = useState(null);

  // Function to scroll to the last message
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendPrivateMessage = async () => {
    // Either text or an image must be sent.
    if (!message.trim() && !imageFile) return;
    if (!selectedUser?.participants) return;

    const targetUserId = selectedUser.participants.find((p) => p !== username);
    let imageUrl = null;

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadResponse = await fetch(
          "http://localhost:5000/api/conversations/upload-image",
          { method: "POST", body: formData }
        );

        if (!uploadResponse.ok) throw new Error("Image upload failed");

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
      }

      // Create a new message object (include text and/or imageUrl)
      const newMessage = {
        sender: username,
        text: message.trim(), // could be empty if only image is sent
        imageUrl, // may be null if no image
        timestamp: new Date().toISOString(),
        type: "sent",
        status: "sent",
      };

      // Update local UI immediately
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");

      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) => {
          if (user.participants.includes(targetUserId)) {
            return {
              ...user,
              messages: [...user.messages, newMessage],
            };
          }
          return user;
        });
        if (!updatedUsers.some((u) => u.participants.includes(targetUserId))) {
          updatedUsers.push({
            participants: [username, targetUserId],
            messages: [newMessage],
          });
        }
        return updatedUsers.sort((a, b) => {
          const aLast = a.messages[a.messages.length - 1]?.timestamp || 0;
          const bLast = b.messages[b.messages.length - 1]?.timestamp || 0;
          return new Date(bLast) - new Date(aLast);
        });
      });

      // Send the message data to your server
      await fetch("http://localhost:5000/api/conversations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: username,
          targetUserId,
          message: newMessage.text,
          imageUrl: newMessage.imageUrl, // Include image URL if available
        }),
      });

      // Emit via socket
      socket.emit("send_private_message", {
        message: newMessage.text,
        imageUrl: newMessage.imageUrl, // Send along the image URL if present
        receiverUsername: targetUserId,
        sender: username,
        timestamp: newMessage.timestamp,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send image. Please try again.");
    } finally {
      setImageFile(null);
      setImagePreview(null);
    }
  };
  // Add image preview handling
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  // Handle typing as before
  const handleTyping = () => {
    if (selectedUser) {
      const receiverUsername = selectedUser.participants.find(
        (p) => p !== username
      );
      socket.emit("start_typing", {
        receiverUsername,
        senderUsername: username,
      });
      setTimeout(() => socket.emit("stop_typing", receiverUsername), 5000);
    }
  };

  // Existing effect for marking unseen messages as seen...
  useEffect(() => {
    if (selectedUser) {
      const unseenMessages = messages.filter(
        (msg) => msg.sender !== username && msg.status === "sent"
      );
      if (unseenMessages.length > 0) {
        unseenMessages.forEach((msg) => {
          socket.emit("message_seen", {
            sender: msg.sender,
            timestamp: msg.timestamp,
            receiver: username,
          });
        });
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.sender !== username && msg.status === "sent"
              ? { ...msg, status: "pending" }
              : msg
          )
        );
      }
    }
  }, [selectedUser, messages, username]);

  useEffect(() => {
    const handleStatusUpdate = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.timestamp === data.timestamp && msg.sender === username
            ? { ...msg, status: data.status }
            : msg
        )
      );
    };

    socket.on("update_message_status", handleStatusUpdate);
    return () => socket.off("update_message_status", handleStatusUpdate);
  }, [username]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Build message elements with date separators
  let lastDate = null;
  const messageElements = messages.map((msg, idx) => {
    const msgDate = new Date(msg.timestamp).toDateString();
    let divider = null;
    if (msgDate !== lastDate) {
      divider = (
        <div
          key={`divider-${idx}`}
          className="date-divider"
          style={{
            textAlign: "center",
            margin: "10px 0",
            fontSize: "12px",
            color: "#b9bbbe",
          }}
        >
          {msgDate}
        </div>
      );
      lastDate = msgDate;
    }
    return (
      <React.Fragment key={idx}>
        {divider}
        <div
          className={`message ${
            msg.sender === username ? "sent" : "received"
          } ${msg.imageUrl ? "image-message" : ""}`}
          style={{
            alignSelf: msg.sender === username ? "flex-end" : "flex-start",
            padding: msg.imageUrl ? "0px 0 5px 0" : "",
            cursor: msg.imageUrl ? "pointer" : "",
          }}
        >
          {/* Render image if available */}
          {msg.imageUrl && (
            <img
              src={msg.imageUrl}
              alt="Sent content"
              style={{
                width: "100%",
                maxWidth: "300px",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
              }}
              onClick={() => setEnlargedImage(msg.imageUrl)}
            />
          )}
          {/* Render text if available */}
          {msg.text && (
            <p className="message-text" style={{ margin: "8px 0 0 5px" }}>
              {msg.text}
            </p>
          )}
          <span className="message-time" style={{ marginLeft: "5px" }}>
            {formatTimestamp(msg.timestamp)}
            {msg.sender === username && (
              <span
                className="message-status"
                style={{
                  marginLeft: "5px",
                  fontSize: "10px",
                  color: "#b9bbbe",
                }}
              >
                {msg.status === "seen" ? "✓✓" : "✓"}
              </span>
            )}
          </span>
        </div>
      </React.Fragment>
    );
  });

  const getFilenameFromUrl = (url) => {
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  const handleDownload = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    saveAs(blob, getFilenameFromUrl(url));
  };

  return (
    <div className="chat-area">
      <div className="chat-header">
        {isMobile && selectedUser && (
          <button
            style={{
              fontSize: "30px",
              color: "rgb(86, 109, 222)",
              marginLeft: "-5px",
              cursor: "pointer",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "10%",
            }}
            onClick={() => setSelectedUser(null)}
          >
            <FontAwesomeIcon width="37px" icon={faChevronLeft} />
          </button>
        )}
        {selectedUser ? (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: isMobile ? "0" : "45%",
              }}
            >
              <h3 className="username" style={{ marginBottom: "2px" }}>
                {selectedUser.participants.find((p) => p !== username)}
              </h3>
              {typingUser.split(" ")[0] ===
              selectedUser.participants.find((p) => p !== username) ? (
                <p
                  style={{
                    alignSelf: "center",
                    fontSize: "12px",
                    color: "#999",
                    marginTop: "0px",
                  }}
                >
                  Typing...
                </p>
              ) : null}
            </div>
            {profiles.find(
              (profile) =>
                profile.username ===
                selectedUser.participants.find((p) => p !== username)
            )?.avatar ? (
              <img
                src={
                  profiles.find(
                    (profile) =>
                      profile.username ===
                      selectedUser.participants.find((p) => p !== username)
                  )?.avatar
                }
                alt="User Avatar"
                className="user-avatar"
                style={{ backgroundColor: "transparent" }}
                onClick={() =>
                  setEnlargedImage(
                    profiles.find(
                      (profile) =>
                        profile.username ===
                        selectedUser.participants.find((p) => p !== username)
                    )?.avatar
                  )
                }
              />
            ) : (
              <span className="user-avatar">
                {selectedUser.participants
                  .find((p) => p !== username)[0]
                  .toUpperCase()}
              </span>
            )}
          </>
        ) : (
          <h3 style={{ marginLeft: "45%" }}>Select a user</h3>
        )}
      </div>

      <div className="chat-messages">
        {messageElements}
        <div ref={chatEndRef} />
      </div>
      {/* Image Overlay */}
      {enlargedImage && (
        <div className="image-overlay" onClick={() => setEnlargedImage(null)}>
          <img
            src={enlargedImage}
            alt="Enlarged content"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
          />
          <div
            className="overlay-controls"
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              display: "flex",
              gap: "10px",
            }}
          >
            {console.log(getFilenameFromUrl(enlargedImage))}
            <a
              href="#"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(enlargedImage);
              }}
              style={{
                color: "#fff",
                fontSize: "24px",
                textDecoration: "none",
              }}
            >
              <FontAwesomeIcon icon={faDownload} />
            </a>
            <div
              className=""
              style={{
                color: "#fff",
                fontSize: "24px",
                cursor: "pointer",
                marginLeft: "10px",
                width: "30px",
              }}
              onClick={() => setEnlargedImage(null)}
            >
              X
            </div>
          </div>
        </div>
      )}
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Preview" />
          <button
            onClick={() => {
              setImageFile(null);
              setImagePreview(null);
            }}
          >
            ×
          </button>
        </div>
      )}

      <div
        className="chat-input"
        style={{ display: "flex", alignItems: "center" }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            handleTyping();
            if (e.key === "Enter") {
              e.preventDefault();
              handleSendPrivateMessage();
            }
          }}
          placeholder="Type your message..."
          disabled={!selectedUser}
        />
        <button
          className="send-message"
          style={{ backgroundColor: "transparent" }}
          onClick={handleSendPrivateMessage}
          disabled={!selectedUser}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
        {/* Image selection button */}
        <button
          type="button"
          className="image-upload"
          onClick={() => fileInputRef.current.click()}
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "30px",
            color: "#5865f2",
          }}
          disabled={!selectedUser}
        >
          <FontAwesomeIcon icon={faImage} />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              const file = e.target.files[0];
              if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                setError("Image size must be less than 5MB");
                return;
              }
              setImageFile(file);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ChatArea;
