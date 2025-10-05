import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Music, Calendar, Clock, TrendingUp, Share2, ExternalLink, Copy, Check } from 'lucide-react';
import { FaSpotify, FaApple, FaYoutube, FaAmazon } from 'react-icons/fa';

export default function PublicSongPage() {
  const { slug } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/songs/public/${slug}/`);
        setSong(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Song not found or not yet available');
        setLoading(false);
      }
    };

    fetchSong();
  }, [slug]);

  const getPlatformIcon = (platformName) => {
    const name = platformName.toLowerCase();
    if (name.includes('spotify')) return <FaSpotify className="w-6 h-6" />;
    if (name.includes('apple')) return <FaApple className="w-6 h-6" />;
    if (name.includes('youtube')) return <FaYoutube className="w-6 h-6" />;
    if (name.includes('amazon')) return <FaAmazon className="w-6 h-6" />;
    if (name.includes('deezer')) return <Music className="w-6 h-6" />;
    if (name.includes('tidal')) return <Music className="w-6 h-6" />;
    return <Music className="w-6 h-6" />;
  };

  const getPlatformColor = (platformName) => {
    const name = platformName.toLowerCase();
    if (name.includes('spotify')) return 'bg-green-500 hover:bg-green-600';
    if (name.includes('apple')) return 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600';
    if (name.includes('youtube')) return 'bg-red-600 hover:bg-red-700';
    if (name.includes('amazon')) return 'bg-blue-600 hover:bg-blue-700';
    if (name.includes('deezer')) return 'bg-purple-600 hover:bg-purple-700';
    if (name.includes('tidal')) return 'bg-black hover:bg-gray-900';
    return 'bg-gray-600 hover:bg-gray-700';
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(song.share_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = `🎵 Check out "${song.title}" by ${song.artist_name}!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(song.share_url)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(song.share_url)}`;
    window.open(url, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = `🎵 Check out "${song.title}" by ${song.artist_name}! ${song.share_url}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading song...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Music className="w-20 h-20 text-gray-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Song Not Found</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link 
            to="/" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navbar */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-white text-xl font-bold hover:text-purple-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-8">
            <img 
              src={song.cover_image || '/placeholder-album.jpg'} 
              alt={song.title}
              className="w-80 h-80 rounded-2xl shadow-2xl mx-auto object-cover ring-4 ring-white/20"
            />
            {song.is_explicit && (
              <span className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                EXPLICIT
              </span>
            )}
          </div>

          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {song.title}
          </h1>
          <p className="text-3xl text-gray-200 mb-2">
            by <span className="font-semibold">{song.artist_name}</span>
          </p>
          {song.featured_artists && (
            <p className="text-xl text-gray-300">
              feat. {song.featured_artists}
            </p>
          )}

          {/* Song Stats */}
          <div className="flex justify-center items-center gap-8 mt-8 flex-wrap">
            {song.genre && (
              <div className="flex items-center gap-2 text-gray-200">
                <Music className="w-5 h-5" />
                <span className="text-lg">{song.genre}</span>
              </div>
            )}
            {song.duration && (
              <div className="flex items-center gap-2 text-gray-200">
                <Clock className="w-5 h-5" />
                <span className="text-lg">{song.duration}</span>
              </div>
            )}
            {song.release_date && (
              <div className="flex items-center gap-2 text-gray-200">
                <Calendar className="w-5 h-5" />
                <span className="text-lg">{new Date(song.release_date).toLocaleDateString()}</span>
              </div>
            )}
            {song.total_streams > 0 && (
              <div className="flex items-center gap-2 text-gray-200">
                <TrendingUp className="w-5 h-5" />
                <span className="text-lg">{song.total_streams.toLocaleString()} streams</span>
              </div>
            )}
          </div>
        </div>

        {/* Platform Links */}
        {song.platform_links && song.platform_links.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
              <Music className="w-8 h-8" />
              Listen Now on Your Favorite Platform
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {song.platform_links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${getPlatformColor(link.platform)} text-white rounded-xl p-6 flex items-center justify-between transition-all transform hover:scale-105 shadow-lg`}
                >
                  <div className="flex items-center gap-4">
                    {getPlatformIcon(link.platform)}
                    <span className="text-lg font-semibold">{link.platform}</span>
                  </div>
                  <ExternalLink className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
            <Share2 className="w-7 h-7" />
            Share This Song
          </h3>
          
          {/* Copy Link */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={song.share_url}
                readOnly
                className="flex-1 bg-white/20 text-white border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={copyToClipboard}
                className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {copied ? (
                  <><Check className="w-5 h-5 inline mr-2" />Copied!</>
                ) : (
                  <><Copy className="w-5 h-5 inline mr-2" />Copy Link</>
                )}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={shareToTwitter}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-4 font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
              Share on Twitter
            </button>
            
            <button
              onClick={shareToFacebook}
              className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-6 py-4 font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Share on Facebook
            </button>
            
            <button
              onClick={shareToWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-4 font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Share on WhatsApp
            </button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-4">
            Want to distribute your music too?
          </h3>
          <p className="text-gray-100 mb-6">
            Join thousands of artists getting their music on Spotify, Apple Music, and more!
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            Start Distributing Now →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-300">
          <p>&copy; 2025 Music Distribution Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
