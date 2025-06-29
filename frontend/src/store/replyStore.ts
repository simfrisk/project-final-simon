import { create } from "zustand";

export interface ReplyType {
  replyId: number;
  reply: string;
  createdAt: Date;
  commentId: number;
}

interface ReplyStore {
  replies: ReplyType[];
  addReply: (aReply: ReplyType) => void;
}

// export interface MessageType {
//   _id?: string;
//   projectID?: string;
//   message: string; // NOT content
//   createdAt: Date;
//   timeStamp: string;
//   replies?: any[]; // probably included
// }

// interface MessageStore {
//   messages: MessageType[];
//   selectedTimeStamp: string | null;
//   setSelectedTimeStamp: (stamp: string) => void;
//   addMessage: (msg: MessageType) => Promise<void>;
//   clearMessages: () => void;
//   deleteMessage: (_id: string) => void;
//   fetchComments: (projectId: string) => Promise<void>;
// }

export const replyStore = create<MessageStore>((set) => ({
  messages: [],
  selectedTimeStamp: null,

  // addMessage: async (msg) => {
  //   try {
  //     const response = await fetch(`http://localhost:8080/projects/${msg.projectID}/comments`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(msg),
  //     });

  //     if (!response.ok) throw new Error("Failed to post comment");

  //     const data = await response.json();

  //     if (data.success && data.response) {
  //       set((state) => ({
  //         messages: [...state.messages, data.response],
  //       }));
  //     } else {
  //       console.error("Post failed:", data.message || "No comment in response");
  //     }
  //   } catch (err: any) {
  //     console.error("Error posting comment:", err.message || "Unknown error");
  //   }
  // },

  fetchComments: async (commentId) => {
    try {
      const response = await fetch(`http://localhost:8080/projects/${projectId}/comments/${commentId}/replies`);
      if (!response.ok) throw new Error("Network response was not ok");

      const json = await response.json();
      console.log("messages fetch:", json);

      if (json.success && Array.isArray(json.response)) {
        const mappedMessages = json.response.map((item: any) => ({
          _id: item._id,
          projectID: item.projectId, // renamed to match MessageType
          message: item.content, // renamed from `content`
          createdAt: new Date(item.createdAt),
          timeStamp: item.timeStamp,
          replies: item.replies || [],
        }));

        set({ messages: mappedMessages });
      } else {
        console.error("Failed to fetch messages:", json.message);
      }
    } catch (err: any) {
      console.error("Fetch error:", err.message || "Unknown error");
    }
  }
}));