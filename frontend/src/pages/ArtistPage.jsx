import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useArtistData from "@/features/artist/hooks/useArtistData";
import EditArtistModal from "@/features/artist/components/EditArtistModal";
import MediaEmbed from "@/features/artist/components/MediaEmbed";
import SocialLinks from "@/features/artist/components/SocialLinks";
import Tabs from "@/features/artist/components/Tabs";

const ArtistPage = () => {
  const { user } = useUser(); // Clerk user
  const { artist: fetchedArtist, isLoading } = useArtistData(user);
  const [artist, setArtist] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load artist from localStorage if it exists
    const saved = localStorage.getItem("artistProfile");
    if (saved) {
      setArtist(JSON.parse(saved));
    } else if (fetchedArtist) {
      setArtist(fetchedArtist);
    }
  }, [fetchedArtist]);
  
  const handleSave = (updatedArtist) => {
    setArtist(updatedArtist);
    localStorage.setItem("artistProfile", JSON.stringify(updatedArtist)); // ✅ Persist
  };
  

  if (isLoading || !artist) {
    return <div className="text-center py-10 text-gray-500">Loading artist...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-start gap-6">
      <div className="flex items-center gap-4">
  {artist.imageUrl && (
    <img
      src={artist.imageUrl}
      alt={artist.name}
      className="w-20 h-20 rounded-full object-cover border"
    />
  )}

  <div>
    <h1 className="text-3xl font-bold text-gray-800">{artist.name}</h1>
    <p className="text-gray-500">{artist.genre}</p>
    <p className="text-gray-600">{artist.bio}</p>
    <SocialLinks links={artist.socials} />
  </div>
</div>

        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
      </div>

      <div className="mt-10">
        <MediaEmbed media={artist.media} />
      </div>

      <div className="mt-10">
      <Tabs
  tabs={[
    {
      key: "about",
      label: "About",
      content: (
        <div className="space-y-2 text-gray-600">
          <p>{artist.bio}</p>
          <p>
            <strong>Email:</strong> {artist.email}
          </p>
          <p>
            <strong>Location:</strong> {artist.location}
          </p>
          <p>
            <strong>Label:</strong> {artist.label}
          </p>
        </div>
      ),
    },
    {
      key: "media",
      label: "Media",
      content: <MediaEmbed media={artist.media} />,
    },
    {
      key: "socials",
      label: "Socials",
      content: <SocialLinks links={artist.socials} />,
    },
  ]}
/>

      </div>

      <EditArtistModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        artist={artist}
        onSave={handleSave}
      />
    </div>
  );
};

export default ArtistPage;
