import Apple from "../assets/images/apple-music.svg";
import Spotify from "../assets/images/spotify.svg";
import Deezer from "../assets/images/deezer.svg";
import Vevo from "../assets/images/vevo.svg";
import Tiktok from "../assets/images/tiktok.svg";
import Tidal from "../assets/images/Tidal.png";
import HeroImage from "../assets/images/hero.png";

const HeroSection = () => {
    return (
      <section className="relative bg-black text-white min-h-screen flex items-center px-4 sm:px-8 md:px-16 lg:px-24 py-12">
        {/* Background image */}
        <img
          src={HeroImage}// Replace this with your actual image path
          alt="Hero"
          className="absolute inset-0 object-cover w-full h-full opacity-40 z-0"
        />
  
        {/* Content */}
        <div className="relative z-10 max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Text Section */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              The simplest way to sell your music globally.
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mb-8 max-w-lg mx-auto md:mx-0">
              Helping Independent Artist And Labels Reach Millions Of Listeners – Easier Than Ever Before
            </p>
  
            {/* Platform Icons */}
            <div>
              <p className="mb-3 font-semibold text-white text-sm sm:text-base">
                GET YOUR MUSIC ON
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <img src={Spotify} alt="Spotify" className="h-6 sm:h-7" />
                <img src={Deezer} alt="Deezer" className="h-6 sm:h-7" />
                <img src={Apple} alt="Apple Music" className="h-6 sm:h-7" />
                <img src={Tidal} alt="Tidal" className="h-6 sm:h-7" />
                <img src="/icons/youtube-music.png" alt="YouTube Music" className="h-6 sm:h-7" />
                <img src={Vevo} alt="Vevo" className="h-6 sm:h-7" />
                <img src={Tiktok} alt="TikTok" className="h-6 sm:h-7" />
              </div>
            </div>
          </div>
  
          {/* Optional right image space or graphic */}
          <div className="w-full md:w-1/2 hidden md:block">
            {/* You can add an image or animation here later if needed */}
          </div>
        </div>
      </section>
    );
  };
  
  export default HeroSection;
  