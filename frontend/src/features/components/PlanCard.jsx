import { Link } from "react-router-dom";

// src/features/dashboard/components/PlanCard.jsx
const PlanCard = () => {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 w-full max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">Your Plan</h2>
        <p className="text-gray-600 mb-5">
          You don’t have a subscription plan yet. Please subscribe to a plan.
        </p>
        <Link to="/dashboard/subscription">
          <button className="bg-blue-600 text-white py-2 px-5 rounded hover:bg-blue-700 transition">
            Get Started
          </button>
        </Link>
      </div>
    );
  };
  
  export default PlanCard;
  