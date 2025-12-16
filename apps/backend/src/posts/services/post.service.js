import Post from "../models/post.js";
import { normalizeId, isValidId } from "../../utils/db/idUtils.js";

/**
 * Post Service
 * Handles all business logic for posts
 */

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @param {string} postData.author - Author user ID
 * @param {string} postData.type - Post type
 * @param {string} postData.content - Post content
 * @param {string} postData.badge - Post badge
 * @param {string} postData.badgeColor - Badge color
 * @param {Array<string>} postData.hashtags - Hashtags
 * @param {string} postData.status - Post status (published/draft)
 * @returns {Promise<Object>} Created post
 */
export const createPost = async (postData) => {
  const {
    author,
    type = "article",
    content,
    badge,
    badgeColor = "green",
    hashtags = [],
    status = "published",
    media = {},
  } = postData;

  if (!author) {
    throw new Error("Author is required");
  }

  // Allow empty content only for drafts
  if (status !== "draft" && (!content || !content.trim())) {
    throw new Error("Content is required for published posts");
  }

  if (!isValidId(author)) {
    throw new Error("Invalid author ID");
  }

  const post = new Post({
    author: normalizeId(author),
    type,
    content: content || "",
    badge,
    badgeColor,
    hashtags: Array.isArray(hashtags) ? hashtags : [],
    status,
    media,
  });

  await post.save();
  return await post.populate("author", "fullName email role professionalTitle verified");
};

/**
 * Get all posts for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by status (published/draft)
 * @param {string} options.type - Filter by post type
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.search - Search term
 * @param {string} options.sortBy - Sort order: recent, oldest, mostLiked, mostViewed, mostEngaged
 * @returns {Promise<Object>} Posts and pagination info
 */
export const getUserPosts = async (userId, options = {}) => {
  const {
    status = "published",
    type,
    page = 1,
    limit = 10,
    search,
    sortBy = "recent",
  } = options;

  if (!isValidId(userId)) {
    throw new Error("Invalid user ID");
  }

  const query = {
    author: normalizeId(userId),
    isDeleted: false,
  };

  if (status) {
    query.status = status;
  }

  if (type) {
    query.type = type;
  }

  if (search) {
    query.$or = [
      { content: { $regex: search, $options: "i" } },
      { hashtags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  const skip = (page - 1) * limit;

  // Determine sort order based on sortBy parameter
  let sortOrder = { createdAt: -1 }; // Default: newest first

  switch (sortBy) {
    case "recent":
      sortOrder = { createdAt: -1 }; // Newest first
      break;
    case "oldest":
      sortOrder = { createdAt: 1 }; // Oldest first
      break;
    case "mostLiked":
      sortOrder = { "metrics.likes": -1 }; // Most likes first
      break;
    case "mostViewed":
      sortOrder = { "metrics.views": -1 }; // Most views first
      break;
    case "mostEngaged":
      // For engagement, we need to sort by a calculated field
      // Engagement = likes + comments + shares
      // We'll use aggregation pipeline for this
      break;
    default:
      sortOrder = { createdAt: -1 }; // Default to newest first
  }

  let posts, total;

  if (sortBy === "mostEngaged") {
    // Use aggregation pipeline to calculate engagement and sort
    // First, get post IDs sorted by engagement
    const engagementPipeline = [
      { $match: query },
      {
        $addFields: {
          engagement: {
            $add: [
              "$metrics.likes",
              "$metrics.comments",
              "$metrics.shares",
            ],
          },
        },
      },
      { $sort: { engagement: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { _id: 1 } },
    ];

    const sortedPostIds = await Post.aggregate(engagementPipeline);
    const postIds = sortedPostIds.map((p) => p._id);

    // Now fetch posts in the correct order with population
    if (postIds.length > 0) {
      posts = await Post.find({ _id: { $in: postIds } })
        .populate("author", "fullName email role professionalTitle verified")
        .populate("comments.author", "fullName email")
        .populate("likedBy", "fullName")
        .lean();

      // Sort posts to match the engagement order
      const postMap = new Map(posts.map((post) => [post._id.toString(), post]));
      posts = postIds.map((id) => postMap.get(id.toString())).filter(Boolean);
      
      // Normalize likedBy arrays to strings
      posts = posts.map((post) => {
        if (post.likedBy && Array.isArray(post.likedBy)) {
          post.likedBy = post.likedBy.map((id) => 
            id.toString ? id.toString() : String(id)
          );
        }
        return post;
      });
    } else {
      posts = [];
    }

    total = await Post.countDocuments(query);
  } else {
    // Standard query with sort
    [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "fullName email role professionalTitle verified")
        .populate("comments.author", "fullName email")
        .populate("likedBy", "fullName")
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);
  }

  // Normalize likedBy arrays to strings for all posts
  if (posts && Array.isArray(posts)) {
    posts = posts.map((post) => {
      if (post.likedBy && Array.isArray(post.likedBy)) {
        post.likedBy = post.likedBy.map((id) => 
          id.toString ? id.toString() : String(id)
        );
      }
      return post;
    });
  }

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get all published posts from all users (for community page)
 * @param {Object} options - Query options
 * @param {string} options.type - Filter by post type
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.search - Search term
 * @param {string} options.sortBy - Sort order: recent, oldest, mostLiked, mostViewed, mostEngaged
 * @returns {Promise<Object>} Posts and pagination info
 */
export const getAllPosts = async (options = {}) => {
  const {
    type,
    page = 1,
    limit = 20,
    search,
    sortBy = "recent",
  } = options;

  const query = {
    status: "published",
    isDeleted: false,
  };

  if (type) {
    query.type = type;
  }

  if (search) {
    query.$or = [
      { content: { $regex: search, $options: "i" } },
      { hashtags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  const skip = (page - 1) * limit;

  // Determine sort order based on sortBy parameter
  let sortOrder = { createdAt: -1 }; // Default: newest first

  switch (sortBy) {
    case "recent":
      sortOrder = { createdAt: -1 }; // Newest first
      break;
    case "oldest":
      sortOrder = { createdAt: 1 }; // Oldest first
      break;
    case "mostLiked":
      sortOrder = { "metrics.likes": -1 }; // Most likes first
      break;
    case "mostViewed":
      sortOrder = { "metrics.views": -1 }; // Most views first
      break;
    case "mostEngaged":
      // For engagement, we need to sort by a calculated field
      break;
    default:
      sortOrder = { createdAt: -1 }; // Default to newest first
  }

  let posts, total;

  if (sortBy === "mostEngaged") {
    // Use aggregation pipeline to calculate engagement and sort
    const engagementPipeline = [
      { $match: query },
      {
        $addFields: {
          engagement: {
            $add: [
              "$metrics.likes",
              "$metrics.comments",
              "$metrics.shares",
            ],
          },
        },
      },
      { $sort: { engagement: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { _id: 1 } },
    ];

    const sortedPostIds = await Post.aggregate(engagementPipeline);
    const postIds = sortedPostIds.map((p) => p._id);

    // Now fetch posts in the correct order with population
    if (postIds.length > 0) {
      posts = await Post.find({ _id: { $in: postIds } })
        .populate("author", "fullName firstName lastName email role professionalTitle verified")
        .populate("comments.author", "fullName firstName lastName email")
        .populate("likedBy", "fullName firstName lastName")
        .lean();

      // Sort posts to match the engagement order
      const postMap = new Map(posts.map((post) => [post._id.toString(), post]));
      posts = postIds.map((id) => postMap.get(id.toString())).filter(Boolean);
      
      // Normalize likedBy arrays to strings
      posts = posts.map((post) => {
        if (post.likedBy && Array.isArray(post.likedBy)) {
          post.likedBy = post.likedBy.map((id) => 
            id.toString ? id.toString() : String(id)
          );
        }
        return post;
      });
    } else {
      posts = [];
    }

    total = await Post.countDocuments(query);
  } else {
    // Standard query with sort
    [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "fullName firstName lastName email role professionalTitle verified")
        .populate("comments.author", "fullName firstName lastName email")
        .populate("likedBy", "fullName firstName lastName")
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);
  }

  // Normalize likedBy arrays to strings for all posts
  if (posts && Array.isArray(posts)) {
    posts = posts.map((post) => {
      if (post.likedBy && Array.isArray(post.likedBy)) {
        post.likedBy = post.likedBy.map((id) => 
          id.toString ? id.toString() : String(id)
        );
      }
      return post;
    });
  }

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single post by ID
 * @param {string} postId - Post ID
 * @returns {Promise<Object>} Post
 */
export const getPostById = async (postId) => {
  if (!isValidId(postId)) {
    throw new Error("Invalid post ID");
  }

  const post = await Post.findOne({
    _id: normalizeId(postId),
    isDeleted: false,
  })
    .populate("author", "fullName email role professionalTitle verified")
    .populate("comments.author", "fullName email")
    .populate("likedBy", "fullName")
    .lean();

  if (!post) {
    throw new Error("Post not found");
  }

  return post;
};

/**
 * Update a post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated post
 */
export const updatePost = async (postId, userId, updateData) => {
  if (!isValidId(postId) || !isValidId(userId)) {
    throw new Error("Invalid post ID or user ID");
  }

  const post = await Post.findOne({
    _id: normalizeId(postId),
    author: normalizeId(userId),
    isDeleted: false,
  });

  if (!post) {
    throw new Error("Post not found or unauthorized");
  }

  // Update allowed fields
  const allowedFields = [
    "content",
    "type",
    "badge",
    "badgeColor",
    "hashtags",
    "status",
    "media",
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      post[field] = updateData[field];
    }
  });

  await post.save();
  return await post.populate("author", "fullName email role professionalTitle verified");
};

/**
 * Delete a post (soft delete)
 * @param {string} postId - Post ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Deleted post
 */
export const deletePost = async (postId, userId) => {
  if (!isValidId(postId) || !isValidId(userId)) {
    throw new Error("Invalid post ID or user ID");
  }

  const post = await Post.findOne({
    _id: normalizeId(postId),
    author: normalizeId(userId),
    isDeleted: false,
  });

  if (!post) {
    throw new Error("Post not found or unauthorized");
  }

  post.isDeleted = true;
  await post.save();

  return post;
};

/**
 * Like/Unlike a post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated post
 */
export const toggleLikePost = async (postId, userId) => {
  if (!isValidId(postId) || !isValidId(userId)) {
    throw new Error("Invalid post ID or user ID");
  }

  const post = await Post.findOne({
    _id: normalizeId(postId),
    isDeleted: false,
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const userIdObj = normalizeId(userId);
  const userIdStr = userIdObj.toString();
  
  // Convert likedBy to array of strings for comparison
  const likedByStrings = post.likedBy.map((id) => 
    id.toString ? id.toString() : String(id)
  );
  const likedIndex = likedByStrings.findIndex((idStr) => idStr === userIdStr);

  if (likedIndex > -1) {
    // Unlike - remove from array
    post.likedBy.splice(likedIndex, 1);
    post.metrics.likes = Math.max(0, post.metrics.likes - 1);
  } else {
    // Like - add to array
    post.likedBy.push(userIdObj);
    post.metrics.likes += 1;
  }

  await post.save();
  
  // Fetch the updated post with all populated fields
  const updatedPost = await Post.findById(post._id)
    .populate("author", "fullName email role professionalTitle verified")
    .populate("comments.author", "fullName email")
    .lean();
  
  // Convert likedBy ObjectIds to strings for consistent API response
  // Note: likedBy is not populated (it's just ObjectIds), so we convert them directly
  if (updatedPost.likedBy && Array.isArray(updatedPost.likedBy)) {
    updatedPost.likedBy = updatedPost.likedBy.map((id) => {
      // Handle both ObjectId and string cases
      if (typeof id === 'string') return id;
      if (id && id.toString) return id.toString();
      return String(id);
    });
  } else {
    updatedPost.likedBy = [];
  }
  
  return updatedPost;
};

/**
 * Add a comment to a post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID
 * @param {string} content - Comment content
 * @returns {Promise<Object>} Updated post
 */
export const addComment = async (postId, userId, content) => {
  if (!isValidId(postId) || !isValidId(userId)) {
    throw new Error("Invalid post ID or user ID");
  }

  if (!content || !content.trim()) {
    throw new Error("Comment content is required");
  }

  const post = await Post.findOne({
    _id: normalizeId(postId),
    isDeleted: false,
  });

  if (!post) {
    throw new Error("Post not found");
  }

  post.comments.push({
    author: normalizeId(userId),
    content: content.trim(),
    likes: 0,
  });

  post.metrics.comments += 1;
  await post.save();

  return await Post.findById(post._id)
    .populate("author", "fullName email role professionalTitle verified")
    .populate("comments.author", "fullName email")
    .lean();
};

/**
 * Like/Unlike a comment
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated post
 */
export const toggleLikeComment = async (postId, commentId, userId) => {
  if (!isValidId(postId) || !isValidId(commentId) || !isValidId(userId)) {
    throw new Error("Invalid post ID, comment ID, or user ID");
  }

  const post = await Post.findOne({
    _id: normalizeId(postId),
    isDeleted: false,
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const comment = post.comments.id(normalizeId(commentId));
  if (!comment) {
    throw new Error("Comment not found");
  }

  const userIdObj = normalizeId(userId);
  const likedIndex = comment.likedBy.findIndex(
    (id) => id.toString() === userIdObj.toString()
  );

  if (likedIndex > -1) {
    // Unlike
    comment.likedBy.splice(likedIndex, 1);
    comment.likes = Math.max(0, comment.likes - 1);
  } else {
    // Like
    comment.likedBy.push(userIdObj);
    comment.likes += 1;
  }

  await post.save();
  return await Post.findById(post._id)
    .populate("author", "fullName email role professionalTitle verified")
    .populate("comments.author", "fullName email")
    .lean();
};

/**
 * Increment post views
 * @param {string} postId - Post ID
 * @returns {Promise<void>}
 */
export const incrementViews = async (postId) => {
  if (!isValidId(postId)) {
    throw new Error("Invalid post ID");
  }

  await Post.findByIdAndUpdate(normalizeId(postId), {
    $inc: { "metrics.views": 1 },
  });
};

/**
 * Get post statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics
 */
export const getUserPostStats = async (userId) => {
  if (!isValidId(userId)) {
    throw new Error("Invalid user ID");
  }

  const stats = await Post.aggregate([
    {
      $match: {
        author: normalizeId(userId),
        isDeleted: false,
        status: "published",
      },
    },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        totalLikes: { $sum: "$metrics.likes" },
        totalViews: { $sum: "$metrics.views" },
        totalComments: { $sum: "$metrics.comments" },
        totalShares: { $sum: "$metrics.shares" },
      },
    },
  ]);

  const result = stats[0] || {
    totalPosts: 0,
    totalLikes: 0,
    totalViews: 0,
    totalComments: 0,
    totalShares: 0,
  };

  // Calculate engagement (likes + comments + shares)
  result.engagement = result.totalLikes + result.totalComments + result.totalShares;

  return result;
};

/**
 * Share a post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated post
 */
export const sharePost = async (postId, userId) => {
  if (!isValidId(postId) || !isValidId(userId)) {
    throw new Error("Invalid post ID or user ID");
  }

  const post = await Post.findOne({
    _id: normalizeId(postId),
    isDeleted: false,
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const userIdObj = normalizeId(userId);
  const sharedIndex = post.sharedBy.findIndex(
    (id) => id.toString() === userIdObj.toString()
  );

  if (sharedIndex === -1) {
    post.sharedBy.push(userIdObj);
    post.metrics.shares += 1;
    await post.save();
  }

  return await post.populate("author", "fullName email role professionalTitle verified");
};

