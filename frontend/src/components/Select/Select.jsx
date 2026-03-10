import { useState, createContext, useContext, useMemo, Children, isValidElement, useEffect, useRef } from 'react';
import Button from '../Button/Button';
import ChevronDownIcon from '@/assets/icons/chevron-down.svg?react';
import styles from './Select.module.scss';
import clsx from 'clsx';

const SelectContext = createContext(null);

function useSelect()
{
    const ctx = useContext(SelectContext);
    if (!ctx) throw new Error("Select.* components must be used inside <Select />");
    return ctx;
}

const Trigger = ({ children, className, icon, ...other }) =>
{
    const { selectedLabel, setOpen } = useSelect();

    return (
        <Button
            {...other}
            text={selectedLabel ?? ''}
            icon={icon}
            className={className}
            onClick={() => setOpen((prev) => !prev)}
        >
            {children}
            <ChevronDownIcon className={styles.chevron} />
        </Button>
    );
}
Trigger.displayName = "Trigger";
Select.Trigger = Trigger;

const Content = ({ children, className, ...other }) =>
{
    const { open } = useSelect();

    if (!open) return null;

    return (
        <div
            {...other}
            role="listbox"
            className={clsx(className, styles.content)}
        >
            {children}
        </div>
    );
}
Content.displayName = "Content";
Select.Content = Content;

function Option({ children, value, className, ...other })
{
    const { value: selectedValue, onChange, setOpen } = useSelect();

    const selected = selectedValue === value;

    return (
        <div
            {...other}
            role="option"
            aria-selected={selected}
            className={clsx(styles.option, className, selected && styles.selected)}
            onClick={() =>
            {
                onChange?.(value);
                setOpen(false);
            }}
        >
            {children}
        </div>
    );
}
Option.displayName = "Option";
Select.Option = Option;

export default function Select({ children, value, onChange, className, ...other })
{
    const [open, setOpen] = useState(false);

    const selectRef = useRef(null);
    // Close when clicking outside
    useEffect(() =>
    {
        function handlePointerDown(event)
        {
            if (!selectRef.current) return;
            if (!selectRef.current.contains(event.target))
                setOpen(false);
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);

        return () =>
        {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, []);

    const selectedLabel = useMemo(() =>
    {
        let label = null;

        Children.forEach(children, (child) =>
        {
            if (!isValidElement(child)) return;

            if (child.type === Content)
            {
                Children.forEach(child.props.children, (optionChild) =>
                {
                    if (!isValidElement(optionChild)) return;
                    if (optionChild.props.value === value)
                    {
                        label = optionChild.props.children;
                    }
                });
            }

            if (child.type === Option && child.props.value === value)
            {
                label = child.props.children;
            }
        });

        return label;
    }, [children, value]);

    // Close on navigate
    useEffect(() =>
    {
        setOpen(false);
    }, [location.pathname, location.search, location.hash]);

    const contextValue = useMemo(
        () => ({
            value,
            onChange,
            open,
            setOpen,
            selectedLabel
        }),
        [value, onChange, open, selectedLabel]
    );

    return (
        <SelectContext.Provider value={contextValue}>
            <div {...other} ref={selectRef} className={clsx(className, styles.select)}>
                {children}
            </div>
        </SelectContext.Provider>
    );
}