import { Link } from "react-router-dom";

const RecentReleases = () => {
    return (
      <section id="recent-releases" className="w-full mt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">
            Recent Releases
          </h2>
          <Link to="/dashboard/music">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg shadow-md transition duration-200">
              Create New Release
            </button>
          </Link>
        </div>
  
        <div className="overflow-auto bg-white shadow-md rounded-xl border border-gray-200">
          <table className="min-w-[800px] w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                {["Status", "Release", "Artist", "Release Date", "UPC", "SmartLink"].map((header) => (
                  <th key={header} className="px-5 py-4 whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Placeholder content */}
              <tr className="hover:bg-gray-50 transition">
                <td colSpan="6" className="text-center py-8 text-gray-400 italic">
                  No releases yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    );
  };
  
  export default RecentReleases;
  