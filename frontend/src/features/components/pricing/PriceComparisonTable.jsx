import { useState } from "react";
import { Check, Minus } from "lucide-react";

const billingOptions = {
  song: "Pay per Song",
  yearly: "Yearly Subscription",
};

const plans = [
  {
    name: "Starter",
    description: "For beginners",
    prices: {
      song: 4000,
      yearly: 60000,
    },
  },
  {
    name: "Growth",
    description: "For growing artists",
    prices: {
      song: 5000,
      yearly: 70000,
    },
    mostPopular: true,
  },
  {
    name: "Pro",
    description: "For professionals",
    prices: {
      song: 8500,
      yearly: 85000,
    },
  },
];

const features = [
  {
    title: "Unlimited music distribution",
    values: [true, true, true],
  },
  {
    title: "Revenue payout percentage",
    values: ["75%", "80%", "85%"],
  },
  {
    title: "Direct-to-bank royalty payments",
    values: [true, true, true],
  },
  {
    title: "Release lyrics & metadata syncing",
    values: [false, true, true],
  },
  {
    title: "Advanced analytics dashboard",
    values: [false, true, true],
  },
  {
    title: "Smartlinks & artist pages",
    values: [true, true, true],
  },
  {
    title: "YouTube Content ID & Monetization",
    values: [false, false, true],
  },
  {
    title: "Auto-delivery to new DSPs",
    values: [false, true, true],
  },
  {
    title: "Dedicated label manager",
    values: [false, false, true],
  },
  {
    title: "24/7 support with priority channels",
    values: [false, true, true],
  },
];

export default function PlanComparisonTable() {
  const [billingType, setBillingType] = useState("yearly");

  const formatNaira = (amount) =>
    `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          Compare Our Plans
        </h2>

        {/* Billing Toggle */}
        <div className="flex justify-center space-x-2 mb-10">
          {Object.entries(billingOptions).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setBillingType(key)}
              className={`px-4 py-2 text-sm rounded-full font-medium transition ${
                billingType === key
                  ? "bg-black text-white"
                  : "bg-white border border-gray-300 text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Pricing Table */}
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-white sticky top-0 z-10 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-base">
                  Features
                </th>
                {plans.map((plan, i) => (
                  <th key={i} className="px-6 py-4 text-center align-top">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold">{plan.name}</span>

                      <span className="text-xs text-gray-500">
                        {plan.description}
                      </span>

                      {plan.mostPopular && (
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 rounded-full px-2 py-0.5 mt-1">
                          Most Popular
                        </span>
                      )}

                      <div className="mt-2 text-sm font-semibold text-black">
                        {formatNaira(plan.prices[billingType])}
                        <span className="text-xs text-gray-500 ml-1">
                          {billingType === "song" ? "/song" : "/year"}
                        </span>
                      </div>

                      <button className="mt-2 text-xs bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition">
                        Get Started
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {features.map((feature, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">{feature.title}</td>
                  {feature.values.map((val, i) => (
                    <td key={i} className="px-6 py-4 text-center">
                      {val === true ? (
                        <Check className="text-green-600 w-5 h-5 mx-auto" />
                      ) : val === false ? (
                        <Minus className="text-gray-400 w-5 h-5 mx-auto" />
                      ) : (
                        <span className="font-semibold">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
