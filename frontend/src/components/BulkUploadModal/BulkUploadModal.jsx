/**
 * BulkUploadModal — a reusable modal for CSV bulk uploads.
 *
 * Props:
 *   isOpen        bool
 *   onClose       () => void
 *   onSuccess     (result) => void   called after successful upload
 *   title         string             modal title, e.g. "Bulk Create Drivers"
 *   description   string             helper text shown below title
 *   templateCols  string[]           column names for the downloadable template
 *   templateName  string             filename for template download
 *   mutation      UseMutationResult  TanStack mutation object ({ mutateAsync, isPending, isError, error })
 */
import { useState, useRef } from 'react';
import Modal from '@/components/Modal/Modal';
import Button from '@/components/Button/Button';
import AsyncButton from '@/components/AsyncButton/AsyncButton';
import { useToast } from '@/components/Toast/ToastContext';
import UploadIcon from '@/assets/icons/upload.svg?react';
import styles from './BulkUploadModal.module.scss';

export default function BulkUploadModal({
    isOpen,
    onClose,
    onSuccess,
    title,
    description,
    templateCols,
    templateName = 'template.txt',
    mutation,
})
{
    const { push } = useToast();
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null); // { succeeded, failed }

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
        setResult(null);
    }

    function downloadTemplate()
    {
        const csvContent = templateCols.join(',') + '\n';
        const blob = new Blob([csvContent], { type: 'text/csv' });
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
            const res = await mutation.mutateAsync({ file });
            setResult(res);
            push({
                type: 'success',
                message: `Upload complete: ${res.succeeded} succeeded, ${res.failed?.length ?? 0} failed.`,
            });
            onSuccess?.(res);
        }
        catch (err)
        {
            push({ type: 'error', message: err?.message ?? 'Upload failed.' });
        }
    }

    function handleClose()
    {
        setFile(null);
        setResult(null);
        fileInputRef.current && (fileInputRef.current.value = '');
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} closeButton>
            <Modal.Header title={title} />
            <Modal.Body>
                <p className={styles.description}>{description}</p>

                {/* Template download */}
                <div className={styles.templateRow}>
                    <span className={styles.templateLabel}>Need a template?</span>
                    <Button
                        text="Download Template"
                        color="secondary"
                        size="small"
                        onClick={downloadTemplate}
                    />
                </div>

                {/* File picker */}
                <div
                    className={styles.dropZone}
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
                            setResult(null);
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

                {/* Result summary */}
                {result && (
                    <div className={styles.resultBox}>
                        <p className={styles.resultSummary}>
                             <strong>{result.succeeded}</strong> rows succeeded
                            {result.failed?.length > 0 && (
                                <> ·  <strong>{result.failed.length}</strong> rows failed</>
                            )}
                        </p>
                        {result.failed?.length > 0 && (
                            <ul className={styles.failedList}>
                                {result.failed.map((f, i) => (
                                    <li key={i} className={styles.failedRow}>
                                        Row {f.row}: {f.reason}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button text="Cancel" color="outline" onClick={handleClose} />
                <AsyncButton
                    text={'Upload'}
                    color="primary"
                    disabled={!file || mutation.isPending}
                    action={handleUpload}
                />
            </Modal.Footer>
        </Modal>
    );
}