"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const PromptCard = ({ post, handleEdit, handleDelete, handleTagClick, onUpdate }) => {
  const { data: session } = useSession();
  const pathName = usePathname();
  const router = useRouter();

  const [copied, setCopied] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [ratingAverage, setRatingAverage] = useState(post.rating?.average || 0);
  const [hasRated, setHasRated] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Load comment count on mount
  useEffect(() => {
    const loadCommentCount = async () => {
      try {
        const response = await fetch(`/api/prompt/${post._id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setCommentCount(data.length);
        }
      } catch (error) {
        console.log("Error loading comment count:", error);
      }
    };

    loadCommentCount();
  }, [post._id]);

  // Update likes count when post data changes
  useEffect(() => {
    if (post.likes) {
      setLikesCount(Array.isArray(post.likes) ? post.likes.length : 0);
    }
  }, [post.likes, post._id]);

  // Check if user has liked this post
  useEffect(() => {
    if (session?.user?.id && post.likes) {
      const userLiked = post.likes.some(like => {
        const likeId = typeof like === 'object' ? like._id || like.toString() : like;
        const userId = session.user.id;
        return likeId === userId || likeId.toString() === userId.toString();
      });
      setIsLiked(userLiked);
    } else {
      setIsLiked(false);
    }
  }, [session?.user?.id, post.likes]);

  // Check if user has bookmarked this prompt
  useEffect(() => {
    const checkBookmark = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}/bookmark`);
          if (response.ok) {
            const bookmarks = await response.json();
            const isBookmarked = bookmarks.some(bookmark => 
              bookmark._id === post._id || bookmark._id.toString() === post._id
            );
            setIsBookmarked(isBookmarked);
          }
        } catch (error) {
          console.log("Error checking bookmark:", error);
        }
      }
    };

    checkBookmark();
  }, [session?.user?.id, post._id]);

  const handleProfileClick = () => {
    console.log(post);

    if (post.creator._id === session?.user.id) return router.push("/profile");

    router.push(`/profile/${post.creator._id}?name=${post.creator.username}`);
  };

  const handleCopy = () => {
    setCopied(post.prompt);
    navigator.clipboard.writeText(post.prompt);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLike = async () => {
    if (!session?.user) {
      alert("Please sign in to like prompts");
      return;
    }

    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      const response = await fetch(`/api/prompt/${post._id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.id }),
      });
      
      if (!response.ok) {
        // Revert on error
        setIsLiked(!newIsLiked);
        setLikesCount(likesCount);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount(likesCount);
    }
  };

  const handleBookmark = async () => {
    if (!session?.user) {
      alert("Please sign in to bookmark prompts");
      return;
    }

    try {
      const response = await fetch(`/api/users/${session.user.id}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promptId: post._id }),
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.log("Error bookmarking prompt:", error);
    }
  };

  const handleRate = async (rating) => {
    if (!session?.user) {
      alert("Please sign in to rate prompts");
      return;
    }

    if (hasRated) {
      alert("You have already rated this prompt");
      return;
    }

    try {
      const response = await fetch(`/api/prompt/${post._id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the rating display with the new average
        setRatingAverage(data.rating.average);
        setShowRating(false);
        setHasRated(true);
      }
    } catch (error) {
      console.log("Error rating prompt:", error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/prompt/${post._id}/comments`);
      const data = await response.json();
      setComments(data);
      setCommentCount(data.length);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/prompt/${post._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.id, text: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setCommentCount(commentCount + 1);
        setNewComment("");
      }
    } catch (error) {
      console.log("Error posting comment:", error);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this prompt!',
          text: post.prompt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className='prompt_card'>
      <div className='flex justify-between items-start gap-5'>
        <div
          className='flex-1 flex justify-start items-center gap-3 cursor-pointer'
          onClick={handleProfileClick}
        >
          <Image
            src={post.creator.image || "/assets/images/logo.svg"}
            alt='user_image'
            width={40}
            height={40}
            className='rounded-full object-contain'
          />

          <div className='flex flex-col'>
            <h3 className='font-satoshi font-semibold text-gray-900'>
              {post.creator.username}
            </h3>
            <p className='font-inter text-sm text-gray-500'>
              {post.creator.email}
            </p>
          </div>
        </div>

        <div className='copy_btn' onClick={handleCopy}>
          <Image
            src={
              copied === post.prompt
                ? "/assets/icons/tick.svg"
                : "/assets/icons/copy.svg"
            }
            alt={copied === post.prompt ? "tick_icon" : "copy_icon"}
            width={12}
            height={12}
          />
        </div>
      </div>

      <p className='my-4 font-satoshi text-sm text-gray-700'>{post.prompt}</p>
      
      <div className='flex gap-2 items-center mb-2'>
        {post.category && (
          <span className='font-inter text-xs bg-gray-200 px-2 py-1 rounded'>
            {post.category}
          </span>
        )}
        <p
          className='font-inter text-sm blue_gradient cursor-pointer'
          onClick={() => handleTagClick && handleTagClick(post.tag)}
        >
          #{post.tag}
        </p>
      </div>

      {/* Action buttons */}
      <div className='flex gap-4 mt-4 pt-3 border-t border-gray-100'>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
        >
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>{likesCount}</span>
        </button>

        <button
          onClick={toggleComments}
          className='flex items-center gap-1 text-sm text-gray-500'
        >
          <span>💬</span>
          <span>{commentCount}</span>
        </button>

        <button
          onClick={handleBookmark}
          className={`text-sm ${isBookmarked ? 'text-yellow-500' : 'text-gray-500'}`}
        >
          {isBookmarked ? '⭐' : '☆'}
        </button>

        <button
          onClick={() => setShowRating(!showRating)}
          className='text-sm text-gray-500 hover:text-yellow-500 transition'
        >
          ⭐ {ratingAverage.toFixed(1)}
        </button>

        <button
          onClick={handleShare}
          className='text-sm text-gray-500'
        >
          🔗
        </button>
      </div>

      {/* Rating */}
      {showRating && session?.user && (
        <div className='mt-3 p-3 bg-gray-50 rounded-lg'>
          <p className='text-sm text-gray-600 mb-2'>
            {hasRated ? 'You rated this prompt' : 'Rate this prompt:'}
          </p>
          <div className='flex gap-1'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={hasRated}
                className={`text-2xl transition-transform ${
                  hasRated 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:scale-125 cursor-pointer'
                } ${star <= hoverRating ? 'scale-110' : ''}`}
                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                {star <= hoverRating && !hasRated ? '🌟' : '⭐'}
              </button>
            ))}
          </div>
          {hasRated && (
            <p className='text-xs text-green-600 mt-2'>✓ Thank you for rating!</p>
          )}
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div className='mt-4 border-t border-gray-100 pt-3'>
          {session?.user && (
            <form onSubmit={handleCommentSubmit} className='mb-3'>
              <input
                type='text'
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder='Add a comment...'
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded'
              />
            </form>
          )}

          <div className='space-y-2 max-h-60 overflow-y-auto'>
            {comments.map((comment) => (
              <div key={comment._id} className='flex gap-2 text-sm'>
                <img
                  src={comment.user?.image || "/assets/images/logo.svg"}
                  alt='user'
                  width={24}
                  height={24}
                  className='rounded-full'
                />
                <div>
                  <span className='font-semibold'>{comment.user?.username}</span>
                  <p className='text-gray-600'>{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {session?.user.id === post.creator._id && pathName === "/profile" && (
        <div className='mt-5 flex-center gap-4 border-t border-gray-100 pt-3'>
          <p
            className='font-inter text-sm green_gradient cursor-pointer'
            onClick={handleEdit}
          >
            Edit
          </p>
          <p
            className='font-inter text-sm orange_gradient cursor-pointer'
            onClick={handleDelete}
          >
            Delete
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptCard;