import Conversation from "../models/conversation.js";
import { normalizeId, isValidId, idToString } from "../../utils/db/idUtils.js";

/**
 * Conversation Service
 * Handles all business logic for conversations and messages
 */

/**
 * Find or create a conversation between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<Object>} Conversation object
 */
export const findOrCreateConversation = async (userId1, userId2) => {
  if (!isValidId(userId1) || !isValidId(userId2)) {
    throw new Error("Invalid user IDs");
  }

  if (userId1 === userId2) {
    throw new Error("Cannot create conversation with yourself");
  }

  const user1Id = normalizeId(userId1);
  const user2Id = normalizeId(userId2);

  // Try to find existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [user1Id, user2Id] },
    isDeleted: false,
  })
    .populate("participants", "fullName email role professionalTitle verified")
    .populate("lastMessage")
    .lean();

  if (conversation) {
    return conversation;
  }

  // Create new conversation
  conversation = new Conversation({
    participants: [user1Id, user2Id],
    unreadCount: new Map(),
  });

  await conversation.save();

  // Populate and return
  return await Conversation.findById(conversation._id)
    .populate("participants", "fullName email role professionalTitle verified")
    .lean();
};

/**
 * Get all conversations for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {string} options.filter - Filter by type (all, trainers, speakers, orgs)
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.search - Search term
 * @returns {Promise<Object>} Conversations and pagination info
 */
export const getUserConversations = async (userId, options = {}) => {
  const {
    filter = "all",
    page = 1,
    limit = 20,
    search,
  } = options;

  if (!isValidId(userId)) {
    throw new Error("Invalid user ID");
  }

  const userObjId = normalizeId(userId);

  // Build query
  const query = {
    participants: userObjId,
    isDeleted: { $ne: true },
    $or: [
      { deletedBy: { $ne: userObjId } },
      { deletedBy: { $exists: false } },
    ],
  };

  // Filter by archived status
  if (options.archived !== undefined) {
    if (options.archived) {
      query.archivedBy = userObjId;
    } else {
      query.$or = [
        ...(query.$or || []),
        { archivedBy: { $ne: userObjId } },
        { archivedBy: { $exists: false } },
      ];
    }
  }

  // Get conversations
  const skip = (page - 1) * limit;

  let conversations = await Conversation.find(query)
    .populate("participants", "fullName email role professionalTitle verified")
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Filter by user type if specified
  if (filter !== "all") {
    const roleMap = {
      trainers: "trainer",
      speakers: "speaker",
      orgs: "organiser",
    };
    const targetRole = roleMap[filter];
    if (targetRole) {
      // Normalize userId to string for comparison
      const userIdStr = userObjId.toString();
      conversations = conversations.filter((conv) => {
        // Find the other participant (not the current user)
        // Compare using both ObjectId and string formats to ensure accuracy
        const otherParticipant = conv.participants.find((p) => {
          const participantId = p._id?.toString() || p._id;
          return participantId !== userIdStr && participantId !== userId && participantId !== userObjId.toString();
        });
        // Only include if the other participant exists and has the target role
        return otherParticipant && otherParticipant.role === targetRole;
      });
    }
  }

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    conversations = conversations.filter((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== userId
      );
      if (!otherParticipant) return false;

      return (
        otherParticipant.fullName?.toLowerCase().includes(searchLower) ||
        otherParticipant.professionalTitle?.toLowerCase().includes(searchLower) ||
        (conv.lastMessage?.content?.toLowerCase().includes(searchLower))
      );
    });
  }

  // Transform conversations for frontend
  const transformedConversations = conversations.map((conv) => {
    const otherParticipant = conv.participants?.find(
      (p) => p._id?.toString() !== userId
    );
    
    // Get last message from messages array (messages are embedded, not referenced)
    const lastMessage = conv.messages && Array.isArray(conv.messages) && conv.messages.length > 0
      ? conv.messages[conv.messages.length - 1]
      : null;
    
    // Handle Map type for unreadCount
    let unreadCount = 0;
    if (conv.unreadCount) {
      if (conv.unreadCount instanceof Map) {
        unreadCount = conv.unreadCount.get(userId) || 0;
      } else if (typeof conv.unreadCount === 'object') {
        // When using .lean(), Map becomes a plain object
        const userIdStr = typeof userId === 'string' ? userId : userId?.toString();
        unreadCount = conv.unreadCount[userIdStr] || conv.unreadCount[userId] || 0;
      }
    }

    return {
      id: conv._id?.toString() || conv.id?.toString() || "",
      name: otherParticipant?.fullName || "Unknown",
      role: otherParticipant?.professionalTitle || otherParticipant?.role || "",
      avatar: otherParticipant?.fullName
        ? otherParticipant.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "U",
      verified: otherParticipant?.verified || false,
      lastMessage: lastMessage?.content || "",
      timestamp: lastMessage?.createdAt || conv.lastMessageAt || conv.createdAt || new Date().toISOString(),
      unread: unreadCount,
      conversationId: conv._id?.toString() || conv.id?.toString() || "",
    };
  });

  const total = await Conversation.countDocuments(query);

  return {
    conversations: transformedConversations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single conversation by ID
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID (to verify access)
 * @returns {Promise<Object>} Conversation object
 */
export const getConversationById = async (conversationId, userId) => {
  if (!isValidId(conversationId) || !isValidId(userId)) {
    throw new Error("Invalid conversation ID or user ID");
  }

  const convObjId = normalizeId(conversationId);
  const userObjId = normalizeId(userId);

  const conversation = await Conversation.findOne({
    _id: convObjId,
    participants: userObjId,
    isDeleted: { $ne: true },
    $or: [
      { deletedBy: { $ne: userObjId } },
      { deletedBy: { $exists: false } },
    ],
  })
    .populate("participants", "fullName email role professionalTitle verified")
    .lean();

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return conversation;
};

/**
 * Send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} senderId - Sender user ID
 * @param {Object} messageData - Message data
 * @param {string} messageData.content - Message content
 * @param {Array} messageData.attachments - Message attachments
 * @returns {Promise<Object>} Created message
 */
export const sendMessage = async (conversationId, senderId, messageData) => {
  const { content, attachments = [] } = messageData;

  if (!isValidId(conversationId) || !isValidId(senderId)) {
    throw new Error("Invalid conversation ID or sender ID");
  }

  if (!content || !content.trim()) {
    throw new Error("Message content is required");
  }

  const convObjId = normalizeId(conversationId);
  const senderObjId = normalizeId(senderId);

  // Verify conversation exists and user is a participant
  const conversation = await Conversation.findOne({
    _id: convObjId,
    participants: senderObjId,
    isDeleted: { $ne: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  // Create message
  const message = {
    sender: senderObjId,
    content: content.trim(),
    read: false,
    attachments: attachments || [],
  };

  // Add message to conversation
  conversation.messages.push(message);
  conversation.lastMessageAt = new Date();

  // Update unread count for other participants
  conversation.participants.forEach((participantId) => {
    if (participantId.toString() !== senderId) {
      const participantIdStr = participantId.toString();
      // Ensure unreadCount is a Map
      if (!(conversation.unreadCount instanceof Map)) {
        conversation.unreadCount = new Map();
      }
      const currentCount = conversation.unreadCount.get(participantIdStr) || 0;
      conversation.unreadCount.set(participantIdStr, currentCount + 1);
    }
  });

  await conversation.save();

  // Get the created message (last one in array)
  const createdMessage = conversation.messages[conversation.messages.length - 1];

  // Populate sender info
  const populatedMessage = await Conversation.findById(conversation._id)
    .populate("messages.sender", "fullName email role professionalTitle verified")
    .lean();

  const lastMessage = populatedMessage.messages[populatedMessage.messages.length - 1];

  return {
    id: lastMessage._id.toString(),
    sender: lastMessage.sender._id.toString(),
    senderName: lastMessage.sender.fullName || "User",
    content: lastMessage.content,
    timestamp: lastMessage.createdAt,
    read: lastMessage.read,
    reactions: lastMessage.reactions || [],
    attachments: lastMessage.attachments || [],
  };
};

/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID (to verify access)
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} Messages and pagination info
 */
export const getConversationMessages = async (conversationId, userId, options = {}) => {
  const { page = 1, limit = 50 } = options;

  if (!isValidId(conversationId) || !isValidId(userId)) {
    throw new Error("Invalid conversation ID or user ID");
  }

  const convObjId = normalizeId(conversationId);
  const userObjId = normalizeId(userId);

  const conversation = await Conversation.findOne({
    _id: convObjId,
    participants: userObjId,
    isDeleted: { $ne: true },
  })
    .populate("messages.sender", "fullName email role professionalTitle verified")
    .lean();

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  // Get messages (reverse for pagination - newest first)
  const messages = conversation.messages || [];
  const total = messages.length;
  const skip = (page - 1) * limit;

  // Reverse to get newest first, then slice
  const paginatedMessages = messages
    .slice()
    .reverse()
    .slice(skip, skip + limit)
    .reverse(); // Reverse again to get oldest first for display

  // Transform messages for frontend
  const transformedMessages = paginatedMessages.map((msg) => {
    const senderId = msg.sender._id.toString();
    // Normalize both IDs to strings for comparison
    const userIdStr = userObjId.toString();
    const senderIdStr = senderId.toString();
    const isUser = senderIdStr === userIdStr;

    return {
      id: msg._id.toString(),
      sender: isUser ? "user" : "other",
      senderName: msg.sender.fullName || "User",
      content: msg.content,
      timestamp: msg.createdAt,
      read: msg.read || false,
      reactions: msg.reactions || [],
      attachments: msg.attachments || [],
    };
  });

  return {
    messages: transformedMessages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Mark messages as read
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated conversation
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  if (!isValidId(conversationId) || !isValidId(userId)) {
    throw new Error("Invalid conversation ID or user ID");
  }

  const convObjId = normalizeId(conversationId);
  const userObjId = normalizeId(userId);

  const conversation = await Conversation.findOne({
    _id: convObjId,
    participants: userObjId,
    isDeleted: { $ne: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  // Mark all messages from other participants as read
  conversation.messages.forEach((msg) => {
    if (msg.sender.toString() !== userId && !msg.read) {
      msg.read = true;
      msg.readAt = new Date();
    }
  });

  // Reset unread count for this user
  // Ensure unreadCount is a Map
  if (!(conversation.unreadCount instanceof Map)) {
    conversation.unreadCount = new Map();
  }
  conversation.unreadCount.set(userId, 0);

  await conversation.save();

  return conversation;
};

/**
 * Archive a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated conversation
 */
export const archiveConversation = async (conversationId, userId) => {
  if (!isValidId(conversationId) || !isValidId(userId)) {
    throw new Error("Invalid conversation ID or user ID");
  }

  const convObjId = normalizeId(conversationId);
  const userObjId = normalizeId(userId);

  const conversation = await Conversation.findOne({
    _id: convObjId,
    participants: userObjId,
    isDeleted: { $ne: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  if (!conversation.archivedBy.includes(userObjId)) {
    conversation.archivedBy.push(userObjId);
  }

  await conversation.save();

  return conversation;
};

/**
 * Unarchive a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated conversation
 */
export const unarchiveConversation = async (conversationId, userId) => {
  if (!isValidId(conversationId) || !isValidId(userId)) {
    throw new Error("Invalid conversation ID or user ID");
  }

  const convObjId = normalizeId(conversationId);
  const userObjId = normalizeId(userId);

  const conversation = await Conversation.findOne({
    _id: convObjId,
    participants: userObjId,
    isDeleted: { $ne: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  conversation.archivedBy = conversation.archivedBy.filter(
    (id) => id.toString() !== userId
  );

  await conversation.save();

  return conversation;
};

/**
 * Delete a conversation (soft delete)
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated conversation
 */
export const deleteConversation = async (conversationId, userId) => {
  if (!isValidId(conversationId) || !isValidId(userId)) {
    throw new Error("Invalid conversation ID or user ID");
  }

  const convObjId = normalizeId(conversationId);
  const userObjId = normalizeId(userId);

  const conversation = await Conversation.findOne({
    _id: convObjId,
    participants: userObjId,
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  if (!conversation.deletedBy.includes(userObjId)) {
    conversation.deletedBy.push(userObjId);
  }

  // If all participants have deleted, mark as deleted
  if (conversation.deletedBy.length === conversation.participants.length) {
    conversation.isDeleted = true;
  }

  await conversation.save();

  return conversation;
};

/**
 * Get unread message count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Total unread count
 */
export const getUnreadCount = async (userId) => {
  if (!isValidId(userId)) {
    throw new Error("Invalid user ID");
  }

  const userObjId = normalizeId(userId);

  const conversations = await Conversation.find({
    participants: userObjId,
    isDeleted: { $ne: true },
  }).lean();

  let totalUnread = 0;
  conversations.forEach((conv) => {
    let unread = 0;
    if (conv.unreadCount) {
      if (conv.unreadCount instanceof Map) {
        unread = conv.unreadCount.get(userId) || 0;
      } else if (typeof conv.unreadCount === 'object') {
        unread = conv.unreadCount[userId] || 0;
      }
    }
    totalUnread += unread;
  });

  return totalUnread;
};

