"use client";
import React, { useState } from "react";
import axios from "axios";

const HTTP_BACKEND = "http://localhost:3002";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // ✅ stop page reload

    try {
      if (isSignin) {
        const res = await axios.post(`${HTTP_BACKEND}/auth/signin`, {
          username: email,
          password,
        });
        const { token } = res.data;
        localStorage.setItem("token", token);
        window.location.href = "/rooms";
      } else {
        const res = await axios.post(`${HTTP_BACKEND}/auth/signup`, {
          username: email,
          password,
          name,
        });
        alert(res.data.message);
        window.location.href = "/auth/signin";
      }
    } catch (e: any) {
      setError(e.response?.data?.error || "Something went wrong");
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <div className="p-6 m-2 bg-white rounded shadow-lg w-80">
        <h1 className="text-xl font-semibold mb-4">
          {isSignin ? "Sign In" : "Sign Up"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignin && (
            <div>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
          )}

          <div>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit" // ✅ submit form
            className="bg-red-500 text-white rounded p-2 w-full hover:bg-red-600"
          >
            {isSignin ? "Sign In" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
