import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import "./UserSearch.css";

function UserSearch() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [following, setFollowing] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get current user's following list
        const currentUserDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        const currentUserData = currentUserDoc.data();
        setFollowing(currentUserData.following || []);
        
        // Get all users
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        
        const usersData = [];
        
        // Process each user and calculate total cheers
        for (const userDoc of usersSnapshot.docs) {
          // Skip current user
          if (userDoc.id === auth.currentUser.uid) continue;
          
          const userData = userDoc.data();
          
          // Get user's posts to calculate total cheers
          const postsQuery = query(collection(db, "posts"));
          const postsSnapshot = await getDocs(postsQuery);
          
          let totalCheers = 0;
          
          // Count cheers on user's posts
          postsSnapshot.docs.forEach(postDoc => {
            const postData = postDoc.data();
            if (postData.userId === userDoc.id) {
              totalCheers += (postData.cheersBy?.length || 0);
            }
          });
          
          usersData.push({
            id: userDoc.id,
            username: userData.username,
            profilePicUrl: userData.profilePicUrl,
            bio: userData.bio,
            totalCheers: totalCheers,
            isFollowing: following.includes(userDoc.id)
          });
        }
        
        // Sort users by total cheers (highest first)
        usersData.sort((a, b) => b.totalCheers - a.totalCheers);
        
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);
  
  const handleFollow = async (userId) => {
    try {
      const currentUserRef = doc(db, "users", auth.currentUser.uid);
      
      // Check if already following
      const isFollowing = following.includes(userId);
      
      if (isFollowing) {
        // Unfollow
        await updateDoc(currentUserRef, {
          following: arrayRemove(userId)
        });
        
        setFollowing(following.filter(id => id !== userId));
        
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isFollowing: false } : user
        ));
        setFilteredUsers(filteredUsers.map(user => 
          user.id === userId ? { ...user, isFollowing: false } : user
        ));
      } else {
        // Follow
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId)
        });
        
        setFollowing([...following, userId]);
        
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isFollowing: true } : user
        ));
        setFilteredUsers(filteredUsers.map(user => 
          user.id === userId ? { ...user, isFollowing: true } : user
        ));
      }
    } catch (err) {
      console.error("Error updating follow status:", err);
    }
  };
  
  return (
    <div className="search-container">
      <div className="search-header">
        <h2 className="search-title">Find Friends</h2>
        <p className="search-subtitle">Connect with other Suds users</p>
      </div>
      
      <div className="search-bar-container">
        <div className="search-bar">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search-button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="search-loading">
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <div className="search-error">
          <p>{error}</p>
        </div>
      ) : (
        <div className="users-list">
          {filteredUsers.length === 0 ? (
            <div className="no-users-found">
              <p>No users found matching "{searchTerm}"</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.profilePicUrl ? (
                      <img 
                        src={user.profilePicUrl} 
                        alt={`${user.username}'s profile`}
                        className="user-avatar-img"
                      />
                    ) : (
                      <div className="user-avatar-placeholder">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <h3 className="user-username">{user.username}</h3>
                    {user.bio && <p className="user-bio">{user.bio}</p>}
                    <div className="user-stats">
                      <div className="user-cheers">
                        <span className="cheers-icon">🍻</span>
                        <span className="cheers-count">{user.totalCheers}</span>
                        <span className="cheers-label">total cheers</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  className={`follow-button ${user.isFollowing ? 'following' : ''}`}
                  onClick={() => handleFollow(user.id)}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default UserSearch;