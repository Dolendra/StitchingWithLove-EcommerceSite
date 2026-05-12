// src/components/DashboardSidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const DashboardSidebar = ({ isAdmin }) => {
  return (
    <div className="w-64 bg-purple-700 text-white min-h-screen p-5">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      <ul className="space-y-4">
        <li><Link to="/dashboard" className="hover:underline">My Orders</Link></li>
        <li><Link to="/dashboard/profile" className="hover:underline">Profile</Link></li>
        {isAdmin && (
          <>
            <li><Link to="/dashboard/manage-products" className="hover:underline">Manage Products</Link></li>
            <li><Link to="/dashboard/upload" className="hover:underline">Upload Portfolio</Link></li>
          </>
        )}
      </ul>
    </div>
  );
};

export default DashboardSidebar;
