import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ReleaseStep3_Artwork = ({ formData, setFormData, nextStep, prevStep }) => {
  const [preview, setPreview] = useState(formData.artworkPreview || null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFormData({ ...formData, artwork: file, artworkPreview: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleNext = () => {
    if (!formData.artwork) {
      alert("Please upload artwork before proceeding.");
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-6 max-w-xl w-full">
      <Label>Upload Artwork</Label>

      <div
        className={cn(
          "border border-dashed border-gray-300 p-6 rounded-xl flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:border-blue-500 transition",
          preview && "p-3"
        )}
        onClick={triggerFileSelect}
      >
        {preview ? (
          <img
            src={preview}
            alt="Artwork Preview"
            className="w-48 h-48 object-cover rounded-lg shadow-md"
          />
        ) : (
          <>
            <p className="text-gray-600 mb-2">Drag & Drop or Click to Upload</p>
            <p className="text-xs text-gray-400">PNG, JPG, JPEG — Max size: 5MB</p>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png, image/jpeg"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="bg-gray-50 p-4 border text-sm text-gray-600 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-1">Artwork Guidelines</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Must be at least 3000 x 3000 pixels</li>
          <li>No logos, watermarks, or text overlays</li>
          <li>No blurry or pixelated images</li>
          <li>Only original and copyright-free artwork</li>
        </ul>
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

export default ReleaseStep3_Artwork;
