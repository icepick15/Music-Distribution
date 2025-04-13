import { FaMusic } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ReleasesPage from '../features/components/ReleasesPage';

const DashboardMusic = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-gray-50 px-6 md:px-12 py-16">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          <span className="text-blue-700">My</span> Music
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          Distribute to iTunes, Spotify, Apple Music, Amazon, Google Play, Tidal, and 100+ DSPs worldwide.
        </p>
      </div>

      {/* Upload Card */}
      <div className="max-w-3xl mx-auto mb-20">
        <div className="bg-blue-700 text-white rounded-3xl shadow-2xl px-10 py-14 md:py-16 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-2xl"></div>
          <h2 className="text-2xl font-semibold mb-4">Standard Release</h2>
          <div className="text-6xl mb-6">
            <FaMusic />
          </div>
          <button
            onClick={() => navigate('/dashboard/music/release')}
            className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-full shadow-md hover:bg-blue-50 transition duration-300"
          >
            Upload
          </button>
        </div>
      </div>

      {/* My Releases Section */}
      <div className="max-w-6xl mx-auto w-full bg-white rounded-xl shadow-md px-4 py-10 sm:px-10">
        <ReleasesPage />
      </div>
    </section>
  );
};

export default DashboardMusic;
