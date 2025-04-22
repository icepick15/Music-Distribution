import { UserButton, useUser, useClerk, SignInButton, SignUpButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md">
      <div className="flex items-center gap-10">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-700 cursor-pointer" onClick={() => navigate("/")}>
          🎵eplug
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-6 text-sm font-medium">
          {user ? (
            <>
            
            <Link to="/dashboard/artist" >
              Artist
            </Link>
            <Link to="/dashboard/music" >
              Music
            </Link>
              <a href="#">Videos</a>
              <a href="#">Royalties</a>
              <a href="#">Analytics</a>
              <a href="#">Support</a>
            </>
          ) : (
            <>
              <a href="#">Music Distribution</a>
              <a href="#">Pricing</a>
              <a href="#">VEVO</a>
              <a href="#">Support</a>
              <a href="#">Promotion</a>
              <a href="#">Blog</a>
            </>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Upload with badge */}
            <div className="relative flex items-center text-sm font-semibold cursor-pointer">
              <span className="material-icons"><FaCartShopping/></span>
              <Link to="/dashboard/music/release" >
                Upload
              </Link>
            </div>

            {/* Clerk User Dropdown */}
            <UserButton afterSignOutUrl="/" />
          </>
        ) : (
          <>
          
            <Link to="/sign-in" className="border px-4 py-1 rounded">
              Login
            </Link>
          
          
            <Link to="/sign-up" className="bg-blue-600 text-white px-4 py-1 rounded">
              Sign Up
            </Link>
          
          </>
        )}
      </div>

      {/* Mobile Menu Icon */}
      <div className="md:hidden flex items-center">
        <button className="text-blue-700">
          <span className="material-icons">menu</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
