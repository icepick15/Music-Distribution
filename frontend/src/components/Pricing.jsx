import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const plans = [
  {
    name: "Bronze",
    color: "white",
    yearly: 60000,
    monthly: 5000,
    descriptionYearly: "Basic Distribution to top digital music services",
    descriptionMonthly: "Essential tools for independent artists, billed monthly",
    featuresYearly: [
      "Unlimited releases to 100+ platforms for a year",
      "75% Revenue Pay-out",
      "Monthly Analytics",
      "Monthly Royalty Payments",
      "Fast, direct-to-bank royalty payouts",
      "Upload lyrics to music platforms",
      "Chat, Email and WhatsApp Support",
    ],
    featuresMonthly: [
      "Unlimited releases (1 month)",
      "75% Revenue Pay-out",
      "Basic Analytics",
      "Monthly Royalty Payments",
      "Chat and Email Support",
    ],
  },
  {
    name: "Gold",
    color: "black",
    yearly: 80000,
    monthly: 7000,
    descriptionYearly: "Best for growing artists looking to scale",
    descriptionMonthly: "Advanced distribution and higher royalty split",
    featuresYearly: [
      "Everything in Bronze Plan",
      "80% Revenue Pay-out",
      "Fast, direct-to-bank royalty payouts",
      "Chat, Email and WhatsApp Support",
      "Priority 24/7 support",
      "Auto-release to new platforms for free",
    ],
    featuresMonthly: [
      "Everything in Bronze Monthly",
      "80% Revenue Pay-out",
      "Priority Email Support",
      "Early access to new tools",
    ],
  },
  {
    name: "Platinum",
    color: "white",
    yearly: 100000,
    monthly: 8500,
    descriptionYearly: "Ultimate plan with all premium benefits",
    descriptionMonthly: "Elite features for labels and serious professionals",
    featuresYearly: [
      "Everything in Bronze Plan & Gold Plan",
      "85% Revenue Pay-out",
      "Upload lyrics to music platforms",
      "Priority 24/7 support",
      "Auto-release to new platforms for free",
    ],
    featuresMonthly: [
      "Everything in Gold Monthly",
      "85% Revenue Pay-out",
      "VIP Support Access",
      "AI-powered analytics",
    ],
  },
];

const PricingPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("yearly");

  const handleGetStarted = (planName) => {
    if (!user) {
      navigate("/sign-in");
    } else {
      navigate(`/payment?plan=${planName}&cycle=${billingCycle}`);
    }
  };

  return (
    <section className="py-16 px-4 md:px-10 bg-white text-black">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
        Choose Your Perfect Plan
      </h2>

      {/* Toggle */}
      <div className="flex justify-center mb-10">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`px-4 py-2 rounded-l border transition ${
            billingCycle === "monthly"
              ? "bg-black text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle("yearly")}
          className={`px-4 py-2 rounded-r border transition ${
            billingCycle === "yearly"
              ? "bg-black text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          Yearly
        </button>
      </div>

      {/* Plan Cards */}
      <div className="flex flex-wrap justify-center gap-6">
        {plans.map((plan, idx) => {
          const price = billingCycle === "yearly" ? plan.yearly : plan.monthly;
          const features =
            billingCycle === "yearly"
              ? plan.featuresYearly
              : plan.featuresMonthly;
          const description =
            billingCycle === "yearly"
              ? plan.descriptionYearly
              : plan.descriptionMonthly;

          return (
            <div
              key={idx}
              className={`border rounded-2xl shadow-lg p-6 w-full sm:w-[320px] flex flex-col justify-between ${
                plan.color === "black"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              <div>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-3xl font-bold my-3">
                  {price ? `₦${price.toLocaleString()}` : "Coming Soon"}
                  <span className="text-sm font-medium ml-1">
                    / {billingCycle}
                  </span>
                </p>
                <p className="text-sm mb-4">{description}</p>

                <h4 className="font-semibold mt-4 mb-2">Features</h4>
                <ul className="text-sm list-disc ml-4 space-y-1">
                  {features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleGetStarted(plan.name)}
                className={`mt-6 w-full py-2 px-4 rounded font-semibold transition ${
                  plan.color === "black"
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
                disabled={!price}
              >
                {price ? "Get Started" : "Coming Soon"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingPlans;
