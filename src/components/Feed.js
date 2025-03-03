import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import "./Feed.css";

function Feed({ setActiveTab, setViewingUserId, setRefreshFunction }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Function to fetch posts that can be called for refresh
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get posts ordered by timestamp (newest first)
      const q = query(
        collection(db, "posts"),
        orderBy("timestamp", "desc"), // This ensures newest posts are first
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const postsData = [];
      
      // Process each post
      for (const docSnapshot of querySnapshot.docs) {
        const postData = docSnapshot.data();
        
        // Skip posts with no timestamp
        if (!postData.timestamp) {
          console.warn("Post missing timestamp:", docSnapshot.id);
          continue;
        }
        
        // Get user data for the post
        const userDoc = await getDoc(doc(db, "users", postData.userId));
        const userData = userDoc.exists() ? userDoc.data() : { username: "Unknown User" };
        
        postsData.push({
          id: docSnapshot.id,
          ...postData,
          username: userData.username,
          userProfilePic: userData.profilePicUrl || null,
          cheersCount: postData.cheersBy?.length || 0,
          hasCheered: postData.cheersBy?.includes(auth.currentUser.uid) || false
        });
      }
      
      // Sort posts by timestamp (newest first) to ensure correct order
      postsData.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });
      
      setPosts(postsData);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch posts when component mounts or refreshKey changes
  useEffect(() => {
    fetchPosts();
  }, [refreshKey]);
  
  // Function to manually refresh the feed
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  const handleCheers = async (postId, hasCheered) => {
    try {
      const postRef = doc(db, "posts", postId);
      
      if (hasCheered) {
        // Remove user from cheersBy array
        await updateDoc(postRef, {
          cheersBy: arrayRemove(auth.currentUser.uid)
        });
        
        // Update local state
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                hasCheered: false,
                cheersCount: post.cheersCount - 1
              } 
            : post
        ));
      } else {
        // Add user to cheersBy array
        await updateDoc(postRef, {
          cheersBy: arrayUnion(auth.currentUser.uid)
        });
        
        // Update local state
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                hasCheered: true,
                cheersCount: post.cheersCount + 1
              } 
            : post
        ));
      }
    } catch (err) {
      console.error("Error updating cheers:", err);
    }
  };
  
  const handleUserClick = (userId) => {
    setViewingUserId(userId);
    setActiveTab("profile");
  };
  
  useEffect(() => {
    // Expose the refresh function to parent components
    if (setRefreshFunction) {
      setRefreshFunction(handleRefresh);
    }
  }, []);
  
  if (loading && posts.length === 0) {
    return (
      <div className="feed-loading">
        <div className="loading-beer">
          <div className="beer-mug">🍺</div>
          <p>Pouring your feed...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="feed-error">
        <p>{error}</p>
        <button onClick={handleRefresh} className="refresh-button">
          Try Again
        </button>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="empty-feed">
        <div className="empty-beer">🍺</div>
        <h3>No brews yet!</h3>
        <p>Be the first to share your favorite beer.</p>
      </div>
    );
  }
  
  return (
    <div className="feed-container">
      <div className="feed-header">
        <h2 className="feed-title">Recent Brews</h2>
        <button 
          onClick={handleRefresh} 
          className="refresh-button"
          aria-label="Refresh feed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="refresh-icon">
            <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <div className="post-header">
            <div className="post-user">
              {post.userProfilePic ? (
                <button 
                  className="post-user-pic-button"
                  onClick={() => handleUserClick(post.userId)}
                  aria-label={`View ${post.username}'s profile`}
                >
                  <img 
                    src={post.userProfilePic} 
                    alt={`${post.username}'s profile`} 
                    className="post-user-pic"
                  />
                </button>
              ) : (
                <button 
                  className="post-user-pic-button"
                  onClick={() => handleUserClick(post.userId)}
                  aria-label={`View ${post.username}'s profile`}
                >
                  <div className="post-user-placeholder">
                    {post.username.charAt(0).toUpperCase()}
                  </div>
                </button>
              )}
              <button 
                className="post-username-button"
                onClick={() => handleUserClick(post.userId)}
              >
                {post.username}
              </button>
              
              {post.location && (
                <div className="post-location">
                  <span className="location-dot">•</span>
                  <span className="location-text">{post.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="post-image-container">
            {post.imageUrl ? (
              <img 
                src={post.imageUrl} 
                alt={post.beerName || "Beer post"} 
                className="post-image"
                loading="lazy"
              />
            ) : (
              <div className="post-image-placeholder">
                <span className="beer-emoji">🍺</span>
              </div>
            )}
          </div>
          
          <div className="post-actions">
            <button 
              className={`cheers-button ${post.hasCheered ? 'cheered' : ''}`}
              onClick={() => handleCheers(post.id, post.hasCheered)}
              aria-label={post.hasCheered ? "Remove cheers" : "Cheers this post"}
            >
              <span className="cheers-icon">🍻</span>
              <span className="cheers-text">
                {post.hasCheered ? "Cheers!" : "Cheers"}
              </span>
            </button>
            
            <div className="cheers-count">
              {post.cheersCount} {post.cheersCount === 1 ? 'cheers' : 'cheers'}
            </div>
          </div>
          
          <div className="post-content">
            <div className="beer-header">
              {post.beerName && (
                <h3 className="beer-name">{post.beerName}</h3>
              )}
              
              {post.beerType && (
                <div className="beer-type">{post.beerType}</div>
              )}
            </div>
            
            {post.brewery && (
              <div className="brewery-name">{post.brewery}</div>
            )}
            
            {post.description && (
              <p className="post-description">{post.description}</p>
            )}
            
            {post.rating && (
              <div className="beer-rating">
                Rating: {post.rating}/5 {renderStars(post.rating)}
              </div>
            )}
            
            <div className="post-timestamp">
              {formatTimestamp(post.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to render star rating
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return (
    <div className="star-rating">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="star full-star">★</span>
      ))}
      {halfStar && <span className="star half-star">★</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="star empty-star">☆</span>
      ))}
    </div>
  );
}

// Helper function to format timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return "Unknown time";
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return "just now";
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHour < 24) {
    return `${diffHour}h ago`;
  } else if (diffDay < 7) {
    return `${diffDay}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export default Feed;