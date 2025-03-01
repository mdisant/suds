import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import PostCard from "./PostCard";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get who the user follows
    const followsQuery = query(
      collection(db, "follows"),
      where("followerId", "==", auth.currentUser.uid)
    );

    const unsubscribeFollows = onSnapshot(followsQuery, (snapshot) => {
      const followingIds = snapshot.docs.map((doc) => doc.data().followingId);
      
      // Always include the user's own posts
      followingIds.push(auth.currentUser.uid);
      
      // Get posts from followed users and self
      if (followingIds.length > 0) {
        const postsQuery = query(
          collection(db, "posts"),
          where("userId", "in", followingIds),
          orderBy("timestamp", "desc"),
          limit(50)
        );
        
        const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
          const postData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(postData);
          setLoading(false);
        });
        
        return () => unsubscribePosts();
      } else {
        setPosts([]); // No one followed yet
        setLoading(false);
      }
    });

    return () => unsubscribeFollows();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          <p className="mt-2 text-amber-600">Loading brews...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="w-16 h-16 text-amber-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Brews Yet</h3>
          <p className="text-gray-600 mb-6">
            Your feed is empty. Start following other brew enthusiasts or post your own beer!
          </p>
          <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition">
            Explore Users
          </button>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Feed;