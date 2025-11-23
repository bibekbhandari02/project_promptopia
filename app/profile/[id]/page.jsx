"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import { useSession } from "next-auth/react";

import Profile from "@components/Profile";

const UserProfile = ({ params: paramsPromise }) => {
  const searchParams = useSearchParams();
  const userName = searchParams.get("name");
  const { data: session } = useSession();

  const params = use(paramsPromise); // Unwrapping the Promise

  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}/posts`);
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setUserPosts(data);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) fetchPosts();
  }, [params.id]);

  if (!params?.id || !userName) return <div>User not found</div>;

  const handleFollow = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/users/${session.user.id}/follow`, {
        method: "POST",
        body: JSON.stringify({ targetUserId: params.id }),
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {session?.user && session.user.id !== params.id && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleFollow}
            className={`px-5 py-2 rounded-full ${
              isFollowing
                ? "bg-gray-200 text-gray-700"
                : "bg-black text-white"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      )}
      <Profile
        name={userName}
        desc={`Welcome to ${userName}'s personalized profile page. Explore ${userName}'s exceptional prompts and be inspired by the power of their imagination`}
        data={userPosts}
      />
    </div>
  );
};

export default UserProfile;
