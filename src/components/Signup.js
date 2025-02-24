import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      alert("Signup failed, dude! Try again.");
    }
  };

  return (
    <div style={{ background: "#333", color: "#FFF", padding: "20px", minHeight: "100vh" }}>
      <h1>Join Suds 🍺</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{ display: "block", margin: "10px 0", padding: "5px" }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{ display: "block", margin: "10px 0", padding: "5px" }}
      />
      <button
        onClick={signup}
        style={{ background: "#FFC107", padding: "10px", border: "none" }}
      >
        Sign Up
      </button>
    </div>
  );
}

export default Signup;