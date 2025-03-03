import { useState, useEffect } from "react";
import { db, auth, storage } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PostEditModal from "./PostEditModal";
import "./UserProfile.css";

function UserProfile({ userId, setActiveTab }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [editingProfilePic, setEditingProfilePic] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  
  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        setLoading(true);
        
        // Check if viewing own profile
        const currentUserId = auth.currentUser.uid;
        const isOwnProfile = userId === currentUserId;
        setIsCurrentUser(isOwnProfile);
        
        // Get user data
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
          setError("User not found");
          setLoading(false);
          return;
        }
        
        const userData = userDoc.data();
        setUser(userData);
        setBioText(userData.bio || "");
        
        // Check if current user is following this user
        if (!isOwnProfile) {
          const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
          const currentUserData = currentUserDoc.data();
          setIsFollowing((currentUserData.following || []).includes(userId));
        }
        
        // Get user's posts
        const postsQuery = query(collection(db, "posts"), where("userId", "==", userId));
        const postsSnapshot = await getDocs(postsQuery);
        
        const postsData = [];
        postsSnapshot.forEach(doc => {
          postsData.push({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          });
        });
        
        // Sort posts by timestamp (newest first)
        postsData.sort((a, b) => b.timestamp - a.timestamp);
        
        setPosts(postsData);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserAndPosts();
    }
  }, [userId]);
  
  const handleFollow = async () => {
    try {
      const currentUserId = auth.currentUser.uid;
      const currentUserRef = doc(db, "users", currentUserId);
      
      if (isFollowing) {
        // Unfollow
        await updateDoc(currentUserRef, {
          following: arrayRemove(userId)
        });
        setIsFollowing(false);
      } else {
        // Follow
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId)
        });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Error updating follow status:", err);
    }
  };
  
  const handleProfilePicChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicFile(e.target.files[0]);
    }
  };
  
  const handleProfilePicUpload = async () => {
    if (!profilePicFile) return;
    
    try {
      setUploadingProfilePic(true);
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile_pics/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, profilePicFile);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user document
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        profilePicUrl: downloadURL
      });
      
      // Update local state
      setUser(prev => ({
        ...prev,
        profilePicUrl: downloadURL
      }));
      
      setEditingProfilePic(false);
      setProfilePicFile(null);
    } catch (err) {
      console.error("Error uploading profile picture:", err);
    } finally {
      setUploadingProfilePic(false);
    }
  };
  
  const handleBioSave = async () => {
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        bio: bioText
      });
      
      setUser(prev => ({
        ...prev,
        bio: bioText
      }));
      
      setEditingBio(false);
    } catch (err) {
      console.error("Error updating bio:", err);
    }
  };
  
  const handlePostClick = (post) => {
    if (isCurrentUser) {
      setSelectedPost(post);
    }
  };
  
  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
    setSelectedPost(null);
  };
  
  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
    setSelectedPost(null);
  };
  
  const goToAccountSettings = () => {
    setActiveTab("account");
  };
  
  if (loading) {
    return (
      <div className="profile-loading">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="profile-error">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-container">
          {isCurrentUser && (
            <button 
              className="edit-profile-pic-button"
              onClick={() => setEditingProfilePic(!editingProfilePic)}
              aria-label="Edit profile picture"
            >
              <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          )}
          
          {user.profilePicUrl ? (
            <img 
              src={user.profilePicUrl} 
              alt={`${user.username}'s profile`}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {editingProfilePic && (
          <div className="profile-pic-edit">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleProfilePicChange}
              className="profile-pic-input"
            />
            <div className="profile-pic-actions">
              <button 
                className="profile-pic-save"
                onClick={handleProfilePicUpload}
                disabled={!profilePicFile || uploadingProfilePic}
              >
                {uploadingProfilePic ? "Uploading..." : "Save"}
              </button>
              <button 
                className="profile-pic-cancel"
                onClick={() => {
                  setEditingProfilePic(false);
                  setProfilePicFile(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="profile-info">
          <h2 className="profile-username">{user.username}</h2>
          
          {isCurrentUser ? (
            <div className="profile-bio-container">
              {editingBio ? (
                <div className="bio-edit">
                  <textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    className="bio-textarea"
                    placeholder="Write something about yourself..."
                    maxLength={150}
                  />
                  <div className="bio-actions">
                    <button 
                      className="bio-save"
                      onClick={handleBioSave}
                    >
                      Save
                    </button>
                    <button 
                      className="bio-cancel"
                      onClick={() => {
                        setEditingBio(false);
                        setBioText(user.bio || "");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bio-display">
                  <p className="profile-bio">
                    {user.bio || "No bio yet."}
                  </p>
                  <button 
                    className="edit-bio-button"
                    onClick={() => setEditingBio(true)}
                    aria-label="Edit bio"
                  >
                    <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="profile-bio">{user.bio || "No bio yet."}</p>
          )}
          
          {isCurrentUser && (
            <button 
              className="account-settings-button"
              onClick={goToAccountSettings}
            >
              Account Settings
            </button>
          )}
          
          {!isCurrentUser && (
            <button 
              className={`follow-button ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>
      
      <div className="profile-stats">
        <div className="stat">
          <span className="stat-value">{posts.length}</span>
          <span className="stat-label">Posts</span>
        </div>
      </div>
      
      <div className="profile-posts">
        <h3 className="posts-heading">Posts</h3>
        
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet.</p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map(post => (
              <div 
                key={post.id} 
                className={`post-item ${isCurrentUser ? 'clickable' : ''}`}
                onClick={() => handlePostClick(post)}
              >
                {post.imageUrl ? (
                  <img 
                    src={post.imageUrl} 
                    alt={post.beerName}
                    className="post-image"
                  />
                ) : (
                  <div className="post-image-placeholder">
                    <span className="beer-icon">🍺</span>
                  </div>
                )}
                <div className="post-overlay">
                  <h4 className="post-title">{post.beerName}</h4>
                  <div className="post-meta">
                    <span className="post-brewery">{post.brewery}</span>
                    <span className="post-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span 
                          key={i} 
                          className={`star ${i < post.rating ? 'filled' : ''}`}
                        >
                          ★
                        </span>
                      ))}
                    </span>
                  </div>
                  {isCurrentUser && (
                    <div className="post-edit-hint">
                      <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                      <span>Edit</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedPost && (
        <PostEditModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdate={handlePostUpdate}
          onDelete={handlePostDelete}
        />
      )}
    </div>
  );
}

export default UserProfile; 