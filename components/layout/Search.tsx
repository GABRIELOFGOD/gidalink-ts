"use client";

import { UNIVERSITIES } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

const Search = () => {
  const [search, setSearch]         = useState('');
  const [university, setUniversity] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (university) params.set('nearbyUniversity', university);
    window.location.href = `/listings?${params.toString()}`;
  };
  
  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-xl">
        <select value={university} onChange={e => setUniversity(e.target.value)} className="flex-1 px-4 py-3 rounded-xl text-gray-800 text-sm font-medium bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">Choose your university</option>
          {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Area, street name..." className="w-full pl-9 pr-4 py-3 rounded-xl text-gray-800 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <button type="submit" className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl shadow transition-colors whitespace-nowrap">Search</button>
      </form>
    </div>
  )
}

export default Search;