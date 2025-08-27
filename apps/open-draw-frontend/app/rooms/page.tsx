"use client";

import { useState } from "react";
import axios from "axios";

const HTTP_BACKEND = "http://localhost:3002";

export default function RoomsPage() {
  const [roomSlug, setRoomSlug] = useState("");
  const [roomName, setroomName] = useState("");
  const [error, setError] = useState("");

  async function createRoom() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not verified!");
        return;
      }
      if (!roomName.trim()) {
        setError("Please enter a room name");
        return;
      }

      const res = await axios.post(
        `${HTTP_BACKEND}/create-room`,
        { roomName: roomName }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { roomId } = res.data;
      alert(res.data.message)
      window.location.href = `/canvas/${roomId}`;
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to create room");
    }
  }

  async function joinRoom() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not verified !");
        return;
      }
      if (!roomSlug.trim()) {
        setError("Please enter a room name");
        return;
      }

      const res = await axios.get(`${HTTP_BACKEND}/room/${roomSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Room details on join room: ",res.data);

      if (res.data ) {
        const roomId = res.data.room.id;
        window.location.href = `/canvas/${roomId}`;
      } else {
        setError("Room not found");
      }
    } catch (e: any) {
      if (e.response?.status === 404) {
        setError("Room not found");
      } else if (e.response?.status === 401) {
        setError("Unauthorized — please sign in again");
      } else {
        setError(e.response?.data?.error || "Failed to join room");
      }
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow-lg w-96 space-y-4">
        <h1 className="text-2xl font-semibold">Welcome!</h1>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="New Room Name"
            value={roomName}
            onChange={(e) => setroomName(e.target.value)}
            className="flex-grow border rounded p-2"
          />
          <button
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
            onClick={createRoom}
          >
            Create
          </button>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter Room Name"
            value={roomSlug}
            onChange={(e) => setRoomSlug(e.target.value)}
            className="flex-grow border rounded p-2"
          />
          <button
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={joinRoom}
          >
            Join
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}
