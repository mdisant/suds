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
import Account from "./components/Account";
import './App.css';

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
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-icon">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <p className="loading-text">Loading Suds...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        <Header setActiveTab={setActiveTab} />
        <div className="auth-wrapper">
          {showSignup ? (
            <Signup setShowSignup={setShowSignup} />
          ) : (
            <Login setShowSignup={setShowSignup} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header setActiveTab={setActiveTab} />
      <div className="main-content">
        {activeTab !== "account" && (
          <>
            <div className="user-stats">
              <div className="user-stats-count">{userCount}</div>
              <div className="user-stats-label">Beer Enthusiasts</div>
            </div>
            
            <div className="tab-navigation">
              <button 
                className={`tab-button ${activeTab === "feed" ? "active" : ""}`}
                onClick={() => setActiveTab("feed")}
              >
                Feed
              </button>
              <button 
                className={`tab-button ${activeTab === "post" ? "active" : ""}`}
                onClick={() => setActiveTab("post")}
              >
                Post a Brew
              </button>
              <button 
                className={`tab-button ${activeTab === "search" ? "active" : ""}`}
                onClick={() => setActiveTab("search")}
              >
                Find Friends
              </button>
            </div>
          </>
        )}
        
        {activeTab === "feed" && <Feed />}
        {activeTab === "post" && <PostForm />}
        {activeTab === "search" && <UserSearch />}
        {activeTab === "account" && <Account setActiveTab={setActiveTab} />}
      </div>
    </div>
  );
}

export default App;