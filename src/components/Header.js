import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./Header.css"; // We'll create this for the custom font

function Header({ setActiveTab }) {
  const [user] = useAuthState(auth);
  
  return (
    <header className="sticky top-0 z-10 header-beer shadow-md">
      <div className="container mx-auto px-4 header-container">
        {/* Centered logo text */}
        <div className="text-center">
          <h1 className="suds-logo">Suds 🍺</h1>
        </div>
        
        {/* User controls - only show account button when logged in */}
        {user && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
            <button 
              onClick={() => setActiveTab("account")}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 text-sm rounded-full transition"
            >
              My Account
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;