import { baseApi } from './baseApi';

// Types
export interface Message {
  id: string;
  sender: 'user' | 'other';
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  reactions?: { type: string; count: number }[];
  attachments?: { name: string; type: string; size: string; url?: string }[];
}

export interface Conversation {
  id: string;
  name: string;
  role: string;
  avatar: string;
  verified: boolean;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  conversationId: string;
}

export interface ConversationDetail {
  _id: string;
  participants: Array<{
    _id: string;
    fullName: string;
    email: string;
    role: string;
    professionalTitle?: string;
    verified: boolean;
  }>;
  lastMessage?: string;
  lastMessageAt: string;
  messages: Message[];
  unreadCount: Record<string, number>;
  isArchived: boolean;
  archivedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  content: string;
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
    size: string;
  }>;
}

export interface CreateConversationRequest {
  participantId: string;
}

export interface GetConversationsParams {
  filter?: 'all' | 'trainers' | 'speakers' | 'orgs';
  page?: number;
  limit?: number;
  search?: string;
  archived?: boolean;
}

export interface GetMessagesParams {
  page?: number;
  limit?: number;
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface ConversationsResponse {
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface MessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all conversations for the current user
    getConversations: builder.query<ConversationsResponse, GetConversationsParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.filter) searchParams.append('filter', params.filter);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.archived !== undefined) searchParams.append('archived', params.archived.toString());

        return `/messages/conversations?${searchParams.toString()}`;
      },
      providesTags: ['Conversations'],
      transformResponse: (response: any) => {
        // Extract data from API response wrapper
        if (response?.success && response?.data) {
          return response.data;
        }
        // Log error for debugging
        console.error('getConversations transformResponse error:', response);
        // Return empty response if error
        return {
          conversations: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
          },
        };
      },
      transformErrorResponse: (response: any) => {
        // Handle error responses
        console.error('getConversations API error:', response);
        return response;
      },
    }),

    // Get a single conversation by ID
    getConversationById: builder.query<ApiResponse<{ conversation: ConversationDetail }>, string>({
      query: (conversationId) => `/messages/conversations/${conversationId}`,
      providesTags: (result, error, conversationId) => [
        { type: 'Conversation', id: conversationId },
      ],
    }),

    // Find or create a conversation
    findOrCreateConversation: builder.mutation<
      ApiResponse<{ conversation: ConversationDetail }>,
      CreateConversationRequest
    >({
      query: (data) => ({
        url: '/messages/conversations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Conversations'],
    }),

    // Get messages for a conversation
    getConversationMessages: builder.query<
      MessagesResponse,
      { conversationId: string; params?: GetMessagesParams }
    >({
      query: ({ conversationId, params = {} }) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());

        return `/messages/conversations/${conversationId}/messages?${searchParams.toString()}`;
      },
      providesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
      ],
      transformResponse: (response: ApiResponse<MessagesResponse>) => {
        // Extract data from API response wrapper
        if (response.success && response.data) {
          return response.data;
        }
        // Return empty response if error
        return {
          messages: [],
          pagination: {
            page: 1,
            limit: 50,
            total: 0,
            pages: 0,
          },
        };
      },
    }),

    // Send a message
    sendMessage: builder.mutation<
      ApiResponse<{ message: Message }>,
      { conversationId: string; data: SendMessageRequest }
    >({
      query: ({ conversationId, data }) => ({
        url: `/messages/conversations/${conversationId}/messages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        'Conversations',
        { type: 'Messages', id: conversationId },
      ],
      // Optimistically update the cache
      onQueryStarted: async ({ conversationId, data }, { dispatch, queryFulfilled }) => {
        // Optimistic update for messages
        const patchResult = dispatch(
          messagesApi.util.updateQueryData(
            'getConversationMessages',
            { conversationId, params: {} },
            (draft) => {
              const tempMessage: Message = {
                id: `temp-${Date.now()}`,
                sender: 'user',
                senderName: 'You',
                content: data.content,
                timestamp: new Date().toISOString(),
                read: false,
                attachments: data.attachments,
              };
              draft.messages.push(tempMessage);
              draft.pagination.total += 1;
            }
          )
        );

        // Optimistic update for conversations list
        dispatch(
          messagesApi.util.updateQueryData('getConversations', {}, (draft) => {
            const conversation = draft.conversations.find((c) => c.conversationId === conversationId);
            if (conversation) {
              conversation.lastMessage = data.content;
              conversation.timestamp = new Date().toISOString();
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResult.undo();
        }
      },
    }),

    // Mark messages as read
    markMessagesAsRead: builder.mutation<ApiResponse<{}>, string>({
      query: (conversationId) => ({
        url: `/messages/conversations/${conversationId}/read`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, conversationId) => [
        'Conversations',
        { type: 'Messages', id: conversationId },
      ],
    }),

    // Archive a conversation
    archiveConversation: builder.mutation<ApiResponse<{}>, string>({
      query: (conversationId) => ({
        url: `/messages/conversations/${conversationId}/archive`,
        method: 'POST',
      }),
      invalidatesTags: ['Conversations'],
    }),

    // Unarchive a conversation
    unarchiveConversation: builder.mutation<ApiResponse<{}>, string>({
      query: (conversationId) => ({
        url: `/messages/conversations/${conversationId}/unarchive`,
        method: 'POST',
      }),
      invalidatesTags: ['Conversations'],
    }),

    // Delete a conversation
    deleteConversation: builder.mutation<ApiResponse<{}>, string>({
      query: (conversationId) => ({
        url: `/messages/conversations/${conversationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Conversations'],
    }),

    // Get unread message count
    getUnreadCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => '/messages/unread-count',
      providesTags: ['UnreadCount'],
      transformResponse: (response: ApiResponse<{ count: number }>) => {
        // Return the response as-is since it's already wrapped
        return response;
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationByIdQuery,
  useFindOrCreateConversationMutation,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useArchiveConversationMutation,
  useUnarchiveConversationMutation,
  useDeleteConversationMutation,
  useGetUnreadCountQuery,
} = messagesApi;

