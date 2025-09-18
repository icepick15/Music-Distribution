import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaSpotify, FaSoundcloud } from "react-icons/fa";

const icons = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  twitter: FaTwitter,
  youtube: FaYoutube,
  spotify: FaSpotify,
  soundcloud: FaSoundcloud,
};

const SocialLinks = ({ links = {} }) => {
  return (
    <div className="flex gap-4 mt-2">
      {Object.entries(links).map(([key, url]) => {
        if (!url) return null;

        const Icon = icons[key];
        if (!Icon) return null;

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-black transition"
          >
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;
