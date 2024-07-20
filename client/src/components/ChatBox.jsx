import React, { useState } from 'react';

const ChatBox = ({ user, recipient, messages, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleMessageSend = () => {
        if (newMessage.trim() !== '') {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <div>
            <h3>Chat with {recipient.name}</h3>
            <div style={{ height: '200px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
                {messages.map((msg, index) => (
                    <div key={index}>
                        {msg.senderId === user._id ? (
                            <div>
                                <strong>You: </strong>{msg.message}
                            </div>
                        ) : (
                            <div>
                                <strong>{recipient.name}: </strong>{msg.message}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{ marginTop: '10px' }}
            />
            <button onClick={handleMessageSend} style={{ marginLeft: '10px' }}>Send</button>
        </div>
    );
};

export default ChatBox;
