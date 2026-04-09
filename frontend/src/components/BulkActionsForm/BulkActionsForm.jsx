import { useState, useRef } from 'react';
import { useToast } from '@/components/Toast/ToastContext';
import { useBulkActions } from '@/api/bulk';
import Card from '../Card/Card';
import Button from "../Button/Button";
import AsyncButton from "../AsyncButton/AsyncButton";
import UploadIcon from '@/assets/icons/upload.svg?react';
import styles from "./BulkActionsForm.module.scss";
import clsx from 'clsx';

export default function BulkActionsForm({
    templateRows,
    templateName = 'template.txt'
})
{
    const { push } = useToast();
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [results, setResults] = useState(null);
    const bulkActions = useBulkActions();

    const linesSkipped = results ? results.errors.length : 0;

    function handleFileChange(e)
    {
        const selected = e.target.files?.[0];
        if (!selected) return;
        if (!selected.name.endsWith('.txt'))
        {
            push({ type: 'error', message: 'Please upload a .txt file.' });
            return;
        }
        setFile(selected);
        setResults(null);
    }

    function downloadTemplate()
    {
        const content = templateRows.join('\n');
        const blob = new Blob([content], { type: 'text/txt' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = templateName;
        a.click();
        URL.revokeObjectURL(url);
    }

    async function handleUpload()
    {
        if (!file) return;
        try
        {
            const res = await bulkActions.mutateAsync({ file });
            setResults(res);
            push({
                type: 'success',
                message: 'Done.',
            });
            setFile(null);
        }
        catch (err)
        {
            push({ type: 'error', message: err?.message ?? 'Upload failed.' });
        }
    }

    return (
        <>
            <Card title='Bulk Actions'>
                <div className={styles.form}>
                    <p className={styles.description}>Upload a text file to perform actions in bulk.</p>

                    {/* Template download */}
                    <div className={styles.templateRow}>
                        <span className={styles.templateLabel}>Need a template?</span>
                        <Button
                            className={styles.templateButton}
                            text="Download Template"
                            color="secondary"
                            size="small"
                            onClick={downloadTemplate}
                        />
                    </div>

                    {/* File picker */}
                    <div
                        className={clsx(styles.dropZone, file && styles.withFile)}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) =>
                        {
                            e.preventDefault();
                            const dropped = e.dataTransfer.files?.[0];
                            if (dropped)
                            {
                                if (!dropped.name.endsWith('.txt'))
                                {
                                    push({ type: 'error', message: 'Please upload a .txt file.' });
                                    return;
                                }
                                setFile(dropped);
                                setResults(null);
                            }
                        }}
                    >
                        <UploadIcon className={styles.uploadIcon} />
                        {file
                            ? <span className={styles.fileName}>{file.name}</span>
                            : <span className={styles.dropText}>Click or drag & drop a .txt file here</span>
                        }
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt"
                            className={styles.hiddenInput}
                            onChange={handleFileChange}
                        />
                    </div>
                    <AsyncButton
                        text={'Upload'}
                        color="primary"
                        disabled={!file || bulkActions.isPending}
                        action={handleUpload}
                    />
                </div>
            </Card>
            <Card title='Results' className={styles.resultsCard}>
                {results &&
                    <div className={styles.summaryGrid}>
                        <div className={styles.metric}>
                            <p className={styles.metricLabel}>Completed</p>
                            <p className={clsx(styles.metricValue, styles.success)}>{results.completed}</p>
                        </div>
                        <div className={styles.metric}>
                            <p className={styles.metricLabel}>Skipped</p>
                            <p className={clsx(styles.metricValue, styles.danger)}>{results.errors.length}</p>
                        </div>
                    </div>
                }
                {!results && <p className={styles.placeholder}>No results.</p>}
                <div className={styles.errorListLabel}>
                    <span>Errors</span>
                    <span>{linesSkipped} lines skipped</span>
                </div>
                <div className={clsx(styles.results, styles.empty)}>
                    <div className={styles.errors}>
                        <table className={styles.list}>
                        {!!results && results.errors && results.errors.map((error) => (
                            <tr className={styles.error}>
                                {/* <span className={styles.line}>L{error.line}</span>
                                <span>{error.message}</span> */}
                                <td className={styles.line}>L{error.line}</td>
                                <td className={styles.message}>{error.message}</td>
                            </tr>
                        ))}
                        </table>
                    </div>
                </div>
            </Card>
        </>
    )
}