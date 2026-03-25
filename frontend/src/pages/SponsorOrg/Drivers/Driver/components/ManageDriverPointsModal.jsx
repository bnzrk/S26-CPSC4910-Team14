import { useState, useEffect, useMemo } from "react";
import { useCreatePointTransaction } from "@/api/points";
import { usePointRules } from "@/api/pointRules";
import { useToast } from "@/components/Toast/ToastContext";
import Modal from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import AsyncButton from "@/components/AsyncButton/AsyncButton";
import ListIcon from "@/assets/icons/list-checks.svg?react";
import StarIcon from "@/assets/icons/star.svg?react";
import styles from './ManageDriverPointsModal.module.scss';
import clsx from "clsx";

export default function ManageDriverPointsModal({ isOpen, onClose, onSuccess, driver, ...other })
{
    const { push } = useToast();

    const tabs = {
        ruleTab: 0,
        customTab: 1
    }
    const [tab, setTab] = useState(tabs.ruleTab);

    const { data: rules, rulesLoading, rulesError } = usePointRules();

    // Track selected rule
    const [selectedRuleId, setSelectedRuleId] = useState("");
    const selectedRule = useMemo(() =>
    {
        if (!rules || !selectedRuleId) return null;
        return rules.find(r => String(r.id) === String(selectedRuleId)) ?? null;
    }, [rules, selectedRuleId]);

    // Track custom transaction details
    const [customReason, setCustomReason] = useState('');
    const [customBalanceChange, setCustomBalanceChange] = useState('');

    // Reset selection on close
    useEffect(() =>
    {
        if (!isOpen)
        {
            setSelectedRuleId('');
        }
    }, [isOpen]);

    // Calculate final points after transaction
    function finalPoints()
    {
        if (!driver)
            return 0;

        if (selectedRule && tab == tabs.ruleTab)
            return driver?.points + selectedRule.balanceChange;
        else if (tab == tabs.customTab)
            return driver?.points + Number(customBalanceChange);
        else
            return driver?.points;
    }

    // API call
    const createPointTransaction = useCreatePointTransaction();
    async function submitTransaction()
    {
        try
        {
            var reason = '';
            var balanceChange = 0;

            if (tab == tabs.ruleTab)
            {
                if (!selectedRule || !selectedRule.reason || !selectedRule.balanceChange)
                    throw new Error("Invalid rule");
                reason = selectedRule?.reason;
                balanceChange = selectedRule?.balanceChange;
            }
            else if (tab == tabs.customTab)
            {
                var resolvedCustomBalance = customBalanceChange;
                if (!customReason || !customBalanceChange || resolvedCustomBalance == 0)
                    throw new Error("Invalid change");
                reason = customReason;
                balanceChange = resolvedCustomBalance;
            }
            await createPointTransaction.mutateAsync({ driverId: driver?.id, reason, balanceChange });
            push({ type: 'success', message: 'Points updated.' });
            onSuccess();
        } catch (err)
        {
            console.log(err);
            push({ type: 'error', message: 'Change failed. Please try again.' });
            return Promise.reject();
        }
    }

    // Whether we enable the update points button
    function updateEnabled()
    {
        switch (tab)
        {
            case tabs.ruleTab:
                return selectedRule;
            case tabs.customTab:
                return customReason && customBalanceChange && Number(customBalanceChange) != 0;
        }
    }

    // Regex for if the custom balance change is a number
    const numberish = /^-?\d*$/;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
            <Modal.Header title='Manage Points' />
            <Modal.Body className={styles.body}>
                <div className={styles.tabs}>
                    <Button
                        className={clsx(styles.tab, (tab == tabs.ruleTab) ? styles.selected : styles.unselected)}
                        text='Rule'
                        onClick={() => setTab(tabs.ruleTab)}
                    />
                    <Button
                        className={clsx(styles.tab, (tab == tabs.customTab) ? styles.selected : styles.unselected)}
                        text='Custom'
                        onClick={() => setTab(tabs.customTab)}
                    />
                </div>
                {isOpen && tab == tabs.ruleTab &&
                    <div className={styles.ruleBody}>
                        <select
                            className={styles.ruleDropdown}
                            value={selectedRuleId}
                            onChange={(e) => setSelectedRuleId(e.target.value)}
                            disabled={rulesLoading || !rules?.length}
                        >
                            <option key={-1} value={null}>None</option>
                            {rules &&
                                rules.map((rule) => <option key={rule.id} value={rule?.id}>{rule?.reason}</option>)
                            }
                        </select>
                        <div className={styles.selectedRule}>
                            {selectedRule &&
                                <div className={styles.rule}>
                                    <div className={styles.name}>
                                        <ListIcon />
                                        <span>{selectedRule.reason}</span>
                                    </div>
                                    <span className={clsx(selectedRule.balanceChange >= 0 ? styles.positive : styles.negative, styles.balanceChange)}>
                                        {selectedRule.balanceChange >= 0 ? '+' : ''}{selectedRule.balanceChange}
                                    </span>
                                </div>
                            }
                            {!selectedRule &&
                                <div className={styles.rule}>
                                    <div className={styles.name}>
                                        No rule selected
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                }
                {isOpen && tab == tabs.customTab &&
                    <div className={styles.customBody}>
                        <div className={styles.inputs}>
                            <div className={styles.field}>
                                <label className={styles.label}>Reason</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="e.g. Good driver bonus"
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Points</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    placeholder="e.g. 100 or -50"
                                    value={customBalanceChange}
                                    onChange={(e) =>
                                    {
                                        const v = e.target.value;
                                        if (numberish.test(v)) setCustomBalanceChange(v);
                                    }}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                }
                <div className={styles.finalResult}>
                    <b>Final Total:</b>
                    <span className={clsx(styles.pointTotal)}>
                        {finalPoints()}
                        <StarIcon />
                    </span>
                </div>
            </Modal.Body>
            <Modal.Buttons position='right'>
                <Button text='Cancel' onClick={onClose} />
                <AsyncButton text='Update Points' color='primary' action={submitTransaction} disabled={!updateEnabled()}></AsyncButton>
            </Modal.Buttons>
        </Modal>
    )
}