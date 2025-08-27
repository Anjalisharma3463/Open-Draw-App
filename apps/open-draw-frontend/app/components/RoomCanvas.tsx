"use client";
import { WS_URL } from "@/config";
import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: Number}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0OGYzOWJiYy02MjMxLTQ0NWYtOWU1Ni1jMDY4OGM0MDgyZWQiLCJpYXQiOjE3NTYyOTYwNzR9.t4cJzjVjtnNyc0ezHNo8FsGjANRP8qlXBn8vYOIawm4`)

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log(data);
            console.log("type of room id in  RoomCanvas going to ws connectoi srver: ", typeof(roomId));
            ws.send(data)
        }
        
    }, [WS_URL, roomId])
   
    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}