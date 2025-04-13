// src/features/releases/ReleaseSuccess.jsx
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ReleaseSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center space-y-6 max-w-md w-full">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">Release Submitted!</h2>
        <p className="text-gray-600">
          Your music release has been uploaded successfully and is now pending review.
        </p>

        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={() => navigate("/dashboard/music#recent-releases")}>
            View All Releases
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReleaseSuccess;
