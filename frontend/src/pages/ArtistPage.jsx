import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "../components/DashboardLayout";
import useArtistData from "@/features/artist/hooks/useArtistData";
import EditArtistModal from "@/features/artist/components/EditArtistModal";
import MediaEmbed from "@/features/artist/components/MediaEmbed";
import SocialLinks from "@/features/artist/components/SocialLinks";
import Tabs from "@/features/artist/components/Tabs";
import { 
  PencilIcon, 
  ShareIcon,
  PlayIcon,
  PauseIcon,
  HeartIcon,
  EyeIcon,
  ChartBarIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon,
  LinkIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  GlobeAltIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  PlayIcon as PlaySolidIcon 
} from '@heroicons/react/24/solid';

const ArtistPage = () => {
  const { user } = useAuth(); // Custom auth user
  const { artist: fetchedArtist, isLoading } = useArtistData(user);
  const [artist, setArtist] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Mock data for enhanced features (replace with real data)
  const [artistStats] = useState({
    totalStreams: "2,847,392",
    monthlyListeners: "127,483",
    followers: "8,924",
    tracksReleased: 24,
    cities: 89,
    countries: 23
  });

  const [recentTracks] = useState([
    {
      id: 1,
      title: "Midnight Dreams",
      streams: "847K",
      duration: "3:42",
      released: "2024-08-15",
      cover: "/api/placeholder/60/60"
    },
    {
      id: 2,
      title: "City Lights",
      streams: "623K", 
      duration: "4:18",
      released: "2024-07-22",
      cover: "/api/placeholder/60/60"
    },
    {
      id: 3,
      title: "Electric Soul",
      streams: "1.2M",
      duration: "3:56", 
      released: "2024-06-10",
      cover: "/api/placeholder/60/60"
    }
  ]);

  const [achievements] = useState([
    { icon: TrophyIcon, title: "Top 100 Chart", description: "Reached #42 on indie charts" },
    { icon: FireIcon, title: "Viral Hit", description: "1M+ streams in first week" },
    { icon: GlobeAltIcon, title: "Global Reach", description: "Music in 23+ countries" }
  ]);

  useEffect(() => {
    // Load artist from localStorage if it exists
    const saved = localStorage.getItem("artistProfile");
    if (saved) {
      setArtist(JSON.parse(saved));
    } else if (fetchedArtist) {
      setArtist(fetchedArtist);
    } else {
      // Mock artist data for demo
      setArtist({
        name: "Alex Rivers",
        genre: "Electronic Pop",
        bio: "Passionate electronic pop artist blending synthesized sounds with heartfelt lyrics. Creating music that connects souls across digital landscapes.",
        imageUrl: "/api/placeholder/200/200",
        coverUrl: "/api/placeholder/1200/400",
        email: "alex@alexrivers.com",
        location: "Los Angeles, CA",
        label: "Independent",
        verified: true,
        socials: {
          spotify: "https://spotify.com/alexrivers",
          instagram: "https://instagram.com/alexrivers",
          twitter: "https://twitter.com/alexrivers",
          youtube: "https://youtube.com/alexrivers"
        },
        media: []
      });
    }
  }, [fetchedArtist]);
  
  const handleSave = (updatedArtist) => {
    setArtist(updatedArtist);
    localStorage.setItem("artistProfile", JSON.stringify(updatedArtist)); // ✅ Persist
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${artist.name} - Artist Profile`,
        text: `Check out ${artist.name}'s music profile`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (isLoading || !artist) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl mb-8"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-full w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Hero Section with Cover Image */}
            <div className="relative overflow-hidden rounded-3xl mb-8">
              {/* Cover Image */}
              <div 
                className="h-64 md:h-80 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500"
                style={{
                  backgroundImage: artist.coverUrl ? `url(${artist.coverUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-6 right-6 flex items-center space-x-3">
                  <button
                    onClick={handleShare}
                    className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all duration-300"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all duration-300"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Artist Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="flex items-end space-x-6">
                    {/* Profile Picture */}
                    <div className="relative group">
                      <img
                        src={artist.imageUrl || "/api/placeholder/150/150"}
                        alt={artist.name}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-white/20 backdrop-blur-sm shadow-2xl"
                      />
                      {artist.verified && (
                        <div className="absolute -top-2 -right-2 p-1 bg-blue-500 rounded-full">
                          <CheckBadgeIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Artist Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-white truncate">
                          {artist.name}
                        </h1>
                        {artist.verified && (
                          <CheckBadgeIcon className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      <p className="text-lg text-white/90 mb-2">{artist.genre}</p>
                      <div className="flex items-center space-x-4 text-sm text-white/75">
                        <span className="flex items-center space-x-1">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{artistStats.followers} followers</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{artistStats.monthlyListeners} monthly listeners</span>
                        </span>
                        {artist.location && (
                          <span className="flex items-center space-x-1">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{artist.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center space-x-3">
                      <button
                        onClick={togglePlay}
                        className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                      >
                        {isPlaying ? (
                          <PauseIcon className="w-5 h-5" />
                        ) : (
                          <PlayIcon className="w-5 h-5" />
                        )}
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </button>
                      <button
                        onClick={toggleLike}
                        className={`p-3 rounded-full border-2 border-white/30 backdrop-blur-md transition-all duration-300 ${
                          isLiked ? 'bg-red-500 text-white' : 'text-white hover:bg-white/20'
                        }`}
                      >
                        {isLiked ? (
                          <HeartSolidIcon className="w-5 h-5" />
                        ) : (
                          <HeartIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="md:hidden flex items-center justify-center space-x-3 mb-8">
              <button
                onClick={togglePlay}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={toggleLike}
                className={`p-3 rounded-full border-2 transition-all duration-300 ${
                  isLiked 
                    ? 'bg-red-500 border-red-500 text-white' 
                    : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                }`}
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                { label: "Total Streams", value: artistStats.totalStreams, icon: PlayIcon, color: "from-blue-500 to-cyan-500" },
                { label: "Monthly Listeners", value: artistStats.monthlyListeners, icon: EyeIcon, color: "from-purple-500 to-pink-500" },
                { label: "Followers", value: artistStats.followers, icon: UserGroupIcon, color: "from-green-500 to-emerald-500" },
                { label: "Tracks Released", value: artistStats.tracksReleased, icon: MusicalNoteIcon, color: "from-orange-500 to-red-500" },
                { label: "Cities", value: artistStats.cities, icon: MapPinIcon, color: "from-indigo-500 to-purple-500" },
                { label: "Countries", value: artistStats.countries, icon: GlobeAltIcon, color: "from-teal-500 to-cyan-500" }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl mb-4`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                    { id: 'tracks', label: 'Recent Tracks', icon: MusicalNoteIcon },
                    { id: 'achievements', label: 'Achievements', icon: TrophyIcon },
                    { id: 'about', label: 'About', icon: UserGroupIcon }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Bio Section */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Artist Bio</h3>
                      <p className="text-gray-700 leading-relaxed">{artist.bio}</p>
                    </div>

                    {/* Social Links */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Connect</h3>
                      <div className="flex flex-wrap gap-4">
                        {Object.entries(artist.socials || {}).map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                          >
                            <LinkIcon className="w-4 h-4" />
                            <span className="capitalize font-medium">{platform}</span>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Quick Info</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <MusicalNoteIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-600">Genre:</span>
                            <span className="font-medium">{artist.genre}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPinIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium">{artist.location}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CalendarIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-600">Label:</span>
                            <span className="font-medium">{artist.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tracks' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Recent Releases</h3>
                    <div className="space-y-4">
                      {recentTracks.map((track, index) => (
                        <div key={track.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                          <div className="text-sm text-gray-500 w-6">{index + 1}</div>
                          <img
                            src={track.cover}
                            alt={track.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{track.title}</h4>
                            <p className="text-sm text-gray-500">{track.streams} streams</p>
                          </div>
                          <div className="text-sm text-gray-500">{track.duration}</div>
                          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200">
                            <PlayIcon className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'achievements' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {achievements.map((achievement, index) => (
                        <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl mb-4">
                            <achievement.icon className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="font-bold text-gray-900 mb-2">{achievement.title}</h4>
                          <p className="text-gray-600 text-sm">{achievement.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">About {artist.name}</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-6">{artist.bio}</p>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4">Contact Information</h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium">{artist.email}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-600">Location:</span>
                              <span className="font-medium">{artist.location}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-600">Label:</span>
                              <span className="font-medium">{artist.label}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4">Media</h4>
                          <MediaEmbed media={artist.media} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Modal */}
            <EditArtistModal
              isOpen={isEditing}
              onClose={() => setIsEditing(false)}
              artist={artist}
              onSave={handleSave}
            />
          </div>
        </DashboardLayout>
  );
};

export default ArtistPage;
