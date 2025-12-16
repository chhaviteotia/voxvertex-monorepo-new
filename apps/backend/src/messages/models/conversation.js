import mongoose from "mongoose";

/**
 * Conversation Model
 * Represents a conversation between two or more users
 */

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    reactions: [
      {
        type: {
          type: String,
          enum: ["heart", "like", "laugh", "wow", "sad", "angry"],
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    attachments: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true, // e.g., "PDF", "IMAGE", "VIDEO"
        },
        url: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          required: true, // e.g., "2.4 MB"
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    messages: [messageSchema],
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ "participants": 1, "isDeleted": 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Ensure participants array has at least 2 users and is unique
conversationSchema.pre("save", function (next) {
  if (this.participants.length < 2) {
    return next(new Error("Conversation must have at least 2 participants"));
  }
  // Remove duplicates
  this.participants = [...new Set(this.participants.map((p) => p.toString()))].map(
    (id) => new mongoose.Types.ObjectId(id)
  );
  next();
});

// Update lastMessageAt when a new message is added
conversationSchema.pre("save", function (next) {
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessageAt = lastMsg.createdAt || new Date();
    this.lastMessage = lastMsg._id;
  }
  next();
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;

