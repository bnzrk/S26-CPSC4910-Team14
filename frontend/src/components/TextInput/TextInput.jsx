import { useEffect } from 'react';
import styles from './TextInput.module.scss';

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
    required,
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
    }, []);

    // Handles validation if value is updated manually
    useEffect(() =>
    {
        onValidChange?.(actualValid);
    }, [actualValid, onValidChange]);

    // Check validity of input if isValid exists
    const handleChange = (e) =>
    {
        if (isValid)
        {
            if (onValidChange)
                onValidChange(isValid(e.target.value));
        }
        if (onChange)
            onChange(e);
    }

    // Construct css class string
    let classNames = `${styles.inputWrapper}`;
    if (className)
        classNames += ` ${className}`;
    if (label)
        classNames += ` ${styles.withLabel}`;
    if (!displayValid)
        classNames += ` ${styles.invalid}`;

    return (
        <div className={classNames}>
            {(Icon && iconPosition == 'left') &&
                <Icon className={styles.left} />
            }
            <input
                type='text'
                value={value !== undefined ? (value ?? '') : undefined}
                defaultValue={value === undefined ? defaultValue : undefined}
                onChange={handleChange}
                placeholder={placeholder}
                {...required}
                {...other}
            />
            {label && <label>{label} {!!required && <span className={styles.required}>*</span>}</label>}
            {(Icon && iconPosition == 'right') &&
                <Icon className={styles.right} />
            }
        </div>
    );
}