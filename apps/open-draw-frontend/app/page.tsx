export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-5xl font-bold mb-4 text-gray-800">
        OpenDraw
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        A simple, collaborative whiteboard — powered by Excalidraw.
      </p>
      <div className="flex gap-4">
        <a
          href="/auth/signup"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          Sign Up
        </a>
        <a
          href="/auth/signin"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl shadow hover:bg-gray-300 transition"
        >
          Sign In
        </a>
      </div>
    </main>
  );
}
