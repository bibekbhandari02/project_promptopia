"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Profile from "@components/Profile";

const Bookmarks = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (session?.user.id) {
        const response = await fetch(`/api/users/${session.user.id}/bookmark`);
        const data = await response.json();

        setBookmarkedPosts(data);
      }
    };

    if (session?.user.id) fetchBookmarks();
  }, [session?.user.id]);

  const handleEdit = (post) => {
    router.push(`/update-prompt?id=${post._id}`);
  };

  const handleDelete = async (post) => {
    const hasConfirmed = confirm(
      "Are you sure you want to remove this bookmark?"
    );

    if (hasConfirmed) {
      try {
        await fetch(`/api/users/${session.user.id}/bookmark`, {
          method: "POST",
          body: JSON.stringify({ promptId: post._id }),
        });

        const filteredPosts = bookmarkedPosts.filter((item) => item._id !== post._id);

        setBookmarkedPosts(filteredPosts);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Profile
      name='My Bookmarks'
      desc='Your saved prompts'
      data={bookmarkedPosts}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
    />
  );
};

export default Bookmarks;
