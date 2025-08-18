 

import axios from "axios"
import { BACKEND_URL } from "../config"
import { ChatRoomClient } from "./ChatRoomClient";

async function getChats(roomId: string) {
    const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MTcyOTcxYy1hYzlkLTQ5YjctYmRmYi0wZDNkYjljNDk1MGEiLCJpYXQiOjE3NTU0NDk0OTJ9.rdGDqwDXI72tan6QAw72F_FVY9l6YIoIqmTUY7t01-E`,   // <-- Add token to header
    },
    withCredentials: true              
  });
    return response.data.messages;
}

export async function ChatRoom({id}: {
    id: string
}) {
    const messages = await getChats(id);
    return <ChatRoomClient id={id} messages={messages} />
}