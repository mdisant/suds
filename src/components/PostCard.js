import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      {/* User info header */}
      <div className="flex items-center p-4 border-b">
        <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold">
          {post.username.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <p className="font-semibold">{post.username}</p>
          <p className="text-xs text-gray-500">
            {post.timestamp ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true }) : "Just now"}
          </p>
        </div>
      </div>
      
      {/* Beer image */}
      <div className="relative">
        <img 
          src={post.imageUrl} 
          alt="Beer" 
          className="w-full object-cover" 
          style={{ maxHeight: "500px" }}
        />
      </div>
      
      {/* Caption and actions */}
      <div className="p-4">
        <div className="flex space-x-4 mb-2">
          <button 
            onClick={() => setIsLiked(!isLiked)} 
            className={`flex items-center space-x-1 ${isLiked ? 'text-amber-500' : 'text-gray-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Cheers</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Comment</span>
          </button>
        </div>
        
        <p className="text-gray-800">
          <span className="font-semibold">{post.username}: </span>
          {post.caption}
        </p>
      </div>
    </div>
  );
}

export default PostCard;