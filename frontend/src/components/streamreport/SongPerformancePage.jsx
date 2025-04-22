import React from "react";

const songs = [
  {
    id: 1,
    title: "Blessings",
    platformData: {
      Spotify: 12450,
      AppleMusic: 9800,
      YouTube: 15600,
    },
    revenue: "₦45,200",
  },
  {
    id: 2,
    title: "Vibes Only",
    platformData: {
      Spotify: 8100,
      AppleMusic: 7200,
      YouTube: 13400,
    },
    revenue: "₦31,800",
  },
  {
    id: 3,
    title: "Take Over",
    platformData: {
      Spotify: 5000,
      AppleMusic: 6200,
      YouTube: 8800,
    },
    revenue: "₦22,100",
  },
];

export default function SongPerformancePage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Song Performance Overview
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead>
            <tr className="border-b text-xs uppercase text-gray-500">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Spotify Streams</th>
              <th className="px-4 py-3">Apple Music Streams</th>
              <th className="px-4 py-3">YouTube Streams</th>
              <th className="px-4 py-3">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr
                key={song.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {song.title}
                </td>
                <td className="px-4 py-3">{song.platformData.Spotify.toLocaleString()}</td>
                <td className="px-4 py-3">{song.platformData.AppleMusic.toLocaleString()}</td>
                <td className="px-4 py-3">{song.platformData.YouTube.toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold">{song.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
