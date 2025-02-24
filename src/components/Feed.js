import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    // Get who the user follows
    const followsQuery = query(
      collection(db, "follows"),
      where("followerId", "==", auth.currentUser.uid)
    );

    const unsubscribeFollows = onSnapshot(followsQuery, (snapshot) => {
      const followingIds = snapshot.docs.map((doc) => doc.data().followingId);
      setFollowing(followingIds);

      // Get posts from followed users
      if (followingIds.length > 0) {
        const postsQuery = query(
          collection(db, "posts"),
          where("userId", "in", followingIds)
        );
        const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
          const postData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(postData.sort((a, b) => b.timestamp.localeCompare(a.timestamp))); // Newest first
        });
        return () => unsubscribePosts();
      } else {
        setPosts([]); // No one followed yet
      }
    });

    return () => unsubscribeFollows();
  }, []);

  return (
    <div style={{ padding: "20px", background: "#333", color: "#FFF" }}>
      <h2>Your Brew Feed</h2>
      {posts.length === 0 ? (
        <p>No brews yet—follow some dudes!</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            style={{
              margin: "20px 0",
              borderBottom: "1px solid #FFC107",
            }}
          >
            <img
              src={post.imageUrl}
              alt="beer"
              style={{ maxWidth: "100%", maxHeight: "300px" }}
            />
            <p>
              <strong>{post.username}</strong>: {post.caption}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default Feed;