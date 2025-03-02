import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followStatus, setFollowStatus] = useState({});

  // Check if current user follows the displayed users
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (users.length === 0) return;

      const newFollowStatus = { ...followStatus };
      
      for (const user of users) {
        // Skip checking yourself
        if (user.id === auth.currentUser.uid) continue;
        
        const followRef = doc(db, "follows", `${auth.currentUser.uid}_${user.id}`);
        const followDoc = await getDoc(followRef);
        
        newFollowStatus[user.id] = followDoc.exists();
      }
      
      setFollowStatus(newFollowStatus);
    };
    
    checkFollowStatus();
  }, [users]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    
    try {
      // Search by email (case insensitive would require a different approach in Firestore)
      const q = query(
        collection(db, "users"),
        where("email", ">=", searchTerm),
        where("email", "<=", searchTerm + "\uf8ff")
      );
      
      const querySnapshot = await getDocs(q);
      
      const userResults = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => user.id !== auth.currentUser.uid); // Filter out current user
      
      setUsers(userResults);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (userId) => {
    const followId = `${auth.currentUser.uid}_${userId}`;
    const followRef = doc(db, "follows", followId);
    
    try {
      if (followStatus[userId]) {
        // Unfollow
        await deleteDoc(followRef);
        setFollowStatus({ ...followStatus, [userId]: false });
      } else {
        // Follow
        await setDoc(followRef, {
          followerId: auth.currentUser.uid,
          followingId: userId,
          timestamp: new Date().toISOString()
        });
        setFollowStatus({ ...followStatus, [userId]: true });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  return (
    <div>
      <div className="flex mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by email..."
          className="flex-1 p-3 border border-amber-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-r-lg transition disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      
      <div>
        {users.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            {searchTerm ? "No users found matching your search" : "Search for beer enthusiasts by email"}
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 text-xl font-bold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">{user.username || user.email.split("@")[0]}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`py-2 px-4 rounded-full transition ${
                    followStatus[user.id] 
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-200" 
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                >
                  {followStatus[user.id] ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserSearch;