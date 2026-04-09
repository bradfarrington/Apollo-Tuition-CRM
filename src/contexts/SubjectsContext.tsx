import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface Subject {
  id: string;
  name: string;
  colour: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface SubjectsContextValue {
  subjects: Subject[];
  activeSubjects: Subject[];
  loading: boolean;
  addSubject: (data: Pick<Subject, 'name' | 'colour' | 'is_active'>) => Promise<void>;
  updateSubject: (id: string, data: Partial<Pick<Subject, 'name' | 'colour' | 'is_active'>>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const SubjectsContext = createContext<SubjectsContextValue | null>(null);

export function SubjectsProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch subjects:', error);
    } else {
      setSubjects(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const activeSubjects = subjects.filter(s => s.is_active);

  const addSubject = async (data: Pick<Subject, 'name' | 'colour' | 'is_active'>) => {
    const { data: newSubject, error } = await supabase
      .from('subjects')
      .insert({
        ...data,
        sort_order: subjects.length,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add subject:', error);
      return;
    }
    setSubjects(prev => [...prev, newSubject]);
  };

  const updateSubject = async (id: string, data: Partial<Pick<Subject, 'name' | 'colour' | 'is_active'>>) => {
    const { data: updated, error } = await supabase
      .from('subjects')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update subject:', error);
      return;
    }
    setSubjects(prev => prev.map(s => (s.id === id ? updated : s)));
  };

  const deleteSubject = async (id: string) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete subject:', error);
      return;
    }
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  return (
    <SubjectsContext.Provider value={{ subjects, activeSubjects, loading, addSubject, updateSubject, deleteSubject, refetch: fetchSubjects }}>
      {children}
    </SubjectsContext.Provider>
  );
}

export function useSubjects() {
  const ctx = useContext(SubjectsContext);
  if (!ctx) throw new Error('useSubjects must be used within a SubjectsProvider');
  return ctx;
}
