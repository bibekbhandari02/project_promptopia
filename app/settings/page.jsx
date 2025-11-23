"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Settings = () => {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ posts: 0, bookmarks: 0, following: 0 });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (session?.user?.name) {
      setUsername(session.user.name);
    }
    if (session?.user?.image) {
      setImagePreview(session.user.image);
    }
  }, [session]);

  useEffect(() => {
    const fetchStats = async () => {
      if (session?.user?.id) {
        try {
          // Fetch user's posts count
          const postsRes = await fetch(`/api/users/${session.user.id}/posts`);
          const posts = await postsRes.json();

          // Fetch user's bookmarks count
          const bookmarksRes = await fetch(`/api/users/${session.user.id}/bookmark`);
          let bookmarks = [];
          if (bookmarksRes.ok) {
            bookmarks = await bookmarksRes.json();
          }

          setStats({
            posts: posts.length || 0,
            bookmarks: Array.isArray(bookmarks) ? bookmarks.length : 0,
            following: 0, // You can add this later
          });
        } catch (error) {
          console.log("Error fetching stats:", error);
          setStats({
            posts: 0,
            bookmarks: 0,
            following: 0,
          });
        }
      }
    };

    fetchStats();
  }, [session?.user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!session?.user?.id) {
      setMessage("❌ Please sign in first");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${session.user.id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        setMessage("✅ Username updated successfully! Refreshing...");
        
        // Refresh the page after 1 second to update the session
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.error || "Failed to update username"}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="w-full max-w-full flex-center flex-col">
        <h1 className="head_text text-center">
          <span className="blue_gradient">Settings</span>
        </h1>
        <p className="desc text-center mt-5">Please sign in to access settings</p>
      </div>
    );
  }

  return (
    <section className="w-full max-w-full flex-center flex-col">
      <h1 className="head_text text-center">
        <span className="blue_gradient">Account Settings</span>
      </h1>
      <p className="desc text-center">Update your profile information</p>

      {/* Profile Stats */}
      <div className="mt-8 w-full max-w-2xl grid grid-cols-3 gap-4">
        <div className="glassmorphism p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{stats.posts}</p>
          <p className="text-sm text-gray-600">Posts</p>
        </div>
        <div className="glassmorphism p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{stats.bookmarks}</p>
          <p className="text-sm text-gray-600">Bookmarks</p>
        </div>
        <div className="glassmorphism p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{stats.following}</p>
          <p className="text-sm text-gray-600">Following</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
      >
        {/* Profile Picture */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
          <img
            src={imagePreview || "/assets/icons/user.svg"}
            alt="profile"
            className="w-20 h-20 rounded-full object-cover bg-gray-200 p-1"
          />
          <div className="flex-1">
            <p className="font-satoshi font-semibold text-gray-900">
              Profile Picture
            </p>
            <p className="text-sm text-gray-500 mb-2">
              {session.user.image ? 'From your Google account' : 'Upload a custom picture'}
            </p>
            <label className="cursor-pointer">
              <span className="text-sm text-blue-600 hover:text-blue-700">
                {uploadingImage ? 'Uploading...' : 'Change Picture'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingImage}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // For now, just show preview
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreview(reader.result);
                    };
                    reader.readAsDataURL(file);
                    setMessage("⚠️ Image upload feature coming soon! For now, your Google profile picture is used.");
                  }
                }}
              />
            </label>
          </div>
        </div>

        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Username
          </span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Enter your username"
            required
            minLength={8}
            maxLength={20}
            className="form_input"
          />
          <p className="text-sm text-gray-500 mt-2">
            8-20 characters, letters, numbers, dots and underscores only
          </p>
        </label>

        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Email
          </span>
          <input
            value={session.user.email}
            type="email"
            disabled
            className="form_input bg-gray-100 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-2">
            Email cannot be changed
          </p>
        </label>

        {message && (
          <div className="p-4 rounded-lg bg-gray-100">
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="flex-end mx-3 mb-5 gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-gray-500 text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-1.5 text-sm bg-primary-orange rounded-full text-white"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Settings;
