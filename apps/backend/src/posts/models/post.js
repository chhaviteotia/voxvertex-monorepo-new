import mongoose from "mongoose";

/**
 * Post Model
 * Stores posts created by users (trainers, speakers, organisers)
 * Supports different post types: article, image, video, celebrate, insight, event
 */

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const postSchema = new mongoose.Schema(
  {
    // Reference to the author (user)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Post type: article, image, video, celebrate, insight, event
    type: {
      type: String,
      enum: ["article", "image", "video", "celebrate", "insight", "event"],
      default: "article",
      required: true,
    },

    // Post content
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // Post badge and color
    badge: {
      type: String,
      trim: true,
    },
    badgeColor: {
      type: String,
      enum: ["green", "blue", "orange", "purple"],
      default: "green",
    },

    // Hashtags
    hashtags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Media attachments (for image/video posts)
    media: {
      imageUrl: {
        type: String,
        trim: true,
      },
      videoUrl: {
        type: String,
        trim: true,
      },
    },

    // Engagement metrics
    metrics: {
      views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      comments: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
    },

    // Users who liked the post
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Users who shared the post
    sharedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Comments on the post
    comments: [commentSchema],

    // Post status: published, draft
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },

    // Soft delete flag
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ isDeleted: 1 });

// Virtual for formatted timestamp
postSchema.virtual("formattedTimestamp").get(function () {
  const now = new Date();
  const postDate = this.createdAt;
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else {
    return postDate.toLocaleDateString();
  }
});

// Ensure virtuals are included in JSON output
postSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Post = mongoose.model("Post", postSchema);

export default Post;

