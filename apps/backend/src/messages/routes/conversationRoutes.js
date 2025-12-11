import express from "express";
import {
  findOrCreateConversationController,
  getUserConversationsController,
  getConversationByIdController,
  sendMessageController,
  getConversationMessagesController,
  markMessagesAsReadController,
  archiveConversationController,
  unarchiveConversationController,
  deleteConversationController,
  getUnreadCountController,
} from "../controllers/conversationController.js";
import { authenticateUser } from "../../user/middleware/userAuth.js";
import { validateRequiredFields } from "../../middleware/validation.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Unread count
router.get("/unread-count", getUnreadCountController);

// Conversations
router.get("/conversations", getUserConversationsController);
router.post(
  "/conversations",
  validateRequiredFields(["participantId"]),
  findOrCreateConversationController
);
router.get("/conversations/:conversationId", getConversationByIdController);
router.delete("/conversations/:conversationId", deleteConversationController);

// Messages
router.get("/conversations/:conversationId/messages", getConversationMessagesController);
router.post(
  "/conversations/:conversationId/messages",
  validateRequiredFields(["content"]),
  sendMessageController
);

// Conversation actions
router.post("/conversations/:conversationId/read", markMessagesAsReadController);
router.post("/conversations/:conversationId/archive", archiveConversationController);
router.post("/conversations/:conversationId/unarchive", unarchiveConversationController);

export default router;

