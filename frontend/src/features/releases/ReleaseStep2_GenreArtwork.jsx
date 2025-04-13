import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const genres = [
  "Afrobeats",
  "Hip-Hop/Rap",
  "R&B/Soul",
  "Pop",
  "Dance",
  "Electronic",
  "Reggae",
  "Classical",
  "Rock",
  "Jazz",
];

const ReleaseStep2_Genre = ({ formData, setFormData, nextStep, prevStep }) => {
  const handleGenreChange = (value) => {
    setFormData({ ...formData, genre: value });
  };

  const handleNext = () => {
    if (!formData.genre) {
      alert("Please select a genre.");
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-6 max-w-xl w-full">
      <div>
        <Label htmlFor="genre">Select Genre</Label>
        <Select value={formData.genre} onValueChange={handleGenreChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a genre" />
          </SelectTrigger>
          <SelectContent>
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ReleaseStep2_Genre;
