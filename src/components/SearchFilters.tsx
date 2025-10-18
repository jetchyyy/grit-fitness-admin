import { Search, Download } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onExport: () => void;
}

export function SearchFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onExport
}: SearchFiltersProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-red-600/30 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, email, or reference..."
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded border border-gray-700 focus:outline-none focus:border-red-600"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 focus:outline-none focus:border-red-600"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={onExport}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded hover:bg-red-700 transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}