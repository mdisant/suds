import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      alert("Wrong email or password, bro!");
    }
  };

  return (
    <div style={{ background: "#333", color: "#FFF", padding: "20px", minHeight: "100vh" }}>
      <h1>Suds 🍺</h1>
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
        onClick={login}
        style={{ background: "#FFC107", padding: "10px", border: "none" }}
      >
        Log In
      </button>
    </div>
  );
}

export default Login;