import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Artist Profile</h2>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Artist Name"
                required
              />
              <Input
                name="genre"
                value={form.genre}
                onChange={handleChange}
                placeholder="Genre"
              />
              <Input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Location"
              />
              <Input
                name="label"
                value={form.label}
                onChange={handleChange}
                placeholder="Label"
              />
              <Textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Short bio"
                rows={5}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Photo
                </label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                {form.imagePreview && (
                  <img
                    src={form.imagePreview}
                    alt="Preview"
                    className="mt-2 w-32 h-32 rounded-full object-cover border"
                  />
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Socials</h3>
              <Input
                name="spotify"
                value={form.socials.spotify}
                onChange={handleChange}
                placeholder="Spotify"
              />
              <Input
                name="facebook"
                value={form.socials.facebook}
                onChange={handleChange}
                placeholder="Facebook"
              />
              <Input
                name="appleMusic"
                value={form.socials.appleMusic}
                onChange={handleChange}
                placeholder="Apple Music"
              />
              <Input
                name="instagram"
                value={form.socials.instagram}
                onChange={handleChange}
                placeholder="Instagram"
                />
                <Input
                name="twitter"
                value={form.socials.twitter}
                onChange={handleChange}
                placeholder="Twitter"
                />
              <Input
                name="youtube"
                value={form.socials.youtube}
                onChange={handleChange}
                placeholder="YouTube"
              />
              <Input
                name="soundcloud"
                value={form.socials.soundcloud}
                onChange={handleChange}
                placeholder="SoundCloud"
              />

              <h3 className="text-sm font-semibold text-gray-700 pt-4">Media Embed</h3>
              <Input
                name="spotifyEmbed"
                value={form.media.spotifyEmbed}
                onChange={handleChange}
                placeholder="Spotify Embed URL"
              />
              <Input
                name="youtubeEmbed"
                value={form.media.youtubeEmbed}
                onChange={handleChange}
                placeholder="YouTube Embed URL"
              />
            </div>

            <div className="col-span-full flex justify-end gap-2 pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditArtistModal;
