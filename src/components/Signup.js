import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import "./Auth.css"; // Shared CSS file

function Signup({ setShowSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [favoriteBeer, setFavoriteBeer] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signup = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !firstName || !lastName || !username || !phoneNumber) {
      setError("Email, password, first name, last name, username, and phone number are required");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Check if username already exists
      const usernameQuery = query(
        collection(db, "users"), 
        where("username", "==", username)
      );
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        setError("Username already taken. Please choose another.");
        setLoading(false);
        return;
      }
      
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Add user to Firestore with additional fields
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        firstName,
        lastName,
        username,
        phoneNumber,
        favoriteBeer: favoriteBeer || "",
        city: city || "",
        createdAt: new Date().toISOString()
      });
      
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Email already in use. Try logging in!");
      } else {
        setError("Signup failed. Please try again!");
      }
      setLoading(false);
    }
  };

  return (
    <div className="auth-container signup-extended">
      <div className="auth-header">
        <h2>Join the Brew Crew</h2>
        <p>Create an account to share your favorite beers</p>
      </div>

      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={signup} className="auth-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName" className="required-field">First Name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName" className="required-field">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              disabled={loading}
              required
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
            placeholder="beerlover123"
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email" className="required-field">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phoneNumber" className="required-field">Phone Number</label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="(123) 456-7890"
            disabled={loading}
            required
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
              placeholder="IPA, Stout, etc."
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
              placeholder="NYC"
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password" className="required-field">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="required-field">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="auth-button primary"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
      
      <div className="auth-footer">
        <p>Already have an account?</p>
        <button 
          onClick={() => setShowSignup(false)}
          className="auth-button secondary"
          disabled={loading}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

export default Signup;