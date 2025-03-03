import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useState } from "react";
import "./Header.css";

function Header({ setActiveTab, refreshFeed, isLoggedIn, setViewingUserId }) {
  const [showMenu, setShowMenu] = useState(false);
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const handleLogoClick = () => {
    if (isLoggedIn) {
      setActiveTab("feed");
      if (refreshFeed) {
        refreshFeed();
      }
    }
  };
  
  const handleAccountClick = () => {
    if (auth.currentUser) {
      setViewingUserId(auth.currentUser.uid);
      setActiveTab("profile");
    }
  };
  
  return (
    <header className="app-header">
      <div className="header-content">
        {isLoggedIn && (
          <button 
            className="account-button"
            onClick={handleAccountClick}
            aria-label="Go to your profile"
          >
            <svg className="account-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </button>
        )}
        
        {!isLoggedIn && <div className="header-spacer"></div>}
        
        <button 
          className="logo-button"
          onClick={handleLogoClick}
          aria-label="Go to feed"
        >
          <div className="logo-container">
            <h1 className="app-title">Suds</h1>
            <span className="beer-logo">🍺</span>
          </div>
        </button>
        
        {isLoggedIn ? (
          <button 
            className="menu-button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Toggle menu"
          >
            <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        ) : (
          <div className="header-spacer"></div>
        )}
        
        {showMenu && isLoggedIn && (
          <div className="dropdown-menu">
            <button 
              className="menu-item"
              onClick={() => {
                setActiveTab("feed");
                setShowMenu(false);
                if (refreshFeed) {
                  refreshFeed();
                }
              }}
            >
              Feed
            </button>
            <button 
              className="menu-item"
              onClick={() => {
                setActiveTab("post");
                setShowMenu(false);
              }}
            >
              Post a Brew
            </button>
            <button 
              className="menu-item"
              onClick={() => {
                setActiveTab("search");
                setShowMenu(false);
              }}
            >
              Find Friends
            </button>
            <button 
              className="menu-item"
              onClick={() => {
                setActiveTab("account");
                setShowMenu(false);
              }}
            >
              Account Settings
            </button>
            <button 
              className="menu-item sign-out"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;