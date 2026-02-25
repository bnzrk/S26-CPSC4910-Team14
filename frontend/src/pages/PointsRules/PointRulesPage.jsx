import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../config';
import styles from './PointRulesPage.module.scss';

async function fetchPointRules() {
  const response = await fetch(`${API_URL}/sponsor-orgs/point-rules`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch point rules');
  return response.json();
}

async function createPointRule(data) {
  const response = await fetch(`${API_URL}/sponsor-orgs/point-rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create point rule');
}

async function deletePointRule(id) {
  const response = await fetch(`${API_URL}/sponsor-orgs/point-rules/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete point rule');
}

async function updatePointRule(id, balanceChange) {
  const response = await fetch(`${API_URL}/sponsor-orgs/point-rules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ balanceChange }),
  });
  if (!response.ok) throw new Error('Failed to update point rule');
}

export default function PointRulesPage() {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [balanceChange, setBalanceChange] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const { data: rules, isLoading, isError } = useQuery({
    queryKey: ['pointRules'],
    queryFn: fetchPointRules,
  });

  const createMutation = useMutation({
    mutationFn: createPointRule,
    onSuccess: () => {
      queryClient.invalidateQueries(['pointRules']);
      setReason('');
      setBalanceChange('');
      setErrorMsg('');
    },
    onError: () => setErrorMsg('Failed to create rule. Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePointRule,
    onSuccess: () => queryClient.invalidateQueries(['pointRules']),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, balanceChange }) => updatePointRule(id, balanceChange),
    onSuccess: () => {
      queryClient.invalidateQueries(['pointRules']);
      setEditingId(null);
      setEditValue('');
    },
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!reason || balanceChange === '') return;
    createMutation.mutate({ reason, balanceChange: parseInt(balanceChange) });
  }

  function handleEditSave(id) {
    if (editValue === '') return;
    updateMutation.mutate({ id, balanceChange: parseInt(editValue) });
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Point Rules</h1>
        <p className={styles.subtitle}>
          Manage the rules that award or deduct points from drivers.
        </p>

        {/* Create Rule Form */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Add New Rule</h2>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>Reason</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Safe driving bonus"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Points</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="e.g. 100 or -50"
                  value={balanceChange}
                  onChange={(e) => setBalanceChange(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className={styles.button}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Adding...' : 'Add Rule'}
              </button>
            </div>
            {errorMsg && <p className={styles.error}>{errorMsg}</p>}
          </form>
        </div>

        {/* Rules List */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Existing Rules</h2>

          {isLoading && <p className={styles.muted}>Loading rules...</p>}
          {isError && <p className={styles.error}>Failed to load rules.</p>}

          {rules && rules.length === 0 && (
            <p className={styles.muted}>No rules yet. Add one above.</p>
          )}

          {rules && rules.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reason</th>
                  <th>Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.reason}</td>
                    <td>
                      {editingId === rule.id ? (
                        <input
                          type="number"
                          className={styles.inputSmall}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                      ) : (
                        <span className={rule.balanceChange >= 0 ? styles.positive : styles.negative}>
                          {rule.balanceChange >= 0 ? '+' : ''}{rule.balanceChange}
                        </span>
                      )}
                    </td>
                    <td className={styles.actions}>
                      {editingId === rule.id ? (
                        <>
                          <button
                            className={styles.buttonSave}
                            onClick={() => handleEditSave(rule.id)}
                            disabled={updateMutation.isPending}
                          >
                            Save
                          </button>
                          <button
                            className={styles.buttonCancel}
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className={styles.buttonEdit}
                            onClick={() => {
                              setEditingId(rule.id);
                              setEditValue(rule.balanceChange);
                            }}
                          >
                            Edit Points
                          </button>
                          <button
                            className={styles.buttonDelete}
                            onClick={() => deleteMutation.mutate(rule.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}