import { useEffect, useState } from "react";
import defaultArtist from "../data/defaultArtist";

const LOCAL_STORAGE_KEY = "artistProfile";

const useArtistData = (user) => {
  const [artist, setArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setArtist(JSON.parse(stored));
    } else if (user) {
      const profile = {
        name: user.fullName || "Unknown Artist",
        email: user.primaryEmailAddress?.emailAddress || "",
        imageUrl: user.imageUrl,
        location: "Lagos, Nigeria",
        label: "Indie Vibes",
        phone: "+2348000000000",
        bio: "A vibrant creative with passion for Afro-fusion sounds.",
        socials: {
          spotify: "",
          appleMusic: "",
          youtube: "",
          audiomack: "",
          soundcloud: "",
        },
        media: {
          spotifyEmbed: "",
          youtubeEmbed: "",
        },
        ...defaultArtist,
      };
      setArtist(profile);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
    }
    setIsLoading(false);
  }, [user]);

  const saveArtist = (updated) => {
    setArtist(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  return { artist, isLoading, saveArtist };
};

export default useArtistData;
