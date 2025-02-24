import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Login from "./components/Login";
import Signup from "./components/Signup";
import PostForm from "./components/PostForm";

function App() {
  const [user, loading, error] = useAuthState(auth);
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {user ? (
        <div style={{ background: "#333", color: "#FFF", padding: "20px" }}>
          <h2>Logged in as {user.email}</h2>
          <button
            onClick={() => auth.signOut()}
            style={{ background: "#FFC107", padding: "10px", border: "none" }}
          >
            Log Out
          </button>
          <PostForm />
        </div>
      ) : (
        <div>
          {showSignup ? <Signup /> : <Login />}
          <button
            onClick={() => setShowSignup(!showSignup)}
            style={{ background: "#FFF", padding: "10px", border: "none", margin: "10px" }}
          >
            {showSignup ? "Back to Login" : "Sign Up Instead"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;