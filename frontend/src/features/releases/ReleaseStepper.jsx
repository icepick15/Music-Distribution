const ReleaseStepper = ({ step = 1 }) => {
    const steps = ["Info", "Genre & Artwork", "Lyrics & Audio", "Review", "Submit"];

  
    return (
      <div className="flex items-center justify-between gap-4 mb-10">
        {steps.map((label, index) => {
          const currentStep = index + 1;
          const isActive = currentStep === step;
          const isCompleted = currentStep < step;
  
          return (
            <div
              key={label}
              className={`flex-1 text-center py-2 px-4 rounded-full transition-all duration-300 
                ${isCompleted ? "bg-green-500 text-white" : 
                isActive ? "bg-blue-600 text-white font-semibold" : 
                "bg-gray-200 text-gray-600"}`}
            >
              {label}
            </div>
          );
        })}
      </div>
    );
  };
  
  export default ReleaseStepper;
  