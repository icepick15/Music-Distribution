import { useState, useEffect } from "react";
import { X, Upload, User, MapPin, Music, Building2, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const EditArtistModal = ({ isOpen, onClose, artist = {}, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    bio: "",
    genre: "",
    location: "",
    label: "",
    socials: {
        facebook: "",
        instagram: "",
        twitter: "",
      spotify: "",
      appleMusic: "",
      youtube: "",
      soundcloud: "",
    },
    media: {
      spotifyEmbed: "",
      youtubeEmbed: "",
    },
    imageFile: null,
    imagePreview: "",
  });

  useEffect(() => {
    if (isOpen && artist) {
      setForm((prev) => ({
        ...prev,
        name: artist.name || "",
        bio: artist.bio || "",
        genre: artist.genre || "",
        location: artist.location || "",
        label: artist.label || "",
        socials: {
          facebook: artist.socials?.facebook || "",
          instagram: artist.socials?.instagram || "",
          twitter: artist.socials?.twitter || "",
          spotify: artist.socials?.spotify || "",
          appleMusic: artist.socials?.appleMusic || "",
          youtube: artist.socials?.youtube || "",
          soundcloud: artist.socials?.soundcloud || "",
        },
        media: {
          spotifyEmbed: artist.media?.spotifyEmbed || "",
          youtubeEmbed: artist.media?.youtubeEmbed || "",
        },
        imagePreview: artist.imageUrl || "",
        imageFile: null,
      }));
    }
  }, [isOpen, artist]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in form.socials) {
      setForm((prev) => ({
        ...prev,
        socials: {
          ...prev.socials,
          [name]: value,
        },
      }));
    } else if (name in form.media) {
      setForm((prev) => ({
        ...prev,
        media: {
          ...prev.media,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedArtist = {
      ...artist,
      name: form.name,
      bio: form.bio,
      genre: form.genre,
      location: form.location,
      label: form.label,
      imageUrl: form.imagePreview, // Later you’ll replace this with real upload result
      socials: form.socials,
      media: form.media,
    };

    onSave(updatedArtist);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl relative border border-white/20">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 p-6">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Artist Profile</h2>
                <p className="text-white/80 text-sm">Update your artist information and social media links</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Image Section */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-purple-600" />
                    Profile Photo
                  </h3>
                  
                  <div className="text-center">
                    <div className="relative inline-block">
                      {form.imagePreview ? (
                        <img
                          src={form.imagePreview}
                          alt="Preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                          <User className="w-12 h-12 text-white" />
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg">
                        <Camera className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Click the camera icon to upload a new photo
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-purple-600" />
                    Basic Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Music className="w-4 h-4 mr-1 text-purple-500" />
                        Artist Name
                      </label>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter artist name"
                        required
                        className="border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Music className="w-4 h-4 mr-1 text-purple-500" />
                        Genre
                      </label>
                      <Input
                        name="genre"
                        value={form.genre}
                        onChange={handleChange}
                        placeholder="e.g., Hip Hop, R&B, Pop"
                        className="border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-purple-500" />
                        Location
                      </label>
                      <Input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="City, Country"
                        className="border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Building2 className="w-4 h-4 mr-1 text-purple-500" />
                        Record Label
                      </label>
                      <Input
                        name="label"
                        value={form.label}
                        onChange={handleChange}
                        placeholder="Record label (if any)"
                        className="border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Biography</label>
                    <Textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself, your music style, and your journey..."
                      rows={4}
                      className="border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                    />
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Social Media & Streaming</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Streaming Platforms</h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Spotify</label>
                          <Input
                            name="spotify"
                            value={form.socials.spotify}
                            onChange={handleChange}
                            placeholder="https://open.spotify.com/artist/..."
                            className="border-gray-200 focus:border-green-400 focus:ring-green-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Apple Music</label>
                          <Input
                            name="appleMusic"
                            value={form.socials.appleMusic}
                            onChange={handleChange}
                            placeholder="https://music.apple.com/artist/..."
                            className="border-gray-200 focus:border-red-400 focus:ring-red-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">YouTube</label>
                          <Input
                            name="youtube"
                            value={form.socials.youtube}
                            onChange={handleChange}
                            placeholder="https://youtube.com/@username"
                            className="border-gray-200 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">SoundCloud</label>
                          <Input
                            name="soundcloud"
                            value={form.socials.soundcloud}
                            onChange={handleChange}
                            placeholder="https://soundcloud.com/username"
                            className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Social Networks</h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Instagram</label>
                          <Input
                            name="instagram"
                            value={form.socials.instagram}
                            onChange={handleChange}
                            placeholder="https://instagram.com/username"
                            className="border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Twitter/X</label>
                          <Input
                            name="twitter"
                            value={form.socials.twitter}
                            onChange={handleChange}
                            placeholder="https://twitter.com/username"
                            className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Facebook</label>
                          <Input
                            name="facebook"
                            value={form.socials.facebook}
                            onChange={handleChange}
                            placeholder="https://facebook.com/username"
                            className="border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media Embeds */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Media Embeds</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Spotify Embed URL</label>
                      <Input
                        name="spotifyEmbed"
                        value={form.media.spotifyEmbed}
                        onChange={handleChange}
                        placeholder="Spotify embed iframe src URL"
                        className="border-gray-200 focus:border-green-400 focus:ring-green-400"
                      />
                      <p className="text-xs text-gray-500">For featuring your latest track or album</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">YouTube Embed URL</label>
                      <Input
                        name="youtubeEmbed"
                        value={form.media.youtubeEmbed}
                        onChange={handleChange}
                        placeholder="YouTube embed iframe src URL"
                        className="border-gray-200 focus:border-red-500 focus:ring-red-500"
                      />
                      <p className="text-xs text-gray-500">For featuring your latest music video</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditArtistModal;
