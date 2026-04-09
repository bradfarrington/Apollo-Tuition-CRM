import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

/**
 * Generic hook for fetching data from a Supabase table.
 * Returns { data, loading, error, refetch }.
 *
 * Usage:
 *   const { data: students, loading } = useSupabaseQuery<Student>('students', {
 *     select: '*, parents(first_name, last_name)',
 *     order: { column: 'created_at', ascending: false },
 *     filters: [{ column: 'status', op: 'eq', value: 'active' }],
 *   });
 */

interface QueryOptions {
  select?: string;
  order?: { column: string; ascending?: boolean };
  filters?: Array<{ column: string; op: string; value: any }>;
  limit?: number;
  single?: boolean;
  eq?: Record<string, any>;
}

export function useSupabaseQuery<T = any>(
  table: string,
  options: QueryOptions = {},
  deps: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [singleData, setSingleData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(table).select(options.select || '*');

      // Apply eq filters
      if (options.eq) {
        for (const [col, val] of Object.entries(options.eq)) {
          query = query.eq(col, val);
        }
      }

      // Apply advanced filters
      if (options.filters) {
        for (const f of options.filters) {
          query = (query as any)[f.op](f.column, f.value);
        }
      }

      // Apply ordering
      if (options.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending ?? false,
        });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Single row mode
      if (options.single) {
        const { data: row, error: err } = await query.single();
        if (err) throw err;
        setSingleData(row as T);
      } else {
        const { data: rows, error: err } = await query;
        if (err) throw err;
        setData((rows || []) as T[]);
      }
    } catch (err: any) {
      console.error(`[useSupabaseQuery] Error fetching ${table}:`, err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [table, JSON.stringify(options), ...deps]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data: options.single ? (singleData ? [singleData] : []) : data,
    singleData,
    loading,
    error,
    refetch: fetch,
  };
}

/**
 * Generic mutation helpers for a Supabase table.
 *
 * Usage:
 *   const { insert, update, remove } = useSupabaseMutation<Student>('students');
 *   await insert({ first_name: 'John', last_name: 'Doe' });
 *   await update('id-123', { first_name: 'Jane' });
 *   await remove('id-123');
 */
export function useSupabaseMutation<T = any>(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insert = async (record: Partial<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from(table)
        .insert(record as any)
        .select()
        .single();
      if (err) throw err;
      return data as T;
    } catch (err: any) {
      console.error(`[useSupabaseMutation] Insert error on ${table}:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, updates: Partial<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from(table)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      return data as T;
    } catch (err: any) {
      console.error(`[useSupabaseMutation] Update error on ${table}:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.from(table).delete().eq('id', id);
      if (err) throw err;
      return true;
    } catch (err: any) {
      console.error(`[useSupabaseMutation] Delete error on ${table}:`, err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const upsert = async (record: Partial<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from(table)
        .upsert(record as any)
        .select()
        .single();
      if (err) throw err;
      return data as T;
    } catch (err: any) {
      console.error(`[useSupabaseMutation] Upsert error on ${table}:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { insert, update, remove, upsert, loading, error };
}
