import { useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import "./PostEditModal.css";

function PostEditModal({ post, onClose, onUpdate, onDelete }) {
  const [beerName, setBeerName] = useState(post.beerName || "");
  const [brewery, setBrewery] = useState(post.brewery || "");
  const [beerType, setBeerType] = useState(post.beerType || "");
  const [location, setLocation] = useState(post.location || "");
  const [description, setDescription] = useState(post.description || "");
  const [rating, setRating] = useState(post.rating || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
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
  
  const handleRatingChange = (newRating) => {
    setRating(newRating);
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
      
      const postRef = doc(db, "posts", post.id);
      
      const updatedData = {
        beerName: beerName.trim(),
        brewery: brewery.trim() || null,
        beerType: beerType || null,
        location: location.trim() || null,
        description: description.trim() || null,
        rating: rating || null
      };
      
      await updateDoc(postRef, updatedData);
      
      // Call the onUpdate callback with the updated post
      onUpdate({
        ...post,
        ...updatedData
      });
    } catch (err) {
      console.error("Error updating post:", err);
      setError("Failed to update post. Please try again.");
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Post</h2>
          <button className="close-modal-button" onClick={onClose}>
            &times;
          </button>
        </div>
        
        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="edit-post-form">
          <div className="modal-content">
            <div className="post-preview">
              {post.imageUrl ? (
                <img 
                  src={post.imageUrl} 
                  alt={post.beerName || "Beer post"} 
                  className="post-preview-image"
                />
              ) : (
                <div className="post-preview-placeholder">
                  <span className="beer-emoji">🍺</span>
                </div>
              )}
            </div>
            
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
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="delete-post-button"
              onClick={onDelete}
              disabled={loading}
            >
              Delete Post
            </button>
            
            <div className="save-cancel-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostEditModal; 