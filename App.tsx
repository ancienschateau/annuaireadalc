import React, { useEffect, useState, useMemo } from 'react';
import { Alumni, SearchFilters as FilterType } from './types';
import { fetchAlumniData } from './services/dataService';
import { SearchFilters } from './components/SearchFilters';
import { ContactModal } from './components/ContactModal';
import { User, Briefcase, Loader2, Search, Flag } from 'lucide-react';

function App() {
  const [data, setData] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [modalMode, setModalMode] = useState<'contact' | 'report'>('contact');
  const [hasSearched, setHasSearched] = useState(false);
  
  const [filters, setFilters] = useState<FilterType>({
    query: '',
    bac: '',
    pays: '',
    profession: '',
    etudes: '',
    lieu_naiss: ''
  });

  // Fetch Data on Mount (Background)
  useEffect(() => {
    const init = async () => {
      const alumniData = await fetchAlumniData();
      setData(alumniData);
      setLoading(false);
    };
    init();
  }, []);

  // Filter Logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchQuery = !filters.query || 
        (item.nom + ' ' + item.prenom).toLowerCase().includes(filters.query.toLowerCase()) ||
        item.ville.toLowerCase().includes(filters.query.toLowerCase());
        
      // Helper for safe flexible matching (case insensitive, partial match)
      const matches = (itemValue: string, filterValue: string) => {
        if (!filterValue) return true;
        return (itemValue || '').toLowerCase().includes(filterValue.toLowerCase().trim());
      };

      const matchBac = matches(item.bac, filters.bac);
      const matchPays = matches(item.pays, filters.pays);
      const matchProfession = matches(item.profession, filters.profession);
      const matchEtudes = matches(item.etudes, filters.etudes);
      const matchLieuNaiss = matches(item.lieu_naiss, filters.lieu_naiss);

      return matchQuery && matchBac && matchPays && matchProfession && matchEtudes && matchLieuNaiss;
    });
  }, [data, filters]);

  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const openContactModal = (alumnus: Alumni) => {
    setSelectedAlumni(alumnus);
    setModalMode('contact');
  };

  const openReportModal = (alumnus: Alumni) => {
    setSelectedAlumni(alumnus);
    setModalMode('report');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-white">
      {/* Main Content */}
      <main className={`flex-grow flex flex-col transition-all duration-500 ${!hasSearched ? 'justify-center pb-32' : 'pt-10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          <div className="text-center mb-8">
            <h2 className={`font-bold text-slate-900 transition-all duration-500 ${!hasSearched ? 'text-4xl mb-6' : 'text-3xl mb-4'}`}>
              Retrouver un Ancien Élève
            </h2>
            {!hasSearched && (
              <p className="max-w-2xl mx-auto text-gray-600 mb-8 animate-fadeIn">
                Bienvenue sur l'annuaire de l'ADALC. Saisissez vos critères ci-dessous pour lancer une recherche.
              </p>
            )}
          </div>

          {/* Search Area */}
          <div onKeyDown={handleKeyDown} className="max-w-4xl mx-auto">
            <SearchFilters 
              filters={filters} 
              onFilterChange={setFilters} 
            />
            
            <div className="flex justify-center mt-6 mb-12">
              <button
                onClick={handleSearch}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-adalc-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-adalc-orange transition-all transform hover:scale-105"
              >
                <Search className="h-5 w-5 mr-2" />
                Rechercher
              </button>
            </div>
          </div>

          {/* Loading State - Only show if searched and still loading */}
          {hasSearched && loading && (
            <div className="flex justify-center items-center py-20 animate-fadeIn">
              <Loader2 className="h-10 w-10 text-adalc-orange animate-spin" />
              <span className="ml-3 text-lg text-gray-600">Recherche en cours...</span>
            </div>
          )}

          {/* Results Grid - Only show if searched and loaded */}
          {hasSearched && !loading && (
            <div className="animate-fadeIn">
              <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                 <div className="text-sm text-gray-500 font-medium">
                  {filteredData.length} résultats trouvés
                </div>
                <div className="text-xs text-gray-400 italic">
                  Les données sont protégées et l'accès est réservé.
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {filteredData.map((alumnus) => (
                  <div 
                    key={alumnus.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col group"
                  >
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <User className="h-6 w-6 text-slate-700" />
                        </div>
                        {alumnus.bac && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            BAC {alumnus.bac}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-1 pr-6">
                        {alumnus.prenom} {alumnus.nom ? `${alumnus.nom.charAt(0).toUpperCase()}.` : ''}
                      </h3>
                      
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex space-x-2">
                      <button
                        onClick={() => openContactModal(alumnus)}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-adalc-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-adalc-orange transition-colors"
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Contacter
                      </button>
                      <button
                        onClick={() => openReportModal(alumnus)}
                        className="inline-flex justify-center items-center px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                        title="Signaler une erreur"
                      >
                        <Flag className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredData.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <User className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun résultat</h3>
                  <p className="mt-1 text-sm text-gray-500">Essayez de modifier les filtres de recherche ou vérifiez l'orthographe.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {selectedAlumni && (
        <ContactModal 
          alumni={selectedAlumni} 
          mode={modalMode}
          onClose={() => setSelectedAlumni(null)} 
        />
      )}
    </div>
  );
}

export default App;