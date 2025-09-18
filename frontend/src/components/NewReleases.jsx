// src/components/NewReleases.jsx
import React from "react";

const mockReleases = [
  {
    title: "I Pray",
    artist: "Ova Skillz",
    cover: "/images/ipray.jpg",
  },
  {
    title: "Daddy",
    artist: "Ova Skillz",
    cover: "/images/daddy.jpg",
  },
  {
    title: "ALIVE",
    artist: "Ova Skillz",
    cover: "/images/alive.jpg",
  },
  {
    title: "One Thing",
    artist: "Chris Benja",
    cover: "/images/onething.jpg",
  },
  {
    title: "Hallelu",
    artist: "Sunnymackson",
    cover: "/images/hallelu.jpg",
  },
  {
    title: "Sounds From The South",
    artist: "King YB",
    cover: "/images/sounds.jpg",
  },
  {
    title: "Lost Boi",
    artist: "Kwabs Branely",
    cover: "/images/lostboi.jpg",
  },
  {
    title: "JESUS DEY WORRY ME",
    artist: "OVA SKILLZ",
    cover: "/images/jesusdey.jpg",
  },
  {
    title: "Wizkid StarBoy Mixtape",
    artist: "Dj Sjs",
    cover: "/images/starboy.jpg",
  },
  {
    title: "Igbo Amaka Highlife Mixtape",
    artist: "Dj Sjs",
    cover: "/images/igboamaka.jpg",
  },
];

const NewReleases = () => {
  return (
    <section className="py-16 px-4 md:px-10 bg-white text-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          New Releases
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {mockReleases.map((track, index) => (
            <div key={index} className="text-center">
              <img
                src={track.cover}
                alt={track.title}
                className="w-full h-auto rounded shadow-md"
              />
              <h3 className="mt-3 font-medium text-sm md:text-base">
                {track.title}
              </h3>
              <p className="text-xs text-gray-600">{track.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewReleases;
