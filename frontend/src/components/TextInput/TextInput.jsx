import { useEffect } from 'react';
import styles from './TextInput.module.scss';
import clsx from 'clsx';

export default function TextInput({
    className,
    label,
    icon: Icon,
    iconPosition = 'left',
    value,
    defaultValue,
    placeholder,
    onChange,
    isValid,
    onValidChange,
    required = false,
    ...other
})
{
    const hasValue = value != null;
    const actualValid = !isValid ? true : isValid(value);
    // Display as default if no input yet, display validity when input given
    const displayValid = !hasValue || actualValid;

    // Handle validation of default value
    useEffect(() =>
    {
        if (defaultValue != null && isValid)
        {
            onChange?.(defaultValue);
            onValidChange?.(isValid(defaultValue));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() =>
    {
        if (hasValue && isValid)
        {
            onValidChange?.(actualValid);
        }
    }, [value, actualValid, hasValue, isValid, onValidChange]);

    return (
        <div className={clsx(styles.textInput, className)}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && (
                        <span className={styles.required} aria-label="required">
                            {' '}*
                        </span>
                    )}
                </label>
            )}
            <div
                className={clsx(
                    styles.inputWrapper,
                    label && styles.withLabel,
                    !displayValid && styles.invalid,
                    Icon && styles.withIcon,
                    Icon && iconPosition === 'right' && styles.iconRight,
                )}
            >
                {Icon && iconPosition === 'left' && <Icon className={styles.icon} />}
                <input
                    value={value ?? ''}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    onChange={(e) => onChange?.(e.target.value)}
                    aria-required={required}
                    aria-invalid={!displayValid}
                    {...other}
                />
                {Icon && iconPosition === 'right' && <Icon className={styles.icon} />}
            </div>
            {!displayValid && (
                <span className={styles.validationMessage} role="alert">
                    This field is required
                </span>
            )}
        </div>
    );
}
