import { useState, useEffect } from 'react';
import { useSponsorOrg, useUpdateSponsorOrg } from '@/api/sponsorOrg';
import { useCreatePointRule, useDeletePointRule, usePointRules, useUpdatePointRule } from '@/api/pointRules';
import { useToast } from '@/components/Toast/ToastContext';
import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import Modal from '@/components/Modal/Modal';
import InlineInfo from '@/components/InlineInfo/InlineInfo';
import Button from '@/components/Button/Button';
import AsyncButton from '@/components/AsyncButton/AsyncButton';
import StarIcon from '@/assets/icons/star.svg?react';
import EditIcon from '@/assets/icons/pencil-line.svg?react';
import styles from './PointRulesPage.module.scss';

export default function PointRulesPage()
{
  const { push } = useToast();

  // Org queries
  const { data: org, isLoading: isOrgLoading, isError: isOrgError } = useSponsorOrg();
  const updateOrgMuation = useUpdateSponsorOrg();

  // Point rule queries
  const { data: rules, isLoading, isError } = usePointRules();
  const createMutation = useCreatePointRule();
  const deleteMutation = useDeletePointRule();
  const updateMutation = useUpdatePointRule();

  // Edit rule state
  const [reason, setReason] = useState('');
  const [balanceChange, setBalanceChange] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Edit point ratio state
  const [editingPointValue, setEditingPointValue] = useState(false);
  const [inputPointValue, setInputPointValue] = useState('0.00');
  const [finalPointValue, setFinalPointValue] = useState(0.00);

  // UI state
  const [showValueSaveModal, setShowValueSaveModal] = useState(false);
  const disableRuleButtons = deleteMutation.isPending || updateMutation.isPending || createMutation.isPending;

  // Set the inital point ratio edit value from the org
  useEffect(() =>
  {
    if (org)
    {
      setInputPointValue(`${org?.pointRatio}`);
    }
  }, [org]);

  // Handle creating a point rule
  async function handleCreate(e)
  {
    e.preventDefault();
    if (!reason || balanceChange === '') return;
    try
    {
      await createMutation.mutateAsync({ reason, balanceChange: parseInt(balanceChange) });
      setReason('');
      setBalanceChange('');
      setErrorMsg('');
    }
    catch (err)
    {
      setErrorMsg('Failed to create rule. Please try again.');
    }
  }

  // Handle deleting a point rule
  async function handleDelete(ruleId)
  {
    if (!ruleId) return;
    try
    {
      await deleteMutation.mutateAsync({ id: ruleId });
    }
    catch (err)
    {
      setErrorMsg('Failed to delete rule. Please try again.');
    }
  }

  // Handle updating a point rule
  async function handleUpdate(ruleId)
  {
    if (editValue === '') return;
    try
    {
      await updateMutation.mutateAsync({ id: ruleId, balanceChange: parseInt(editValue) });
      setEditingId(null);
      setEditValue('');
    }
    catch (err)
    {
      setErrorMsg('Failed to update rule. Please try again.');
    }
  }

  // Check if a point ratio value is valid
  function validPointValue(decimalString)
  {
    if (!decimalString)
      return false;

    const s = decimalString?.trim();

    const m = s.match(/^([+-])?(?:(\d+)(?:\.(\d*))?|\.(\d+))$/);
    if (!m) return false;

    const sign = m[1] === "-" ? "-" : "";
    if (sign)
      return false;

    let intPart = m[2] ?? "0";
    let fracPart = m[3] ?? m[4] ?? "";

    if (fracPart.length > 4) return false;

    const intNoLeading = intPart.replace(/^0+(?=\d)/, "");
    const totalDigits = (intNoLeading === "0" ? 1 : intNoLeading.length) + fracPart.length;
    if (totalDigits > 14) return false;

    let normalized = sign + intPart + (fracPart ? "." + fracPart : "");

    if (normalized === "-0") normalized = "0";

    if (normalized == '0' || normalized == '0.0') return false;

    return true
  }

  // Normalize a decimal string
  function normalizedDecimal(decimalString)
  {
    if (!decimalString)
      return '';

    const s = decimalString.trim();

    const m = s.match(/^([+-])?(?:(\d+)(?:\.(\d*))?|\.(\d+))$/);
    if (!m) return false;

    const sign = m[1] === "-" ? "-" : "";
    let intPart = m[2] ?? "0";
    let fracPart = m[3] ?? m[4] ?? "";

    intPart = intPart.replace(/^0+(?=\d)/, "");
    fracPart = fracPart.replace(/0+$/, "");

    let normalized = sign + intPart + (fracPart ? "." + fracPart : "");

    if (normalized === "-0") normalized = "0";

    return normalized;
  }

  // Check if decimal strings are equal
  function decimalsEqual(aString, bString)
  {
    const a = normalizedDecimal(aString);
    const b = normalizedDecimal(bString);
    return a === b;
  }

  // Handle attempted save point ratio value
  function handlePointValueSave()
  {
    var normalizedInput = normalizedDecimal(inputPointValue);
    var normalizedCurrent = normalizedDecimal(`${org?.pointRatio}`);
    if (decimalsEqual(normalizedCurrent, normalizedInput))
    {
      setEditingPointValue(false);
      setInputPointValue(`${org?.pointRatio}`);
      return;
    }

    setInputPointValue(normalizedInput);
    setFinalPointValue(Number(normalizedInput));

    setShowValueSaveModal(true);
  }

  // Handle cancel point ratio value editing
  function handlePointValueCancel()
  {
    setInputPointValue(`${org?.pointRatio}`);

    if (showValueSaveModal)
      setShowValueSaveModal(false);

    setEditingPointValue(false);
  }

  // Handle confirm save point ratio value
  async function confirmSavePointValue()
  {
    try
    {
      await updateOrgMuation.mutateAsync({ pointRatio: finalPointValue });
      push({ type: 'success', message: 'Point value updated.' });
      setEditingPointValue(false);
      setShowValueSaveModal(false);
    } catch (err)
    {
      push({ type: 'error', message: 'Update failed. Please try again.' });
      return Promise.reject();
    }
  }

  return (
    <>
      <Modal isOpen={showValueSaveModal} onClose={() => setShowValueSaveModal(false)}>
        <Modal.Header title='Confirm' />
        <Modal.Body>
          Saving will update the value of points for the whole organization. Are you sure?
        </Modal.Body>
        <Modal.Buttons position='right'>
          <Button className={styles.button} text='Cancel' onClick={handlePointValueCancel} />
          <AsyncButton className={styles.button} text='Save' color='primary' action={confirmSavePointValue} />
        </Modal.Buttons>
      </Modal>
      <CardHost title={'Point Rules'} subtitle={'Manage the rules that award or deduct points from drivers.'}>
        <Card title='Point Value'>
          <InlineInfo className={styles.info} type='info' messages={['Modifying the point value affects all users and drivers in this organization']} />
          <div className={styles.pointValueRow}>
            <div className={styles.pointValue}>
              <span className={styles.points}><span>1</span><StarIcon /></span>
              <span> = </span>
              {!editingPointValue && <span className={styles.currency}>${org && org.pointRatio} USD</span>}
              {editingPointValue &&
                <input
                  type="decimal"
                  className={styles.input}
                  placeholder="e.g. 0.01 or 1.50"
                  step=".01"
                  value={inputPointValue}
                  onChange={(e) => setInputPointValue(e.target.value)}
                  required
                />
              }
            </div>
          </div>
          {!editingPointValue &&
            <Button
              className={styles.button}
              text='Edit' color='primary'
              icon={EditIcon}
              onClick={() => setEditingPointValue(true)}
              disabled={editingId}
            />}
          {editingPointValue &&
            <div className={styles.buttonGroup}>
              <Button className={styles.button} text='Cancel' onClick={handlePointValueCancel} />
              <Button className={styles.button} text='Save' color='primary' onClick={handlePointValueSave} disabled={!validPointValue(inputPointValue)} />
            </div>
          }
        </Card>
        {/* Create Rule Form */}
        <Card title={'Add New Rule'}>
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
              <Button
                type='submit'
                className={styles.button}
                text={createMutation.isPending ? 'Adding...' : 'Add Rule'}
                color='primary'
                disabled={disableRuleButtons}
              />
            </div>
            {errorMsg && <p className={styles.error}>{errorMsg}</p>}
          </form>
        </Card>

        {/* Rules List */}
        <Card title={'Existing Rules'}>
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
                            onClick={() => handleUpdate(rule.id)}
                            disabled={disableRuleButtons}
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
                            onClick={() =>
                            {
                              setEditingId(rule.id);
                              setEditValue(rule.balanceChange);
                            }}
                          >
                            Edit Points
                          </button>
                          <button
                            className={styles.buttonDelete}
                            onClick={() => handleDelete(rule.id)}
                            disabled={disableRuleButtons}
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
        </Card>
      </CardHost>
    </>
  );
}