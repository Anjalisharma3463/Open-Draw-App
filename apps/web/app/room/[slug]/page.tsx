import axios from "axios";
import { BACKEND_URL } from "../../config";
import { ChatRoom } from "../../components/ChatRoom";
async function getRoomId(slug: string) {
    const response = await axios.get(`${BACKEND_URL}/room/${slug}`, {
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0OGYzOWJiYy02MjMxLTQ0NWYtOWU1Ni1jMDY4OGM0MDgyZWQiLCJpYXQiOjE3NTYyOTYwNzR9.t4cJzjVjtnNyc0ezHNo8FsGjANRP8qlXBn8vYOIawm4`,   // <-- Add token to header
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
