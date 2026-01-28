import { useState, useEffect, useCallback } from 'react';
import { gasApi } from '../services/gas';
import type { DeleteRule } from '../types';

export function useDeleteRules() {
  const [rules, setRules] = useState<DeleteRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gasApi.getDeleteRules();
      setRules(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch delete rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const saveRules = useCallback(async (newRules: DeleteRule[]) => {
    setLoading(true);
    setError(null);
    try {
      await gasApi.saveDeleteRules(newRules);
      setRules(newRules);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save delete rules');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeRule = useCallback(async (labelName: string, days: number) => {
    try {
      const result = await gasApi.executeDeleteRule(labelName, days);
      return result.deleted;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to execute delete rule');
      return -1;
    }
  }, []);

  return { rules, loading, error, refetch: fetchRules, saveRules, executeRule };
}
