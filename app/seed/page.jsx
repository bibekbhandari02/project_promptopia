"use client";

import { useState } from "react";

const SeedPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ ${data.message || "Failed to seed database"}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-full flex-center flex-col">
      <h1 className="head_text text-center">
        <span className="blue_gradient">Seed Database</span>
      </h1>
      <p className="desc text-center">
        This will delete all existing prompts and create 15 new sample prompts
      </p>

      <div className="mt-10 flex flex-col items-center gap-4">
        <button
          onClick={handleSeed}
          disabled={loading}
          className="black_btn"
        >
          {loading ? "Seeding..." : "Seed Database with Sample Prompts"}
        </button>

        {message && (
          <div className="mt-4 p-4 rounded-lg bg-gray-100 max-w-2xl">
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="mt-8 p-6 rounded-lg bg-gray-50 max-w-2xl">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure you are signed in first</li>
            <li>Click the button above to seed the database</li>
            <li>Wait for the success message</li>
            <li>Go back to the home page to see the new prompts</li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default SeedPage;
