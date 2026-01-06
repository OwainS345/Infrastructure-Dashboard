'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CPUChart, { CpuPoint } from "../components/CpuChart";

// --------------------
// Types
// --------------------
interface EC2Instance {
  Name: string;
  InstanceId: string;
  State: string;
  Type: string;
  AZ: string;
  PrivateIP: string;
  Project: string;
  Tenant: string;
  Owner: string;
  CPUHistory?: number[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Convert number[] → CpuPoint[]
function convertCpuHistory(history?: number[]): CpuPoint[] {
  if (!history) return [];

  return history.map((value, index) => ({
    date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    value,
  }));
}

// --------------------
// Soft Pastel Status Badge
// --------------------
const StateBadge: React.FC<{ state: string }> = ({ state }) => {
  const color = state.toLowerCase();

  const styles: Record<string, string> = {
    running: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    stopped: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    terminated: "bg-red-100 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`
        px-3 py-1 
        text-xs 
        rounded-full 
        font-medium 
        ${styles[color] || "bg-gray-100 text-gray-700 border border-gray-200"}
      `}
    >
      {state.charAt(0).toUpperCase() + state.slice(1)}
    </span>
  );
};

// --------------------
// Main Component
// --------------------
export default function Home() {
  const [data, setData] = useState<EC2Instance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const [selectedInstance, setSelectedInstance] = useState<EC2Instance | null>(null);

  // Fetch data from API
  const fetchData = useCallback(async (retries = 3) => {
    setLoading(true);
    setError(null);

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (!Array.isArray(result)) throw new Error("API returned non-array data.");

        setData(result as EC2Instance[]);
        setLastFetched(new Date());
        setLoading(false);
        return;
      } catch (err) {
        if (i === retries - 1) {
          setError(`Failed to connect to backend API at ${API_URL}.`);
          setLoading(false);
        }
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => fetchData(1), 30000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Sidebar ESC close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedInstance(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Table rows
  const renderTableBody = () => {
    if (loading)
      return (
        <tr>
          <td colSpan={9} className="px-6 py-5 text-center text-gray-500">Loading...</td>
        </tr>
      );

    if (error)
      return (
        <tr>
          <td colSpan={9} className="px-6 py-5 text-center text-red-600">{error}</td>
        </tr>
      );

    if (data.length === 0)
      return (
        <tr>
          <td colSpan={9} className="px-6 py-5 text-center text-gray-500">No data found.</td>
        </tr>
      );

    return data.map((instance) => (
      <tr
        key={instance.InstanceId}
        onClick={() => setSelectedInstance(instance)}
        className="cursor-pointer transition-all hover:bg-white/50 border-b border-gray-200/40"
      >
        <td className="px-6 py-5">
          <div className="flex flex-col">
            <span className="font-semibold text-[15px] text-gray-900">{instance.Name}</span>
            <span className="text-[11px] text-gray-400 mt-0.5">{instance.InstanceId}</span>
          </div>
        </td>

        <td className="px-6 py-5"><StateBadge state={instance.State} /></td>
        <td className="px-6 py-5 text-sm">{instance.Type}</td>
        <td className="px-6 py-5 text-sm">{instance.AZ}</td>
        <td className="px-6 py-5 text-sm">{instance.PrivateIP}</td>
        <td className="px-6 py-5 text-sm">{instance.Project}</td>
        <td className="px-6 py-5 text-sm">{instance.Tenant}</td>
        <td className="px-6 py-5 text-sm">{instance.Owner}</td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex font-sans">

      {/* SIDEBAR */}
      <aside className="w-56 bg-white/70 border-r border-white/40 backdrop-blur-xl shadow p-6 fixed top-0 left-0 h-full">
        <div className="text-lg font-bold text-gray-700 mb-8">Dashboards</div>

        <nav className="space-y-3">
          <button className="text-gray-700 font-medium hover:text-black transition">Instances</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-56">

        {/* TOP BAR */}
        <header className="w-full bg-white/70 backdrop-blur-xl border-b border-white/40 shadow px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-700">Infrastructure Dashboard</h1>
          <span className="text-gray-600 text-sm">Logged in as <strong>User</strong></span>
        </header>

        {/* PAGE CONTENT */}
        <main className="px-8 pt-10">

          {/* HEADER */}
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-700">Instances</h2>
            <span className="text-sm text-gray-500">
              Last Update: {lastFetched ? lastFetched.toLocaleTimeString() : "N/A"}
            </span>
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-2xl shadow border border-white/40 backdrop-blur-xl bg-white/60">
            <table className="min-w-full">
              <thead>
                <tr className="bg-white/30 backdrop-blur-xl">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name / ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">State</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">AZ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Private IP</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Owner</th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {renderTableBody()}
              </tbody>
            </table>
          </div>

        </main>
      </div>

{/* SLIDE-IN RIGHT PANEL */}
<div
  className={`
    fixed top-0 right-0 h-full w-140 bg-white shadow-xl border-l 
    transform transition-transform duration-300 z-50
    ${selectedInstance ? "translate-x-0" : "translate-x-full"}
  `}
>
  {selectedInstance && (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-black">{selectedInstance.Name}</h2>
        <button
          onClick={() => setSelectedInstance(null)}
          className="text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>
      </div>

      {/* METADATA */}
      <div className="text-sm space-y-1 text-black">
        <p><strong>Instance ID:</strong> {selectedInstance.InstanceId}</p>
        <p><strong>State:</strong> <StateBadge state={selectedInstance.State} /></p>
        <p><strong>Type:</strong> {selectedInstance.Type}</p>
        <p><strong>AZ:</strong> {selectedInstance.AZ}</p>
        <p><strong>Private IP:</strong> {selectedInstance.PrivateIP}</p>
        <p><strong>Project:</strong> {selectedInstance.Project}</p>
        <p><strong>Tenant:</strong> {selectedInstance.Tenant}</p>
        <p><strong>Owner:</strong> {selectedInstance.Owner}</p>
      </div>

      {/* SECURITY GROUPS CONTAINER */}
      <div className="border rounded-xl p-4 shadow-sm bg-gray-50">

        <h3 className="text-md font-semibold mb-3 text-black">Security Groups</h3>

        {/* TABLE HEADER */}
        <div className="grid grid-cols-3 text-xs font-semibold text-gray-600 pb-2 border-b border-gray-200">
          <span>Protocol</span>
          <span>Port</span>
          <span>Source</span>
        </div>

        {/* TABLE ROWS */}
        <div className="mt-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="grid grid-cols-3 gap-2 text-xs text-gray-500"
            >
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* CPU HISTORY CHART */}
      {selectedInstance.CPUHistory?.length ? (
        <div className="mt-2">
          <h3 className="text-md font-semibold mb-2 text-black">
            7-Day Avg CPU Usage
          </h3>

          <CPUChart data={convertCpuHistory(selectedInstance.CPUHistory)} />
        </div>
      ) : (
        <p className="text-black italic">No CPU history available.</p>
      )}

    </div>
  )}
</div>
</div>
  );
}
