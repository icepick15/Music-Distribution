const defaultArtist = {
    id: "artist_001",
    name: "Unknown Artist",
    bio: "This artist has not provided a bio yet.",
    avatarUrl: "/default-avatar.png", // Replace with your default image path
    bannerUrl: "/default-banner.jpg", // Optional: banner/header image
    location: "Undisclosed",
    genre: "Various",
    socials: {
      twitter: "",
      instagram: "",
      youtube: "",
      tiktok: "",
      website: "",
    },
    media: [
      {
        id: "media_1",
        title: "Sample Track",
        type: "audio",
        url: "https://example.com/sample-track.mp3",
      },
      {
        id: "media_2",
        title: "Music Video",
        type: "video",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
    ],
    stats: {
      followers: 0,
      monthlyListeners: 0,
      totalStreams: 0,
    },
  };
  
  export default defaultArtist;