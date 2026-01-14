import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Avatar, AvatarImage, AvatarFallback } from "../core/avatar";
import { getFileUrl } from "../../lib/utils";
import { ArrowLeft, Send, Image as ImageIcon, Smile, X } from "lucide-react";
import Button from "../core/Button";
import Input from "../core/Input";
import Spinner from "../core/Spinner";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import "../../css/pages/Chat.css";

export default function ChatView() {
    const {
        conversations,
        fetchConversations,
        selectedConversation,
        setSelectedConversation,
        messages,
        fetchMessages,
        sendNewMessage,
        isConversationsLoading,
        socket,
        typingUsers,
        onlineUsers
    } = useChatStore();

    const { user: currentUser } = useAuthStore();

    const [inputText, setInputText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    const isOtherUserTyping = selectedConversation && typingUsers[selectedConversation._id];

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;

            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            scrollToBottom();
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [messages, isOtherUserTyping, imagePreview, selectedConversation]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (selectedConversation?._id && !selectedConversation.isNewConversation) {
            fetchMessages(selectedConversation._id);
        } else if (selectedConversation?.isNewConversation) {
            useChatStore.setState({ messages: [] });
        }
    }, [selectedConversation?._id, selectedConversation?.isNewConversation, fetchMessages]);

    const handleInputChange = (e) => {
        setInputText(e.target.value);
        if (!socket || !selectedConversation || selectedConversation.isNewConversation) return;
        if (!isTyping) {
            setIsTyping(true);
            socket.emit("typing", {
                conversationId: selectedConversation._id,
                receiverId: selectedConversation.otherUser._id
            });
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", {
                conversationId: selectedConversation._id,
                receiverId: selectedConversation.otherUser._id
            });
            setIsTyping(false);
        }, 2000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                if (file.size > 5 * 1024 * 1024) {
                    toast.error("File too large (max 5MB)");
                    return;
                }
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
            } else {
                toast.error("Please select an image");
            }
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleEmojiClick = (emojiObject) => {
        setInputText((prev) => prev + emojiObject.emoji);
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() && !imageFile) return;
        const receiverId = selectedConversation.otherUser._id;
        if (socket && selectedConversation._id) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            socket.emit("stopTyping", {
                conversationId: selectedConversation._id,
                receiverId: receiverId
            });
            setIsTyping(false);
        }
        const formData = new FormData();
        formData.append("text", inputText);
        if (imageFile) {
            formData.append("image", imageFile);
        }
        await sendNewMessage(receiverId, formData);
        setInputText("");
        removeImage();
        setShowEmojiPicker(false);
    };

    if (selectedConversation) {
        return (
            <div className="chat-room-container">
                <div className="chat-header">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="chat-header-user-info">
                        <Avatar className="w-8 h-8 border border-border-default">
                            <AvatarImage src={getFileUrl(selectedConversation.otherUser?.avatarUrl)} />
                            <AvatarFallback>{selectedConversation.otherUser?.username?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="chat-header-details">
                            <span className="leading-tight">{selectedConversation.otherUser?.username}</span>
                            {isOtherUserTyping && <span className="typing-text">typing...</span>}
                        </div>
                    </div>
                </div>

                <div className="messages-list" ref={messagesContainerRef}>
                    {messages.map((msg) => {
                        const isSender = (msg.sender?._id || msg.sender).toString() === currentUser._id.toString();
                        return (
                            <div key={msg._id} className={`message-bubble ${isSender ? "msg-sent" : "msg-received"}`}>
                                {msg.messageType === "image" && msg.mediaUrl && (
                                    <img
                                        src={getFileUrl(msg.mediaUrl)}
                                        alt="Message Attachment"
                                        className="message-image"
                                        onClick={() => window.open(getFileUrl(msg.mediaUrl), "_blank")}
                                        onLoad={scrollToBottom}
                                    />
                                )}
                                {msg.text && <span>{msg.text}</span>}
                            </div>
                        );
                    })}
                </div>

                {imagePreview && (
                    <div className="chat-image-preview-area">
                        <div className="preview-thumbnail-wrapper">
                            <img src={imagePreview} alt="Preview" className="preview-thumbnail" />
                            <button onClick={removeImage} className="preview-remove-btn">
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="chat-input-area">
                    {showEmojiPicker && (
                        <div className="emoji-picker-container">
                            <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={350} />
                        </div>
                    )}

                    <div className="chat-input-row">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />

                        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="chat-action-btn">
                            <ImageIcon size={20} />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`chat-action-btn ${showEmojiPicker ? 'is-active' : ''}`}>
                            <Smile size={20} />
                        </Button>

                        <Input
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={handleInputChange}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            className="chat-text-input"
                            rightElement={
                                <Button variant="ghost" size="icon" className="text-(--color-primary)" onClick={handleSendMessage}>
                                    <Send size={18} />
                                </Button>
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <div className="chat-list-area">
                {isConversationsLoading ? (
                    <div className="flex justify-center p-8">
                        <Spinner color="primary" />
                    </div>
                ) : conversations.length > 0 ? (
                    conversations.map((conv) => (
                        <div
                            key={conv._id}
                            className="conversation-item"
                            onClick={() => setSelectedConversation(conv)}
                        >
                            <Avatar className="w-12 h-12 border border-border-default">
                                <AvatarImage src={getFileUrl(conv.otherUser?.avatarUrl)} />
                                <AvatarFallback>{conv.otherUser?.username?.[0]}</AvatarFallback>
                            </Avatar>

                            <div className="conversation-info">
                                <div className="conv-user-row">
                                    {conv.otherUser?._id && onlineUsers.includes(conv.otherUser._id.toString()) && (
                                        <span className="online-badge-dot"></span>
                                    )}
                                    <span className="conv-user">{conv.otherUser?.username || "Deleted User"}</span>
                                </div>
                                <div className="conv-last-msg">
                                    {typingUsers[conv._id]
                                        ? <span className="typing-text">typing...</span>
                                        : (
                                            conv.lastMessage?.messageType === 'image'
                                                ? <><ImageIcon size={12} className="text-text-muted" /> <span className="text-text-muted">Image</span></>
                                                : (conv.lastMessage?.text || "Start chatting...")
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-text-muted opacity-60">
                        No conversations found.
                    </div>
                )}
            </div>
        </div>
    );
}