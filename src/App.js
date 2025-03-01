import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Login from "./components/Login";
import Signup from "./components/Signup";
import PostForm from "./components/PostForm";
import Feed from "./components/Feed";
import Header from "./components/Header";
import UserSearch from "./components/UserSearch";

function App() {
  const [user, loading, error] = useAuthState(auth);
  const [showSignup, setShowSignup] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Get rough count of users for display
    if (user) {
      const fetchUserCount = async () => {
        const q = query(collection(db, "users"));
        const snapshot = await getDocs(q);
        setUserCount(snapshot.size);
      };
      
      fetchUserCount().catch(console.error);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-bounce bg-amber-500 p-2 rounded-full">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <p className="mt-2 text-amber-800 font-medium">Loading Suds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-red-500 text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-700">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {user ? (
        <>
          <Header />
          
          <main className="container mx-auto px-4 py-6">
            {/* Tab navigation */}
            <div className="bg-white rounded-lg shadow-md p-1 mb-6 flex">
              <button
                onClick={() => setActiveTab("feed")}
                className={`flex-1 py-2 rounded-md ${
                  activeTab === "feed" ? "bg-amber-500 text-white" : "text-amber-700"
                }`}
              >
                My Feed
              </button>
              <button
                onClick={() => setActiveTab("explore")}
                className={`flex-1 py-2 rounded-md ${
                  activeTab === "explore" ? "bg-amber-500 text-white" : "text-amber-700"
                }`}
              >
                Explore
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-2 rounded-md ${
                  activeTab === "profile" ? "bg-amber-500 text-white" : "text-amber-700"
                }`}
              >
                Profile
              </button>
            </div>
            
            {activeTab === "feed" && (
              <>
                <PostForm />
                <Feed />
              </>
            )}
            
            {activeTab === "explore" && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-4">Find Brew Buddies</h2>
                <p className="text-gray-700 mb-4">
                  There are currently {userCount} beer enthusiasts on Suds!
                </p>
                <UserSearch />
              </div>
            )}
            
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-4">My Profile</h2>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 text-3xl font-bold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user.email.split("@")[0]}</h3>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                {/* Profile info/stats would go here */}
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-amber-800">0</p>
                    <p className="text-amber-600">Posts</p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-amber-800">0</p>
                    <p className="text-amber-600">Following</p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-amber-800">0</p>
                    <p className="text-amber-600">Followers</p>
                  </div>
                </div>
                
                {/* Settings button */}
                <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition">
                  Edit Profile
                </button>
              </div>
            )}
          </main>
        </>
      ) : (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {showSignup ? (
              <Signup setShowSignup={setShowSignup} />
            ) : (
              <Login setShowSignup={setShowSignup} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;