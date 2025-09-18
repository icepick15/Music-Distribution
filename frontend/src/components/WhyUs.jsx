// src/components/WhyUs.jsx
import React from "react";
import drummerImg from "../assets/images/drummergirl.png";
import guitaristImg from "../assets/images/guitaristman.png";

const Features = () => {
  return (
    <section className="py-16 px-4 md:px-10 bg-white text-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-12">
        {/* Feature 1 */}
        <div className="flex flex-col justify-center text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't stand alone in the rain
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            - We take care of hurdles in distribution.
          </p>
          <p className="text-base text-gray-700 leading-relaxed">
            We distribute your music to top digital music services like Spotify, Apple Music, Tidal, Amazon Music, and more. We also help you promote your music and get it heard by millions of new fans.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <img
            src={drummerImg}
            alt="Drummer"
            className="w-full max-w-[250px] md:max-w-sm"
          />
        </div>

        {/* Feature 2 */}
        <div className="flex items-center justify-center order-last md:order-none">
          <img
            src={guitaristImg}
            alt="Guitarist"
            className="w-full max-w-[250px] md:max-w-sm"
          />
        </div>
        <div className="flex flex-col justify-center text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Keep 100% of Your Rights
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            - Focus on what you do best. We’ll take care of the rest.
          </p>
          <p className="text-base text-gray-700 leading-relaxed">
            Be in control of your success. We provide you with the tools you need to succeed in the music industry. You can track your sales, streaming revenue, and more from your dashboard.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
