import React from "react";

const artists = [
  {
    id: 1,
    name: "Zara Blaze",
    email: "zara@example.com",
    status: "Pending",
    documents: ["ID Proof", "Address Proof"],
  },
  {
    id: 2,
    name: "Leo Vibe",
    email: "leo@example.com",
    status: "Verified",
    documents: ["ID Proof"],
  },
];

export default function ArtistVerification() {
  const handleVerification = (id, action) => {
    console.log(`Artist ${id} was ${action}`);
    // Hook in your API or update logic here
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Artist Verification</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Documents</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {artists.map((artist) => (
            <tr key={artist.id}>
              <td className="px-4 py-2 border">{artist.name}</td>
              <td className="px-4 py-2 border">{artist.email}</td>
              <td className="px-4 py-2 border">
                {artist.documents.join(", ")}
              </td>
              <td className="px-4 py-2 border">{artist.status}</td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => handleVerification(artist.id, "approved")}
                  className="text-green-600 hover:underline mr-2"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleVerification(artist.id, "rejected")}
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
