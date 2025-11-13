export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6 text-black">Infrastructure Dashboard</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white shadow-sm rounded-lg">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Instance Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">State</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Owner</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                No data yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
