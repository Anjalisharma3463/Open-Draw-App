import axios from "axios";
import { BACKEND_URL } from "../../config";
import { ChatRoom } from "../../components/ChatRoom";
async function getRoomId(slug: string) {
    const response = await axios.get(`${BACKEND_URL}/room/${slug}`, {
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MTcyOTcxYy1hYzlkLTQ5YjctYmRmYi0wZDNkYjljNDk1MGEiLCJpYXQiOjE3NTU0NDk0OTJ9.rdGDqwDXI72tan6QAw72F_FVY9l6YIoIqmTUY7t01-E`,   // <-- Add token to header
    },
    withCredentials: true              
  });
    console.log(response.data);
    return response.data.room.id;
}

export default async function({
    params
}: {
    params: {
        slug: string
    }
}) {
    const slug = (await params).slug;
    const roomId = await getRoomId(slug);
    
    return <ChatRoom id={roomId}></ChatRoom>
}
