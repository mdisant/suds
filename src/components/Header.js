import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import beerLogo from "../assets/beer-logo.png"; // You'll need to add this asset

function Header() {
  const [user] = useAuthState(auth);
  
  return (
    <header className="sticky top-0 z-10 bg-amber-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* Replace with your actual logo */}
          <img src={beerLogo} alt="Suds Logo" className="h-10 w-10" />
          <h1 className="text-2xl font-bold">Suds 🍺</h1>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">Cheers, {user.email.split("@")[0]}!</span>
            <button 
              onClick={() => auth.signOut()}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full transition"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;