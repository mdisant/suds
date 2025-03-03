import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser, updateProfile } from "firebase/auth";
import "./Account.css";

function Account({ setActiveTab }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [favoriteBeer, setFavoriteBeer] = useState("");
  const [city, setCity] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user data
        const user = auth.currentUser;
        if (!user) {
          setError("User not authenticated");
          return;
        }
        
        setEmail(user.email || "");
        
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || "");
          setUserData(data);
          
          // Initialize form state
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setPhoneNumber(data.phoneNumber || "");
          setFavoriteBeer(data.favoriteBeer || "");
          setCity(data.city || "");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load account data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError("");
      setUpdateSuccess(false);
      
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        firstName,
        lastName,
        username,
        phoneNumber,
        favoriteBeer,
        city,
        updatedAt: new Date().toISOString()
      });
      
      setUserData({
        ...userData,
        firstName,
        lastName,
        username,
        phoneNumber,
        favoriteBeer,
        city
      });
      
      setIsEditing(false);
      setUpdateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating user data:", err);
      setError("Failed to update account data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (!password) {
      setDeleteError("Password is required to delete your account");
      return;
    }
    
    try {
      setDeleteLoading(true);
      setDeleteError("");
      
      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Delete user data from Firestore
      await deleteDoc(doc(db, "users", auth.currentUser.uid));
      
      // Delete user posts (you may want to add this functionality)
      // const postsQuery = query(collection(db, "posts"), where("userId", "==", auth.currentUser.uid));
      // const postsSnapshot = await getDocs(postsQuery);
      // const deletePromises = postsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      // await Promise.all(deletePromises);
      
      // Delete user authentication
      await deleteUser(auth.currentUser);
      
      // User will be automatically logged out after deletion
    } catch (err) {
      console.error("Error deleting account:", err);
      
      if (err.code === 'auth/wrong-password') {
        setDeleteError("Incorrect password. Please try again.");
      } else {
        setDeleteError("Failed to delete account. Please try again later.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      setUpdateSuccess(false);
      
      const user = auth.currentUser;
      
      // Update in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        username: username
      });
      
      // Update in Auth profile
      await updateProfile(user, {
        displayName: username
      });
      
      setUserData({
        ...userData,
        username: username
      });
      
      setIsEditing(false);
      setUpdateSuccess(true);
    } catch (err) {
      console.error("Error updating username:", err);
      setError("Failed to update username. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackToProfile = () => {
    if (auth.currentUser) {
      setActiveTab("profile");
    }
  };
  
  if (loading && !userData) {
    return (
      <div className="account-loading">
        <p>Loading account data...</p>
      </div>
    );
  }
  
  return (
    <div className="account-container">
      <div className="account-header">
        <button 
          className="back-button"
          onClick={handleBackToProfile}
        >
          <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Profile
        </button>
        <h2 className="account-title">Account Settings</h2>
      </div>
      
      {error && (
        <div className="account-error">
          <p>{error}</p>
        </div>
      )}
      
      {updateSuccess && (
        <div className="account-success">
          <p>Account updated successfully!</p>
        </div>
      )}
      
      {!isEditing && !showDeleteConfirm ? (
        <div className="account-details">
          <div className="account-section">
            <h3>Personal Information</h3>
            <div className="account-info-grid">
              <div className="account-info-item">
                <span className="account-label">Name</span>
                <span className="account-value">{userData?.firstName} {userData?.lastName}</span>
              </div>
              <div className="account-info-item">
                <span className="account-label">Username</span>
                <span className="account-value">{userData?.username}</span>
              </div>
              <div className="account-info-item">
                <span className="account-label">Email</span>
                <span className="account-value">{userData?.email}</span>
              </div>
              <div className="account-info-item">
                <span className="account-label">Phone</span>
                <span className="account-value">{userData?.phoneNumber || "Not provided"}</span>
              </div>
            </div>
          </div>
          
          <div className="account-section">
            <h3>Beer Preferences</h3>
            <div className="account-info-grid">
              <div className="account-info-item">
                <span className="account-label">Favorite Beer</span>
                <span className="account-value">{userData?.favoriteBeer || "Not specified"}</span>
              </div>
              <div className="account-info-item">
                <span className="account-label">City</span>
                <span className="account-value">{userData?.city || "Not specified"}</span>
              </div>
            </div>
          </div>
          
          <div className="account-actions">
            <button 
              onClick={() => setIsEditing(true)}
              className="account-button edit"
            >
              Edit Profile
            </button>
            <button 
              onClick={() => auth.signOut()}
              className="account-button logout"
            >
              Log Out
            </button>
          </div>
        </div>
      ) : isEditing && !showDeleteConfirm ? (
        <form onSubmit={handleUpdate} className="account-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="required-field">First Name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName" className="required-field">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="username" className="required-field">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phoneNumber" className="required-field">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="favoriteBeer">Favorite Beer (Optional)</label>
              <input
                id="favoriteBeer"
                type="text"
                value={favoriteBeer}
                onChange={(e) => setFavoriteBeer(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">City (Optional)</label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="account-form-actions">
            <div className="account-form-actions-left">
              <button 
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="account-button delete"
                disabled={loading}
              >
                Delete Account
              </button>
            </div>
            <div className="account-form-actions-right">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="account-button cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="account-button save"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="delete-account-container">
          <h3 className="delete-account-title">Delete Your Account</h3>
          
          <div className="delete-account-warning">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="warning-icon">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            <p>
              This action <strong>cannot be undone</strong>. This will permanently delete your account, profile information, and all your posts.
            </p>
          </div>
          
          {deleteError && <div className="delete-account-error">{deleteError}</div>}
          
          <form onSubmit={handleDeleteAccount} className="delete-account-form">
            <div className="form-group">
              <label htmlFor="password" className="required-field">Enter your password to confirm</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={deleteLoading}
                placeholder="Your password"
                className="delete-password-input"
              />
            </div>
            
            <div className="delete-account-actions">
              <button 
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPassword("");
                  setDeleteError("");
                }}
                className="account-button cancel"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="account-button delete-confirm"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Account; 