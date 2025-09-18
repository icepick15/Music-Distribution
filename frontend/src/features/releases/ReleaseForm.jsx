import { useState } from "react";
import { Music, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import ReleaseStepper from "./ReleaseStepper";
import ReleaseStep1_Info from "./ReleaseStep1_Info";
import ReleaseStep2_GenreArtwork from "./ReleaseStep2_GenreArtwork";
import ReleaseStep3_LyricsAudio from "./ReleaseStep3_LyricsAudio";
import ReleaseStep4_ReviewSubmit from "./ReleaseStep4_ReviewSubmit";
import ReleaseStep5_Review from "./ReleaseStep5_Review";

const ReleaseForm = () => {
  const navigate = useNavigate();
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

    // Navigate back to music dashboard
    navigate("/dashboard/music");
  };

  const props = { formData, setFormData, nextStep, prevStep };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full translate-y-24 -translate-x-24" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate("/dashboard/music")}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Create New Release</h1>
                  <p className="text-xl text-white/80">Share your music with the world</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Music className="h-8 w-8" />
                </div>
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round((step / 5) * 100)}% Complete</span>
              </div>
              <div className="mt-2 bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Step Indicator */}
          <ReleaseStepper step={step} />

          {/* Step Forms */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-12">
              {step === 1 && <ReleaseStep1_Info {...props} />}
              {step === 2 && <ReleaseStep2_GenreArtwork {...props} />}
              {step === 3 && <ReleaseStep3_LyricsAudio {...props} />}
              {step === 4 && <ReleaseStep4_ReviewSubmit {...props} />}
              {step === 5 && <ReleaseStep5_Review {...props} handleSubmit={handleSubmit} />}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReleaseForm;
