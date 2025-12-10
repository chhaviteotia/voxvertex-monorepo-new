// ============================================================================
// POSTS API - RTK Query Endpoints for Post Management
// ============================================================================

import { baseApi } from './baseApi';

// ============================================================================
// Types
// ============================================================================

export interface PostAuthor {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  professionalTitle?: string;
  verified?: boolean;
}

export interface PostComment {
  _id: string;
  author: PostAuthor;
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  author: PostAuthor;
  type: 'article' | 'image' | 'video' | 'celebrate' | 'insight' | 'event';
  content: string;
  badge?: string;
  badgeColor: 'green' | 'blue' | 'orange' | 'purple';
  hashtags: string[];
  media?: {
    imageUrl?: string;
    videoUrl?: string;
  };
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  likedBy: string[];
  sharedBy: string[];
  comments: PostComment[];
  status: 'published' | 'draft';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  formattedTimestamp?: string;
}

export interface CreatePostRequest {
  type?: 'article' | 'image' | 'video' | 'celebrate' | 'insight' | 'event';
  content: string;
  badge?: string;
  badgeColor?: 'green' | 'blue' | 'orange' | 'purple';
  hashtags?: string[];
  status?: 'published' | 'draft';
  media?: {
    imageUrl?: string;
    videoUrl?: string;
  };
}

export interface UpdatePostRequest {
  content?: string;
  type?: 'article' | 'image' | 'video' | 'celebrate' | 'insight' | 'event';
  badge?: string;
  badgeColor?: 'green' | 'blue' | 'orange' | 'purple';
  hashtags?: string[];
  status?: 'published' | 'draft';
  media?: {
    imageUrl?: string;
    videoUrl?: string;
  };
}

export interface AddCommentRequest {
  content: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PostStats {
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
  totalComments: number;
  totalShares: number;
  engagement: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// ============================================================================
// API Endpoints
// ============================================================================

export const postsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get post statistics
    getPostStats: builder.query<ApiResponse<{ stats: PostStats }>, void>({
      query: () => ({
        url: '/posts/stats',
        method: 'GET',
      }),
      providesTags: ['PostStats'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response;
        }
        return {
          success: false,
          data: {
            stats: {
              totalPosts: 0,
              totalLikes: 0,
              totalViews: 0,
              totalComments: 0,
              totalShares: 0,
              engagement: 0,
            },
          },
        };
      },
    }),

    // Get user posts with filters
    getUserPosts: builder.query<
      ApiResponse<PostsResponse>,
      {
        status?: 'published' | 'draft';
        type?: string;
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: 'recent' | 'oldest' | 'mostLiked' | 'mostViewed' | 'mostEngaged';
      }
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.type) queryParams.append('type', params.type);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);

        return {
          url: `/posts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Post'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response;
        }
        return {
          success: false,
          data: {
            posts: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              pages: 0,
            },
          },
        };
      },
    }),

    // Get single post by ID
    getPostById: builder.query<ApiResponse<{ post: Post }>, string>({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'GET',
      }),
      providesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response;
        }
        return {
          success: false,
        };
      },
    }),

    // Create post
    createPost: builder.mutation<ApiResponse<{ post: Post }>, CreatePostRequest>({
      query: (postData) => ({
        url: '/posts',
        method: 'POST',
        body: postData,
      }),
      invalidatesTags: ['Post', 'PostStats'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response;
        }
        return {
          success: false,
          message: response.message || 'Failed to create post',
        };
      },
    }),

    // Update post
    updatePost: builder.mutation<
      ApiResponse<{ post: Post }>,
      { postId: string; data: UpdatePostRequest }
    >({
      query: ({ postId, data }) => ({
        url: `/posts/${postId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        'Post',
        'PostStats',
      ],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response;
        }
        return {
          success: false,
          message: response.message || 'Failed to update post',
        };
      },
    }),

    // Delete post
    deletePost: builder.mutation<ApiResponse<null>, string>({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post', 'PostStats'],
      transformResponse: (response: any) => {
        return response;
      },
    }),

    // Like/Unlike post
    toggleLikePost: builder.mutation<ApiResponse<{ post: Post }>, string>({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'POST',
      }),
      // Invalidate both stats and posts to ensure all views are updated
      invalidatesTags: ['PostStats', 'Post'],
      // Optimistically update the stats cache
      onQueryStarted: async (postId, { dispatch, queryFulfilled, getState }) => {
        try {
          // Get current stats from cache
          const statsResult = postsApi.endpoints.getPostStats.select()(getState());
          const currentStats = statsResult?.data?.data?.stats;

          if (currentStats) {
            // Optimistically update stats
            dispatch(
              postsApi.util.updateQueryData('getPostStats', undefined, (draft) => {
                if (draft?.data?.stats) {
                  // We don't know if it's a like or unlike, so we'll wait for the response
                  // But we can prepare the structure
                }
              })
            );
          }

          // Wait for the API call to complete
          const { data } = await queryFulfilled;
          
          // Update stats based on the response
          if (data?.data?.post && currentStats) {
            const post = data.data.post;
            const wasLiked = post.metrics.likes > (currentStats.totalLikes / (currentStats.totalPosts || 1));
            
            // Calculate the difference
            // We need to check if this was a like or unlike
            // The best way is to compare the post's like count before and after
            // But since we don't have the before state, we'll update based on the response
            dispatch(
              postsApi.util.updateQueryData('getPostStats', undefined, (draft) => {
                if (draft?.data?.stats) {
                  // Recalculate total likes from all posts
                  // Actually, we should just refetch the stats
                  // But for now, let's invalidate to trigger a refetch
                }
              })
            );
          }
        } catch (error) {
          // On error, the optimistic update will be reverted
        }
      },
      // Optimistic updates
      onQueryStarted: async (postId, { dispatch, queryFulfilled }) => {
        // This will be handled by the component's optimistic update
      },
      transformResponse: (response: any) => {
        // Backend returns: { success: true, message: "...", data: { post: {...} } }
        if (response.success && response.data) {
          return response;
        }
        // If response structure is different, try to handle it
        if (response.post) {
          return {
            success: true,
            data: { post: response.post },
            message: response.message,
          };
        }
        return {
          success: false,
          message: response.message || 'Failed to toggle like',
        };
      },
    }),

    // Share post
    sharePost: builder.mutation<ApiResponse<{ post: Post }>, string>({
      query: (postId) => ({
        url: `/posts/${postId}/share`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
        'Post',
        'PostStats',
      ],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response;
        }
        return {
          success: false,
          message: response.message || 'Failed to share post',
        };
      },
    }),

    // Add comment
    addComment: builder.mutation<
      ApiResponse<{ post: Post }>,
      { postId: string; content: string }
    >({
      query: ({ postId, content }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        'Post',
        'PostStats',
      ],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response;
        }
        return {
          success: false,
          message: response.message || 'Failed to add comment',
        };
      },
    }),

    // Like/Unlike comment
    toggleLikeComment: builder.mutation<
      ApiResponse<{ post: Post }>,
      { postId: string; commentId: string }
    >({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        'Post',
      ],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response;
        }
        return {
          success: false,
          message: response.message || 'Failed to toggle comment like',
        };
      },
    }),
  }),
});

// Export hooks
export const {
  useGetPostStatsQuery,
  useGetUserPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleLikePostMutation,
  useSharePostMutation,
  useAddCommentMutation,
  useToggleLikeCommentMutation,
} = postsApi;

