import { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Auth.css"; // We'll create this shared CSS file

function Login({ setShowSignup, setActiveTab }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      setError("Username/Email and password are required");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      let email = identifier;
      
      // Check if the identifier is a username instead of an email
      if (!identifier.includes('@')) {
        try {
          // Look up the email by username
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("username", "==", identifier));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            setError("No user found with that username");
            setLoading(false);
            return;
          }
          
          // Get the email from the first matching user
          email = querySnapshot.docs[0].data().email;
        } catch (err) {
          console.error("Error looking up username:", err);
          setError("Error looking up username. Please try with your email instead.");
          setLoading(false);
          return;
        }
      }
      
      // Sign in with the email
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // Explicitly set active tab to feed after login
        if (setActiveTab) {
          setActiveTab("feed");
        }
      } catch (authErr) {
        console.error("Authentication error:", authErr);
        
        // Provide more specific error messages
        if (authErr.code === 'auth/invalid-credential' || 
            authErr.code === 'auth/invalid-email' || 
            authErr.code === 'auth/user-not-found') {
          setError("Invalid email or password. Please try again.");
        } else if (authErr.code === 'auth/wrong-password') {
          setError("Incorrect password. Please try again.");
        } else if (authErr.code === 'auth/too-many-requests') {
          setError("Too many failed login attempts. Please try again later.");
        } else {
          setError("Login failed: " + authErr.message);
        }
        
        setLoading(false);
      }
    } catch (err) {
      console.error("General login error:", err);
      setError("Login failed. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Welcome Back!</h2>
        <p>Sign in to continue your beer journey</p>
      </div>

      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={login} className="auth-form">
        <div className="form-group">
          <label htmlFor="identifier" className="required-field">Username or Email</label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="username or your@email.com"
            disabled={loading}
            required
          />
        </div>
        
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
        
        <button 
          type="submit" 
          className="auth-button primary"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      
      <div className="auth-footer">
        <p>Don't have an account?</p>
        <button 
          onClick={() => setShowSignup(true)}
          className="auth-button secondary"
          disabled={loading}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default Login;