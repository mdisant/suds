import { useState, useEffect, useRef } from "react";
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
import UserProfile from "./components/UserProfile";
import './App.css';

function App() {
  const [user, loading, error] = useAuthState(auth);
  const [showSignup, setShowSignup] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [viewingUserId, setViewingUserId] = useState(null);
  const feedRefreshRef = useRef(null);
  
  useEffect(() => {
    if (user) {
      setActiveTab("feed");
    }
  }, [user]);
  
  // Function to refresh the feed
  const refreshFeed = () => {
    if (feedRefreshRef.current) {
      feedRefreshRef.current();
    }
  };
  
  // When activeTab changes to feed, refresh the feed
  useEffect(() => {
    if (activeTab === "feed") {
      refreshFeed();
    }
  }, [activeTab]);

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
        <Header 
          setActiveTab={setActiveTab} 
          refreshFeed={refreshFeed} 
          isLoggedIn={false} 
          setViewingUserId={setViewingUserId}
        />
        <div className="auth-wrapper">
          {showSignup ? (
            <Signup setShowSignup={setShowSignup} />
          ) : (
            <Login setShowSignup={setShowSignup} setActiveTab={setActiveTab} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header 
        setActiveTab={setActiveTab} 
        refreshFeed={refreshFeed} 
        isLoggedIn={true} 
        setViewingUserId={setViewingUserId}
      />
      <div className="main-content">
        {activeTab !== "account" && activeTab !== "profile" && (
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === "feed" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("feed");
                refreshFeed();
              }}
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
        )}
        
        {activeTab === "feed" && (
          <Feed 
            setActiveTab={setActiveTab} 
            setViewingUserId={setViewingUserId} 
            setRefreshFunction={(refreshFunc) => {
              feedRefreshRef.current = refreshFunc;
            }}
          />
        )}
        {activeTab === "post" && <PostForm setActiveTab={setActiveTab} />}
        {activeTab === "search" && <UserSearch />}
        {activeTab === "account" && <Account setActiveTab={setActiveTab} />}
        {activeTab === "profile" && <UserProfile userId={viewingUserId} setActiveTab={setActiveTab} />}
      </div>
    </div>
  );
}

export default App;