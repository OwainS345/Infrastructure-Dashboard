'use client'; 

import React, { useState, useEffect, useCallback } from 'react';

// --- Types (Matches mock data structure exactly: InstanceID, string for all values) ---
interface EC2Instance {
  Name: string;
  InstanceID: string; // Must match 'InstanceID' from json
  State: string; // e.g., "running", "stopped", "terminated"
  Type: string; // e.g., "t2.micro"
  AZ: string; // e.g., "us-east-1a"
  PrivateIP: string; // e.g., "10.0.1.15"
  Project: string;
  Tenant: string;
  Owner: string;
}

// --- Constants ---
const API_URL = `http://localhost:5000/api/metrics`;

// --- Utility Components ---

/** Maps EC2 State string to simple display text and color badge. */
const StateBadge: React.FC<{ state: string }> = ({ state }) => {
  // Normalize state for comparison
  const normalizedState = state.toLowerCase();
  // Capitalize the first letter for display
  const displayState = state.charAt(0).toUpperCase() + state.slice(1);

  // Added basic color logic for better visualization
  let colorClass = 'bg-gray-100 text-gray-800';
  if (normalizedState === 'running') {
    colorClass = 'bg-green-100 text-green-800';
  } else if (normalizedState === 'stopped') {
    colorClass = 'bg-yellow-100 text-yellow-800';
  } else if (normalizedState === 'terminated') {
    colorClass = 'bg-red-100 text-red-800';
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded ${colorClass}`}>
      {displayState}
    </span>
  );
};

// --- Main Component (Home Page) ---

export default function Home() {
  const [data, setData] = useState<EC2Instance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  /** Fetches data from the Flask API with robust error handling and backoff. */
  const fetchData = useCallback(async (retries = 3) => {
    setLoading(true);
    setError(null);
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Ensure the response is an array of objects
        const result: unknown = await response.json();

        if (!Array.isArray(result)) {
            throw new Error("API returned non-array data. Expected a list of EC2 instances.");
        }
        
        // TypeScript helps validate structure, we cast it here after checking it's an array.
        setData(result as EC2Instance[]);
        setLastFetched(new Date());
        setError(null);
        setLoading(false);
        return; // Success, exit function
      } catch (err) {
        console.error(`Attempt ${i + 1} failed:`, err);
        if (i === retries - 1) {
          // Final attempt failed
          setError(`Failed to connect to the backend API at ${API_URL}. Is the Flask server running?`);
          setLoading(false);
          return; 
        }
        // Exponential backoff delay
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto refresh every 30 seconds
    const intervalId = setInterval(() => fetchData(1), 30000); 
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchData]);

  // --- Rendering Functions ---

  const renderTableBody = () => {
    if (loading) {
      // Loading indicator with spinner
      return (
        <tr>
          <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Fetching data...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={9} className="px-6 py-4 text-center text-red-600 bg-red-50 border border-red-200">
            <p className="font-semibold">Connection Error</p>
            <p className="text-sm">{error}</p>
          </td>
        </tr>
      );
    }

    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
            No infrastructure data found. The API returned an empty list.
          </td>
        </tr>
      );
    }
    
    return data.map((instance) => (
      // Using InstanceID as the key
      <tr key={instance.InstanceID} className="bg-white border-b hover:bg-gray-50/50">
        
        {/* Name / Instance ID */}
        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
          <div className="flex flex-col space-y-0.5">
            <span className="font-semibold">{instance.Name}</span>
            <span className="text-xs text-gray-500 font-normal">{instance.InstanceID}</span>
          </div>
        </th>
        
        {/* State */}
        <td className="px-6 py-4">
          <StateBadge state={instance.State} />
        </td>

        {/* Type */}
        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
            {instance.Type}
        </td>

        {/* AZ */}
        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
            {instance.AZ}
        </td>

        {/* Private IP */}
        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
            {instance.PrivateIP}
        </td>
        
        {/* Project */}
        <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
            {instance.Project}
        </td>

        {/* Tenant */}
        <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
            {instance.Tenant}
        </td>
        
        {/* Owner */}
        <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
            {instance.Owner}
        </td>
      </tr>
    ));
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header and Controls */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-xl font-bold text-gray-900">
            Infrastructure Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Last Update: {lastFetched ? lastFetched.toLocaleTimeString() : 'N/A'}
            </span>
            
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Name / ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  State
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  AZ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Private IP
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Project
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Tenant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Owner
                </th>
                
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}