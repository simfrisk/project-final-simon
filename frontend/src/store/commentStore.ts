//#region ----- IMPORTS -----
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getToken } from "../utils/token";
import { baseUrl } from "../config/api";

//#endregion

//#region ----- Interfaces -----

export interface ReplyType {
  _id: string;
  content: string;
  commentId: string;
  createdAt: Date;
  replyCreatedBy?: {
    _id: string;
    name: string;
    profileImage: string;
    role?: "teacher" | "student" | string;
  };
  likesCount?: number;
}

export interface MessageType {
  _id: string;
  content: string;
  projectId?: string;
  createdAt?: Date;
  timeStamp: string;
  isChecked: boolean;
  commentCreatedBy: {
    _id: string;
    name: string;
    profileImage: string;
    role?: "teacher" | "student" | string;
  };
  commentType: string;
  replies?: ReplyType[];
  likesCount?: number;
}

interface UpdateCommentInput {
  commentId: string;
  content: string;
}

interface UpdateReplyInput {
  replyId: string;
  content: string;
}

export interface NewMessageType {
  content: string;
  projectId?: string;
  timeStamp: string;
  commentType: string;
}

interface MessageStore {
  allComments: MessageType[];
  projectComments: MessageType[];
  privateComments: MessageType[];
  selectedTimeStamp: string | null;
  selectedCommentId: string | null;
  setSelectedTimeStamp: (stamp: string) => void;
  setSelectedCommentId: (id: string | null) => void;
  addMessage: (msg: NewMessageType) => Promise<void>;
  addReply: (reply: { content: string; commentId: string; projectId?: string }) => Promise<void>;
  clearMessages: () => void;
  toggleCheck: (commentId: string) => Promise<void>;
  toggleLike: (commentId: string) => Promise<void>;
  toggleReplyLike: (replyId: string) => Promise<void>;
  updateComment: (update: UpdateCommentInput) => Promise<void>;
  updateReply: (update: UpdateReplyInput) => Promise<void>;
  deleteReply: (replyId: string, commentId: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  fetchComments: (projectId: string) => Promise<void>;
  fetchAllComments: () => Promise<void>;
  fetchPrivateComments: (projectId: string) => Promise<void>;
}

//#endregion

//#region ----- Zustand varibles -----

const mapComment = (item: any): MessageType => ({
  _id: item._id,
  content: item.content,
  projectId: item.projectId,
  createdAt: new Date(item.createdAt),
  timeStamp: item.timeStamp,
  isChecked: item.isChecked,
  commentCreatedBy: {
    _id: item.commentCreatedBy._id,
    name: item.commentCreatedBy.name,
    profileImage: item.commentCreatedBy.profileImage,
    role: item.commentCreatedBy.role,
  },
  commentType: item.commentType,
  likesCount: item.likes?.length || 0,
  replies: (item.replies || []).map((reply: any) => ({
    _id: reply._id,
    content: reply.content,
    commentId: reply.commentId,
    createdAt: new Date(reply.createdAt),
    replyCreatedBy: {
      _id: reply.replyCreatedBy?._id,
      name: reply.replyCreatedBy?.name,
      profileImage: reply.replyCreatedBy?.profileImage,
      role: reply.replyCreatedBy?.role,
    },
    likesCount: reply.replyLikes?.length || 0,
  })),
});

//#endregion

//#region ----- Zustand Comment Store -----
export const commentStore = create<MessageStore>()(
  persist(
    (set) => ({
      allComments: [],
      projectComments: [],
      privateComments: [],
      selectedTimeStamp: null,
      selectedCommentId: null,

      setSelectedTimeStamp: (stamp) => set({ selectedTimeStamp: stamp }),
      setSelectedCommentId: (id) => set({ selectedCommentId: id }),

      //#endregion

      //#region ----- ADD COMMENTS  -----
      addMessage: async (msg) => {
        try {
          const token = getToken();
          const response = await fetch(
            `${baseUrl}/projects/${msg.projectId}/comments`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: token } : {}),
              },
              body: JSON.stringify(msg),
            }
          );

          if (!response.ok) throw new Error("Failed to post comment");

          const data = await response.json();
          if (data.success && data.response) {
            const newMessage = mapComment(data.response);

            set((state) => {
              const updates: Partial<MessageStore> = {
                allComments: [...state.allComments, newMessage],
              };

              if (newMessage.commentType === "private") {
                updates.privateComments = [...state.privateComments, newMessage];
              } else {
                updates.projectComments = [...state.projectComments, newMessage];
              }

              return updates;
            });
          }
        } catch (err: any) {
          console.error("Error posting comment:", err.message);
        }
      },

      //#endregion

      //#region ----- ADD REPLY -----
      addReply: async (reply) => {
        try {
          const token = getToken();
          const response = await fetch(
            `${baseUrl}/comments/${reply.commentId}/replies`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: token } : {}),
              },
              body: JSON.stringify({ content: reply.content }),
            }
          );

          if (!response.ok) throw new Error("Failed to post reply");

          const data = await response.json();
          if (data.success && data.response) {
            const newReply: ReplyType = {
              _id: data.response._id,
              content: data.response.content,
              commentId: data.response.commentId,
              createdAt: new Date(data.response.createdAt),
              replyCreatedBy: {
                _id: data.response.replyCreatedBy?._id,
                name: data.response.replyCreatedBy?.name,
                profileImage: data.response.replyCreatedBy?.profileImage,
                role: data.response.replyCreatedBy?.role,
              },
            };

            const updateReplies = (comments: MessageType[]) =>
              comments.map((msg) =>
                msg._id === newReply.commentId
                  ? { ...msg, replies: [...(msg.replies || []), newReply] }
                  : msg
              );

            set((state) => ({
              projectComments: updateReplies(state.projectComments),
              allComments: updateReplies(state.allComments),
              privateComments: updateReplies(state.privateComments),
            }));
          }
        } catch (err: any) {
          console.error("Error posting reply:", err.message);
        }
      },

      //#endregion

      //#region ----- CLEAR MESSAGES -----
      clearMessages: () =>
        set({ projectComments: [], allComments: [], privateComments: [] }),

      //#endregion 

      //#region ----- TOGGLE CHECK -----
      toggleCheck: async (commentId) => {
        try {
          const token = getToken();
          const response = await fetch(
            `${baseUrl}/comments/${commentId}/toggle-check`,
            {
              method: "PATCH",
              headers: {
                ...(token ? { Authorization: token } : {}),
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) throw new Error("Failed to toggle isChecked");

          const data = await response.json();
          if (!data.success || !data.response) throw new Error("No updated comment returned");

          const updatedComment = mapComment(data.response);

          const updateComments = (comments: MessageType[]) =>
            comments.map((msg) =>
              msg._id === updatedComment._id ? updatedComment : msg
            );

          set((state) => ({
            projectComments: updateComments(state.projectComments),
            allComments: updateComments(state.allComments),
            privateComments: updateComments(state.privateComments),
          }));
        } catch (err: any) {
          console.error("Toggle check failed:", err.message);
        }
      },

      //#endregion

      //#region ----- TOGGLE COMMENT LIKE -----
      toggleLike: async (commentId) => {
        try {
          const token = getToken();
          const response = await fetch(
            `${baseUrl}/comments/${commentId}/likes`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: token } : {}),
              },
            }
          );

          if (!response.ok) throw new Error("Failed to toggle like");

          const data = await response.json();

          if (!data.success) throw new Error("Like toggle failed");

          set((state) => {
            const updateComments = (comments: MessageType[]) =>
              comments.map((msg) =>
                msg._id === commentId
                  ? {
                    ...msg,
                    likesCount: data.totalLikes,
                  }
                  : msg
              );

            return {
              projectComments: updateComments(state.projectComments),
              allComments: updateComments(state.allComments),
              privateComments: updateComments(state.privateComments),
            };
          });
        } catch (err: any) {
          console.error("Like toggle failed:", err.message);
        }
      },

      //#endregion

      //#region ----- TOGGLE REPLY LIKE -----
      toggleReplyLike: async (replyId) => {
        try {
          const token = getToken();
          const response = await fetch(
            `${baseUrl}/replies/${replyId}/likes`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: token } : {}),
              },
            }
          );

          if (!response.ok) throw new Error("Failed to toggle reply like");

          const data = await response.json();
          if (!data.success) throw new Error("Reply like toggle failed");

          set((state) => {
            const updateReplies = (comments: MessageType[]) =>
              comments.map((comment) => ({
                ...comment,
                replies: (comment.replies || []).map((reply) =>
                  reply._id === replyId
                    ? { ...reply, likesCount: data.totalLikes }
                    : reply
                ),
              }));

            return {
              projectComments: updateReplies(state.projectComments),
              allComments: updateReplies(state.allComments),
              privateComments: updateReplies(state.privateComments),
            };
          });
        } catch (err: any) {
          console.error("Reply like toggle failed:", err.message);
        }
      },
      //#endregion

      //#region ----- UPDATE COMMENT  -----
      updateComment: async ({ commentId, content }) => {
        try {
          const token = getToken();

          const response = await fetch(
            `${baseUrl}/comments/${commentId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: token } : {}),
              },
              body: JSON.stringify({ newContent: content }),
            }
          );

          if (!response.ok) throw new Error("Failed to update comment");

          const data = await response.json();

          if (data.success && data.response) {
            const updatedComment = mapComment(data.response);

            const updateComments = (comments: MessageType[]) =>
              comments.map((msg) =>
                msg._id === commentId ? { ...msg, content: updatedComment.content } : msg
              );

            set((state) => ({
              projectComments: updateComments(state.projectComments),
              allComments: updateComments(state.allComments),
              privateComments: updateComments(state.privateComments),
            }));
          } else {
            console.error("Update failed:", data.message || "No comment returned");
          }
        } catch (err: any) {
          console.error("Error updating comment:", err.message || "Unknown error");
        }
      },

      //#endregion

      //#region ----- UPDATE REPLY -----
      updateReply: async ({ replyId, content }) => {
        try {
          const token = getToken();

          const response = await fetch(
            `${baseUrl}/replies/${replyId}`, // assuming this is the reply ID
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: token } : {}),
              },
              body: JSON.stringify({ newContent: content }),
            }
          );

          if (!response.ok) throw new Error("Failed to update reply");

          const data = await response.json();

          if (data.success && data.response) {
            const updatedReply = data.response;

            const updateReplies = (comments: MessageType[]) =>
              comments.map((comment) => ({
                ...comment,
                replies: (comment.replies || []).map((reply) =>
                  reply._id === updatedReply._id
                    ? { ...reply, content: updatedReply.content }
                    : reply
                ),
              }));

            set((state) => ({
              projectComments: updateReplies(state.projectComments),
              allComments: updateReplies(state.allComments),
              privateComments: updateReplies(state.privateComments),
            }));
          } else {
            console.error("Update failed:", data.message || "No reply returned");
          }
        } catch (err: any) {
          console.error("Error updating reply:", err.message || "Unknown error");
        }
      },

      //#endregion

      //#region ----- DELETE COMMENTS -----
      deleteComment: async (commentId) => {
        try {
          const token = getToken();
          const response = await fetch(
            `${baseUrl}/comments/${commentId}`,
            {
              method: "DELETE",
              headers: {
                ...(token ? { Authorization: token } : {}),
              },
            }
          );

          if (!response.ok) throw new Error("Failed to delete comment");

          const data = await response.json();
          if (data.success) {
            set((state) => ({
              projectComments: state.projectComments.filter((msg) => msg._id !== commentId),
              allComments: state.allComments.filter((msg) => msg._id !== commentId),
              privateComments: state.privateComments.filter((msg) => msg._id !== commentId),
            }));
          }
        } catch (err: any) {
          console.error("Error deleting comment:", err.message);
        }
      },

      //#endregion

      //#region ----- DELETE REPLY -----
      deleteReply: async (replyId, commentId) => {
        try {
          const token = getToken();
          const response = await fetch(
            `${baseUrl}/replies/${replyId}`,
            {
              method: "DELETE",
              headers: {
                ...(token ? { Authorization: token } : {}),
              },
            }
          );

          if (!response.ok) throw new Error("Failed to delete reply");

          const data = await response.json();
          if (data.success) {
            const filterReplies = (comments: MessageType[]) =>
              comments.map((msg) =>
                msg._id === commentId
                  ? {
                    ...msg,
                    replies: (msg.replies || []).filter((r) => r._id !== replyId),
                  }
                  : msg
              );

            set((state) => ({
              projectComments: filterReplies(state.projectComments),
              allComments: filterReplies(state.allComments),
              privateComments: filterReplies(state.privateComments),
            }));
          }
        } catch (err: any) {
          console.error("Error deleting reply:", err.message);
        }
      },

      //#endregion

      //#region ----- FETCH COMMENTS -----
      fetchComments: async (projectId) => {
        try {
          const token = getToken();
          const response = await fetch(
            `${baseUrl}/projects/${projectId}/comments`,
            {
              method: "GET",
              headers: {
                ...(token ? { Authorization: token } : {}),
              },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch comments");

          const json = await response.json();
          if (json.success && Array.isArray(json.response)) {
            set({ projectComments: json.response.map(mapComment) });
          }
        } catch (err: any) {
          console.error("Fetch error:", err.message);
        }
      },

      //#endregion

      //#region ----- FETCH ALL COMMENTS -----
      fetchAllComments: async () => {
        try {
          const token = getToken();
          const response = await fetch(
            `${baseUrl}/comments/all`,
            {
              method: "GET",
              headers: {
                ...(token ? { Authorization: token } : {}),
              },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch all comments");

          const json = await response.json();
          if (json.success && Array.isArray(json.response)) {
            set({ allComments: json.response.map(mapComment) });
          }
        } catch (err: any) {
          console.error("Fetch all error:", err.message);
        }
      },

      //#endregion

      //#region ----- FETCH ALL COMMENTS -----
      fetchPrivateComments: async (projectId) => {
        try {
          const token = getToken();
          const response = await fetch(
            `${baseUrl}/projects/${projectId}/comments/private`,
            {
              method: "GET",
              headers: {
                ...(token ? { Authorization: token } : {}),
              },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch private comments");

          const json = await response.json();
          if (json.success && Array.isArray(json.response)) {
            set({ privateComments: json.response.map(mapComment) });
          }
        } catch (err: any) {
          console.error("Private fetch error:", err.message);
        }
      },
    }),

    //#endregion

    //#region ----- COMMENT STORAGE -----
    {
      name: "comment-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

//#endregion

