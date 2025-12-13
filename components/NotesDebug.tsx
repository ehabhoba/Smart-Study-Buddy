
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Database, Loader2, AlertCircle } from 'lucide-react';

const NotesDebug: React.FC = () => {
  const [notes, setNotes] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        // Querying the 'notes' table as requested
        const { data, error } = await supabase.from('notes').select('*');
        
        if (error) {
          throw error;
        }
        
        setNotes(data || []);
      } catch (err: any) {
        console.error('Supabase Error:', err);
        setError(err.message || 'Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center gap-2">
          <Database className="text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Supabase Notes Debugger</h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary-500 mb-2" size={32} />
              <p className="text-gray-500">Connecting to Supabase...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-700">Connection Error</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <p className="text-xs text-red-500 mt-2">Check if the 'notes' table exists and has RLS policies allowing 'select' for public/anon.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                  Rows found: {notes?.length || 0}
                </span>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                <pre className="text-green-400 font-mono text-sm leading-relaxed">
                  {JSON.stringify(notes, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesDebug;
