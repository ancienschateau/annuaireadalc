import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters as FilterType } from '../types';

interface Props {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
}

export const SearchFilters: React.FC<Props> = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof FilterType, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      query: '',
      bac: '',
      pays: '',
      profession: '',
      etudes: '',
      lieu_naiss: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      {/* Main Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-adalc-input placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-adalc-orange focus:ring-1 focus:ring-adalc-orange sm:text-sm transition duration-150 ease-in-out"
          placeholder="Rechercher par nom, prénom..."
          value={filters.query}
          onChange={(e) => handleChange('query', e.target.value)}
        />
      </div>

      {/* Toggle Advanced Filters */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm font-medium text-slate-700 hover:text-adalc-orange transition-colors"
        >
          <Filter className="h-4 w-4 mr-2" />
          {isExpanded ? 'Masquer les filtres' : 'Filtres avancés'}
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-adalc-orange text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center text-sm text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer les filtres
          </button>
        )}
      </div>

      {/* Advanced Filters Grid */}
      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-fadeIn">
          {/* BAC Year */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Année du Baccalauréat (BAC)
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 text-base border-gray-200 bg-adalc-input focus:outline-none focus:ring-adalc-orange focus:border-adalc-orange sm:text-sm rounded-md placeholder-gray-400"
              placeholder="Ex: 1999"
              value={filters.bac}
              onChange={(e) => handleChange('bac', e.target.value)}
            />
          </div>

          {/* Pays */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Pays
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 text-base border-gray-200 bg-adalc-input focus:outline-none focus:ring-adalc-orange focus:border-adalc-orange sm:text-sm rounded-md placeholder-gray-400"
              placeholder="Ex: Italie"
              value={filters.pays}
              onChange={(e) => handleChange('pays', e.target.value)}
            />
          </div>

          {/* Lieu de naissance */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Lieu de naissance
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 text-base border-gray-200 bg-adalc-input focus:outline-none focus:ring-adalc-orange focus:border-adalc-orange sm:text-sm rounded-md placeholder-gray-400"
              placeholder="Ex: Paris"
              value={filters.lieu_naiss}
              onChange={(e) => handleChange('lieu_naiss', e.target.value)}
            />
          </div>

          {/* Profession */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Profession
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 text-base border-gray-200 bg-adalc-input focus:outline-none focus:ring-adalc-orange focus:border-adalc-orange sm:text-sm rounded-md placeholder-gray-400"
              placeholder="Ex: Consultant"
              value={filters.profession}
              onChange={(e) => handleChange('profession', e.target.value)}
            />
          </div>

           {/* Etudes */}
           <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Études
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 text-base border-gray-200 bg-adalc-input focus:outline-none focus:ring-adalc-orange focus:border-adalc-orange sm:text-sm rounded-md placeholder-gray-400"
              placeholder="Ex: Économie"
              value={filters.etudes}
              onChange={(e) => handleChange('etudes', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};