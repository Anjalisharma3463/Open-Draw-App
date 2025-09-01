import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: Number) {
     const room = roomId.toString();
     const token = localStorage.getItem("token");
     console.log("room string in http.ts: ",room);
     
    const res = await axios.get(`http://localhost:3002/chats/${room}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
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