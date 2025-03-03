import { useState, useRef } from "react";
import { auth, db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./PostForm.css";

function PostForm({ setActiveTab }) {
  const [beerName, setBeerName] = useState("");
  const [brewery, setBrewery] = useState("");
  const [beerType, setBeerType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  
  const beerTypes = [
    "IPA",
    "Lager",
    "Pilsner",
    "Stout",
    "Porter",
    "Wheat Beer",
    "Pale Ale",
    "Sour",
    "Belgian",
    "Amber Ale",
    "Brown Ale",
    "Hefeweizen",
    "Saison",
    "Barleywine",
    "Kölsch",
    "Other"
  ];
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      
      // Check file size (limit to 5MB)
      if (selectedImage.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      
      setImage(selectedImage);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(selectedImage);
      
      // Clear any previous errors
      setError("");
    }
  };
  
  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!beerName.trim()) {
      setError("Beer name is required");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      let imageUrl = null;
      
      // Upload image if one was selected
      if (image) {
        const storageRef = ref(storage, `beer_images/${auth.currentUser.uid}_${Date.now()}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Add post to Firestore
      await addDoc(collection(db, "posts"), {
        userId: auth.currentUser.uid,
        beerName: beerName.trim(),
        brewery: brewery.trim() || null,
        beerType: beerType || null,
        location: location.trim() || null,
        description: description.trim() || null,
        rating: rating || null,
        imageUrl,
        timestamp: serverTimestamp(),
        cheersBy: []
      });
      
      // Reset form
      setBeerName("");
      setBrewery("");
      setBeerType("");
      setLocation("");
      setDescription("");
      setRating(0);
      setImage(null);
      setImagePreview(null);
      
      // Show success message
      setSuccess(true);
      
      // Redirect to feed after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        if (setActiveTab) {
          setActiveTab("feed");
        }
      }, 2000);
      
    } catch (err) {
      console.error("Error adding post:", err);
      setError("Failed to post. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="post-form-container">
      <h2 className="post-form-title">Share Your Brew</h2>
      
      {error && <div className="post-form-error">{error}</div>}
      
      {success && (
        <div className="post-form-success">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="success-icon">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
          <p>Your brew has been posted!</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="post-form">
        <div className="post-form-image-section">
          <div 
            className="image-upload-area"
            onClick={triggerFileInput}
          >
            {imagePreview ? (
              <div className="image-preview-container">
                <img 
                  src={imagePreview} 
                  alt="Beer preview" 
                  className="image-preview"
                />
              </div>
            ) : (
              <div className="image-upload-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="upload-icon">
                  <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                </svg>
                <p>Click to upload a photo of your beer</p>
                <span className="upload-note">(Max size: 5MB)</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden-file-input"
            />
          </div>
        </div>
        
        <div className="post-form-details">
          <div className="form-group">
            <label htmlFor="beerName" className="required-field">Beer Name</label>
            <input
              id="beerName"
              type="text"
              value={beerName}
              onChange={(e) => setBeerName(e.target.value)}
              placeholder="What beer are you drinking?"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="brewery">Brewery</label>
            <input
              id="brewery"
              type="text"
              value={brewery}
              onChange={(e) => setBrewery(e.target.value)}
              placeholder="Who made this beer?"
              disabled={loading}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="beerType">Beer Type</label>
              <select
                id="beerType"
                value={beerType}
                onChange={(e) => setBeerType(e.target.value)}
                disabled={loading}
              >
                <option value="">Select a type</option>
                {beerTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you enjoying this?"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Your Thoughts</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you think about this beer?"
              rows="3"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Rating</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className={`rating-star ${star <= rating ? 'active' : ''}`}
                  disabled={loading}
                  aria-label={`Rate ${star} out of 5 stars`}
                >
                  {star <= rating ? '★' : '☆'}
                </button>
              ))}
              {rating > 0 && (
                <span className="rating-text">{rating} out of 5</span>
              )}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="post-submit-button"
            disabled={loading}
          >
            {loading ? "Posting..." : "Share Your Brew"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostForm;