import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set,get) => ({
  messages: [],
  users: [],
  selectedUser: null, // Default to null or {} if selectedUser is an object
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (id) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${id}`); // Ensure the ID is part of the URL
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false }); // Corrected state
    }
  },

  sendMessage: async (messageData) => {
    const {selectedUser, messages} = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({messages:[...messages, res.data]});
    } catch (error) {
      toast.error(error.response.data.message);
    } 
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if(!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if(!isMessageSentFromSelectedUser) return;
      set({
        messages: [...get().messages, newMessage],
      })
    })
  },

  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage")
  },
  

  setSelectedUser: (user) => {
    set({ selectedUser: user });
    console.log(user); // Fixed variable name
  },
}));
