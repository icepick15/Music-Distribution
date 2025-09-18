import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "Do I keep 100% of my rights?",
    answer:
      "Absolutely. You retain full ownership of your music and masters. We’re just your distribution partner.",
  },
  {
    question: "How fast does my music go live?",
    answer:
      "Typically within 48–72 hours across most major platforms like Spotify, Apple Music, and YouTube.",
  },
  {
    question: "Can I switch plans anytime?",
    answer:
      "Yes. You can upgrade or downgrade your subscription plan at any time from your dashboard.",
  },
  {
    question: "What platforms do you distribute to?",
    answer:
      "We distribute to 100+ platforms including Spotify, Apple Music, YouTube, Boomplay, Amazon, TikTok, Audiomack, and more.",
  },
  {
    question: "How do I get paid?",
    answer:
      "Royalties are calculated monthly and paid directly to your bank account or PayPal, depending on your payout setup.",
  },
];

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="py-16 bg-gray-100 px-4 md:px-10">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">Frequently Asked Questions</h2>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Everything you need to know before getting started.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left flex justify-between items-center px-6 py-4 focus:outline-none"
            >
              <span className="font-medium text-gray-800">{faq.question}</span>
              {activeIndex === index ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {activeIndex === index && (
              <div className="px-6 pb-4 text-sm text-gray-600">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
