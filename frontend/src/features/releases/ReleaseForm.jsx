import { useState } from "react";
import ReleaseStepper from "./ReleaseStepper";
import ReleaseStep1_Info from "./ReleaseStep1_Info";
import ReleaseStep2_GenreArtwork from "./ReleaseStep2_GenreArtwork";
import ReleaseStep3_LyricsAudio from "./ReleaseStep3_LyricsAudio";
import ReleaseStep4_ReviewSubmit from "./ReleaseStep4_ReviewSubmit"; // This is the new final review step
import ReleaseStep5_Review from "./ReleaseStep5_Review";
const ReleaseForm = () => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    releaseTitle: "",
    artistName: "",
    releaseDate: "",
    genre: "",
    artwork: null,
    artworkPreview: null,
    lyrics: "",
    audioFile: null,
    downloadLink: "",
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    console.log("✅ Final Submission:", formData);

    // TODO: Replace this with an API call or backend logic
    alert("Release submitted successfully!");

    // Optional: Reset form
    setStep(1);
    setFormData({
      releaseTitle: "",
      artistName: "",
      releaseDate: "",
      genre: "",
      artwork: null,
      artworkPreview: null,
      lyrics: "",
      audioFile: null,
      downloadLink: "",
    });
  };

  const props = { formData, setFormData, nextStep, prevStep };

  return (
    <section className="min-h-screen px-6 md:px-12 py-10 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        <ReleaseStepper step={step} />

        {/* Step Forms */}
        <div className="mt-10 bg-white p-6 md:p-10 rounded-2xl shadow-md">
        {step === 1 && <ReleaseStep1_Info {...props} />}
        {step === 2 && <ReleaseStep2_GenreArtwork {...props} />}
        {step === 3 && <ReleaseStep3_LyricsAudio {...props} />}
        {step === 4 && <ReleaseStep4_ReviewSubmit {...props} />}
        {step === 5 && <ReleaseStep5_Review {...props} />}
        </div>
      </div>
    </section>
  );
};

export default ReleaseForm;
