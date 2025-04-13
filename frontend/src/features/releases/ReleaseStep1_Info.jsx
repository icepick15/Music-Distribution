import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ReleaseStep1_Info = ({ formData, setFormData, nextStep }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (!formData.releaseTitle || !formData.artistName || !formData.releaseDate) {
      alert("Please fill out all fields before proceeding.");
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-6 max-w-xl w-full">
      <div>
        <Label htmlFor="releaseTitle">Release Title</Label>
        <Input
          type="text"
          id="releaseTitle"
          name="releaseTitle"
          placeholder="Enter release title"
          value={formData.releaseTitle}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="artistName">Artist Name</Label>
        <Input
          type="text"
          id="artistName"
          name="artistName"
          placeholder="Enter artist name"
          value={formData.artistName}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="releaseDate">Release Date</Label>
        <Input
          type="date"
          id="releaseDate"
          name="releaseDate"
          value={formData.releaseDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="pt-4">
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

export default ReleaseStep1_Info;
