import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const ArtistHeader = ({ artist }) => {
  return (
    <div className="flex items-center justify-between gap-6 flex-wrap">
      {/* Left: Profile Image + Name */}
      <div className="flex items-center gap-4">
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="w-20 h-20 rounded-full object-cover border shadow-sm"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{artist.name}</h1>
          <p className="text-sm text-gray-500">{artist.email}</p>
        </div>
      </div>

      {/* Right: Edit Button */}
      <div>
        <Button variant="outline" className="flex items-center gap-2">
          <Pencil className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
};

export default ArtistHeader;
