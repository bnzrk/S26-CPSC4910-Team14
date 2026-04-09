import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import Loader from '../Loader/Loader';
import styles from '../AsyncButton/AsyncButton.module.scss';
import clsx from 'clsx';

export default function AsyncButton({ className, text = '', icon: Icon, color, disabled = false, action })
{
    const [flashError, setFlashError] = useState(false);

    const mutation = useMutation({
        mutationFn: action,
        onError: (err) =>
        {
            setFlashError(true);
        }
    });

    const isDisabled = disabled || mutation.isPending || flashError;

    useEffect(() =>
    {
        if (!flashError) return;

        const timer = setTimeout(() =>
        {
            setFlashError(false);
            mutation.reset();
        }, 1500);

        return () => clearTimeout(timer);
    }, [flashError, mutation]);

    var colorClass = "";
    switch (color)
    {
        case "primary":
            colorClass = styles.primary;
            break;
        case "warn":
            colorClass = styles.warn;
            break;
        default:
            colorClass = styles.secondary;
            break;
    }

    var iconOnly = !!Icon && (!text || text == '');
    const finalClasses = clsx(
        className,
        styles.buttonAsync,
        colorClass,
        flashError ? styles.failed : '',
        iconOnly && styles.iconOnly
    );

    const hideText = mutation.isPending || flashError;

    return <button
        type="button"
        className={finalClasses}
        disabled={isDisabled}
        onClick={() => mutation.mutate()}
    >
        {mutation.isPending && <Loader className={styles.loader} />}
        {Icon && <Icon className={clsx(styles.icon, hideText && styles.hidden)}/>}
        <span className={clsx(styles.buttonText, hideText && styles.hidden)}>{text}</span>
        {flashError && <svg className={clsx(styles.errorIcon, "lucide lucide-circle-alert-icon lucide-circle-alert")} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>}
    </button>
}