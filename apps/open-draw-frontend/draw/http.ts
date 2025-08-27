import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: Number) {
     const room = roomId.toString();
     console.log("room string in http.ts: ",room);
     
    const res = await axios.get(`http://localhost:3002/chats/${room}`,
        {
            headers: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0OGYzOWJiYy02MjMxLTQ0NWYtOWU1Ni1jMDY4OGM0MDgyZWQiLCJpYXQiOjE3NTYyOTYwNzR9.t4cJzjVjtnNyc0ezHNo8FsGjANRP8qlXBn8vYOIawm4`
            }
        }
    );
    console.log("res.data in https for chats of room: ",res.data);
    
    const messages = res.data.messages;

    const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message)
        return messageData.shape;
    })

    return shapes;
}