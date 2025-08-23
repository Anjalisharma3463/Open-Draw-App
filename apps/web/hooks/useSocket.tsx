import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MTcyOTcxYy1hYzlkLTQ5YjctYmRmYi0wZDNkYjljNDk1MGEiLCJpYXQiOjE3NTU0NDk0OTJ9.rdGDqwDXI72tan6QAw72F_FVY9l6YIoIqmTUY7t01-E
`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        socket,
        loading
    }

}


// ws.onclose = () => {
//   console.log("Socket closed. Reconnecting in 2s...");
//   setTimeout(() => connectAgain(), 2000);
// };