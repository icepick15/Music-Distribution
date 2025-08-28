import { 
  FileText, 
  Palette, 
  Music, 
  Eye, 
  Send,
  CheckCircle,
  Circle
} from "lucide-react";

const ReleaseStepper = ({ step = 1 }) => {
  const steps = [
    { label: "Basic Info", icon: FileText, description: "Release details" },
    { label: "Genre & Art", icon: Palette, description: "Style & visuals" },
    { label: "Audio & Lyrics", icon: Music, description: "Upload content" },
    { label: "Review", icon: Eye, description: "Check everything" },
    { label: "Submit", icon: Send, description: "Publish release" }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        {steps.map((stepData, index) => {
          const currentStep = index + 1;
          const isActive = currentStep === step;
          const isCompleted = false; // Only show completed when actually submitted
          const isPast = currentStep < step; // Steps that have been visited
          const Icon = stepData.icon;

          return (
            <div key={stepData.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center text-center">
                {/* Step Circle */}
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isCompleted 
                    ? "bg-green-500 text-white shadow-lg" 
                    : isActive 
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" 
                      : isPast
                        ? "bg-blue-100 text-blue-600 border-2 border-blue-300"
                        : "bg-gray-100 text-gray-400"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                  
                  {/* Active pulse effect */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 animate-ping opacity-20" />
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3">
                  <p className={`text-sm font-medium transition-colors ${
                    isActive ? "text-purple-600" : isPast ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                  }`}>
                    {stepData.label}
                  </p>
                  <p className={`text-xs mt-1 ${
                    isActive ? "text-purple-500" : isPast ? "text-blue-500" : isCompleted ? "text-green-500" : "text-gray-400"
                  }`}>
                    {stepData.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 mt-6">
                  <div className={`h-full transition-all duration-500 ${
                    isPast || isActive ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-200"
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step Counter */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-full">
          <Circle className="h-4 w-4 text-purple-500 mr-2" />
          <span className="text-sm text-gray-600">
            Step <span className="font-semibold text-purple-600">{step}</span> of <span className="font-semibold">{steps.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
  
  export default ReleaseStepper;
  