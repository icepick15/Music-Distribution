const MediaEmbed = ({ media = {} }) => {
    if (!media || Object.keys(media).length === 0) return null;
  
    const renderEmbed = (type, url) => {
      if (!url) return null;
  
      let src;
  
      switch (type) {
        case "youtubeEmbed": {
          const youtubeId = url.includes("embed")
            ? url.split("/embed/")[1]
            : url.split("v=")[1]?.split("&")[0];
          src = `https://www.youtube.com/embed/${youtubeId}`;
          break;
        }
  
        case "spotifyEmbed": {
          const match = url.match(/spotify\.com\/(track|album|playlist)\/([\w\d]+)/);
          if (!match) return null;
          const [_, spotifyType, spotifyId] = match;
          src = `https://open.spotify.com/embed/${spotifyType}/${spotifyId}?utm_source=generator`;
          break;
        }
  
        case "soundcloudEmbed": {
          src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
            url
          )}&color=%23ff5500`;
          break;
        }
  
        default:
          return null;
      }
  
      return (
        <div
          key={type}
          className="aspect-video w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-md mb-6"
        >
          <iframe
            src={src}
            title={`${type} preview`}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="w-full h-full"
          />
        </div>
      );
    };
  
    return (
      <div className="space-y-6">
        {renderEmbed("spotifyEmbed", media.spotifyEmbed)}
        {renderEmbed("youtubeEmbed", media.youtubeEmbed)}
        {renderEmbed("soundcloudEmbed", media.soundcloudEmbed)}
      </div>
    );
  };
  
  export default MediaEmbed;
  