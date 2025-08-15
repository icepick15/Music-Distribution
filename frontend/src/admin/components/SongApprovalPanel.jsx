import React from "react";

const songs = [
  { id: 1, title: "Lost in Sound", artist: "Nova", status: "Pending" },
  { id: 2, title: "Echoes", artist: "Rayne", status: "Approved" },
  { id: 3, title: "Midnight Chill", artist: "LUX", status: "Rejected" },
];

export default function SongApprovalPanel() {
  const handleAction = (id, action) => {
    console.log(`Song ID ${id} was ${action}`);
    // You can update state or make an API call here
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Song Approval</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Title</th>
            <th className="px-4 py-2 border">Artist</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => (
            <tr key={song.id}>
              <td className="px-4 py-2 border">{song.title}</td>
              <td className="px-4 py-2 border">{song.artist}</td>
              <td className="px-4 py-2 border">{song.status}</td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => handleAction(song.id, "approved")}
                  className="text-green-600 hover:underline mr-2"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(song.id, "rejected")}
                  className="text-red-600 hover:underline"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
