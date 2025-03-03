import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./Account.css";

function Account({ setActiveTab }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [favoriteBeer, setFavoriteBeer] = useState("");
  const [city, setCity] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          // Initialize form state
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setUsername(data.username || "");
          setPhoneNumber(data.phoneNumber || "");
          setFavoriteBeer(data.favoriteBeer || "");
          setCity(data.city || "");
        } else {
          setError("User data not found");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load account data");
      } finally {
        setLoading(false);
      }
    };
    
    if (auth.currentUser) {
      fetchUserData();
    }
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
  
  if (loading && !userData) {
    return <div className="account-loading">Loading your account details...</div>;
  }
  
  return (
    <div className="account-container">
      <div className="account-header">
        <h2>My Account</h2>
        <p>Manage your beer profile</p>
      </div>
      
      {/* Back to Feed button */}
      <div className="back-to-feed">
        <button 
          onClick={() => setActiveTab("feed")}
          className="back-button"
        >
          ← Back to Feed
        </button>
      </div>
      
      {error && <div className="account-error">{error}</div>}
      {updateSuccess && <div className="account-success">Account updated successfully!</div>}
      
      {!isEditing ? (
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
      ) : (
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
        </form>
      )}
    </div>
  );
}

export default Account; 