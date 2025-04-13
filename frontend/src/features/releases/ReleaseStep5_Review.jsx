// ReleaseStep5_Review.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ReleaseStep5_Review = ({ formData, prevStep, handleSubmit }) => {
  return (
    <section className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Review Your Release</h2>

          <div>
            <p className="font-medium">Title:</p>
            <p>{formData.releaseTitle || "N/A"}</p>
          </div>

          <div>
            <p className="font-medium">Artist:</p>
            <p>{formData.artistName || "N/A"}</p>
          </div>

          <div>
            <p className="font-medium">Release Date:</p>
            <p>{formData.releaseDate || "N/A"}</p>
          </div>

          <div>
            <p className="font-medium">Genre:</p>
            <p>{formData.genre || "N/A"}</p>
          </div>

          <div>
            <p className="font-medium">Artwork:</p>
            {formData.artworkPreview ? (
              <img
                src={formData.artworkPreview}
                alt="Artwork Preview"
                className="w-32 h-32 rounded shadow-md mt-2"
              />
            ) : (
              <p className="text-sm italic">No artwork uploaded</p>
            )}
          </div>

          <div>
            <p className="font-medium">Audio File:</p>
            <p>{formData.audioFile?.name || "No file selected"}</p>
          </div>

          <div>
            <p className="font-medium">Download Link (Optional):</p>
            <p>{formData.downloadLink || "None provided"}</p>
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={handleSubmit}>
              Submit Release
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ReleaseStep5_Review;
