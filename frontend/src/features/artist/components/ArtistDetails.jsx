import { MapPin, Building2, Phone, Globe } from "lucide-react";

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 text-sm text-gray-600">
    <Icon className="w-4 h-4 mt-1 text-gray-400" />
    <div>
      <p className="font-medium text-gray-800">{label}</p>
      <p>{value || "Not provided"}</p>
    </div>
  </div>
);

const ArtistDetails = ({ artist }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <DetailRow
        icon={MapPin}
        label="Location"
        value={artist.location}
      />
      <DetailRow
        icon={Building2}
        label="Label"
        value={artist.label}
      />
      <DetailRow
        icon={Phone}
        label="Phone"
        value={artist.phone}
      />
      <DetailRow
        icon={Globe}
        label="Website"
        value={artist.website}
      />
      {/* Add more rows if needed */}
    </div>
  );
};

export default ArtistDetails;
