import {
  findOrCreateConversation,
  getUserConversations,
  getConversationById,
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
  archiveConversation,
  unarchiveConversation,
  deleteConversation,
  getUnreadCount,
} from "../services/conversation.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
} from "../../utils/response.utils.js";

/**
 * Find or create a conversation between current user and another user
 * POST /api/messages/conversations
 */
export const findOrCreateConversationController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const { participantId } = req.body;

    if (!participantId) {
      return sendValidationError(res, "Participant ID is required");
    }

    try {
      const conversation = await findOrCreateConversation(userId, participantId);
      return sendSuccess(res, { conversation }, "Conversation found or created");
    } catch (error) {
      return sendError(res, error.message || "Failed to create conversation", 400);
    }
  }
);

/**
 * Get all conversations for the current user
 * GET /api/messages/conversations
 */
export const getUserConversationsController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const {
    filter = "all",
    page = 1,
    limit = 20,
    search,
    archived = false,
  } = req.query;

  try {
    const result = await getUserConversations(userId, {
      filter,
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      archived: archived === "true",
    });

    return sendSuccess(res, result, "Conversations retrieved successfully");
  } catch (error) {
    console.error("Error in getUserConversationsController:", error);
    return sendError(res, error.message || "Failed to retrieve conversations", 400);
  }
});

/**
 * Get a single conversation by ID
 * GET /api/messages/conversations/:conversationId
 */
export const getConversationByIdController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { conversationId } = req.params;

  try {
    const conversation = await getConversationById(conversationId, userId);
    return sendSuccess(res, { conversation }, "Conversation retrieved successfully");
  } catch (error) {
    if (error.message === "Conversation not found") {
      return sendNotFound(res, "Conversation not found");
    }
    return sendError(res, error.message || "Failed to retrieve conversation", 400);
  }
});

/**
 * Send a message in a conversation
 * POST /api/messages/conversations/:conversationId/messages
 */
export const sendMessageController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { conversationId } = req.params;
  const { content, attachments } = req.body;

  if (!content || !content.trim()) {
    return sendValidationError(res, "Message content is required");
  }

  try {
    const message = await sendMessage(conversationId, userId, {
      content,
      attachments,
    });

    return sendSuccess(res, { message }, "Message sent successfully");
  } catch (error) {
    return sendError(res, error.message || "Failed to send message", 400);
  }
});

/**
 * Get messages for a conversation
 * GET /api/messages/conversations/:conversationId/messages
 */
export const getConversationMessagesController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  try {
    const result = await getConversationMessages(conversationId, userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return sendSuccess(res, result, "Messages retrieved successfully");
  } catch (error) {
    return sendError(res, error.message || "Failed to retrieve messages", 400);
  }
});

/**
 * Mark messages as read
 * POST /api/messages/conversations/:conversationId/read
 */
export const markMessagesAsReadController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { conversationId } = req.params;

  try {
    await markMessagesAsRead(conversationId, userId);
    return sendSuccess(res, {}, "Messages marked as read");
  } catch (error) {
    return sendError(res, error.message || "Failed to mark messages as read", 400);
  }
});

/**
 * Archive a conversation
 * POST /api/messages/conversations/:conversationId/archive
 */
export const archiveConversationController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { conversationId } = req.params;

  try {
    await archiveConversation(conversationId, userId);
    return sendSuccess(res, {}, "Conversation archived");
  } catch (error) {
    return sendError(res, error.message || "Failed to archive conversation", 400);
  }
});

/**
 * Unarchive a conversation
 * POST /api/messages/conversations/:conversationId/unarchive
 */
export const unarchiveConversationController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { conversationId } = req.params;

  try {
    await unarchiveConversation(conversationId, userId);
    return sendSuccess(res, {}, "Conversation unarchived");
  } catch (error) {
    return sendError(res, error.message || "Failed to unarchive conversation", 400);
  }
});

/**
 * Delete a conversation
 * DELETE /api/messages/conversations/:conversationId
 */
export const deleteConversationController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { conversationId } = req.params;

  try {
    await deleteConversation(conversationId, userId);
    return sendSuccess(res, {}, "Conversation deleted");
  } catch (error) {
    return sendError(res, error.message || "Failed to delete conversation", 400);
  }
});

/**
 * Get unread message count
 * GET /api/messages/unread-count
 */
export const getUnreadCountController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  try {
    const count = await getUnreadCount(userId);
    return sendSuccess(res, { count }, "Unread count retrieved successfully");
  } catch (error) {
    return sendError(res, error.message || "Failed to get unread count", 400);
  }
});

