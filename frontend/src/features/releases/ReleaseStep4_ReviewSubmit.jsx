import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadIcon } from "lucide-react";
import { useState } from "react";

const ReleaseStep4 = ({ formData, setFormData, nextStep, prevStep }) => {
  const [audioFile, setAudioFile] = useState(formData.audioFile || null);
  const [downloadLink, setDownloadLink] = useState(formData.downloadLink || "");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      alert("Please upload a valid audio file.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("Audio must be less than 20MB.");
      return;
    }

    setAudioFile(file);
    setFormData({ ...formData, audioFile: file });
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (!audioFile) {
      alert("Please upload your audio file before continuing.");
      return;
    }

    setFormData({ ...formData, downloadLink });
    nextStep();
  };

  return (
    <form onSubmit={handleNext}>
      <Card className="bg-white shadow-md p-6 rounded-xl space-y-6">
        <CardContent className="space-y-6">

          <div>
            <Label htmlFor="audio">Upload Audio File</Label>
            <Input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              required
              className="mt-2"
            />
            {audioFile && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {audioFile.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="link">
              Audio Download Link <span className="text-gray-400 text-sm">(Optional)</span>
            </Label>
            <Input
              id="link"
              type="url"
              placeholder="https://example.com/download.mp3"
              value={downloadLink}
              onChange={(e) => setDownloadLink(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Provide if the audio is hosted elsewhere.
            </p>
          </div>

          <Alert className="bg-blue-50 border-blue-200 text-blue-900">
            <UploadIcon className="h-4 w-4" />
            <AlertTitle>Upload Tips</AlertTitle>
            <AlertDescription>
              Make sure your audio file is in MP3 or WAV format. Avoid uploading demos or drafts.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between gap-4 pt-4">
            <Button variant="outline" type="button" onClick={prevStep}>
              Back
            </Button>
            <Button type="submit" className="w-full">
              Continue to Review
            </Button>
          </div>

        </CardContent>
      </Card>
    </form>
  );
};

export default ReleaseStep4;
