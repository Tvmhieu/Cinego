import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";

const AdminNavbar = () => {
  return (
    <div className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30">
      <Link to="/">
        <span className="text-3xl font-bold tracking-tight text-white italic"><span className="text-primary">Cine</span>Go</span>
      </Link>
    </div>
  );
};

export default AdminNavbar;
