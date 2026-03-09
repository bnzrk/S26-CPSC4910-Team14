import { useState, createContext, useContext, useMemo, Children, isValidElement } from 'react';
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
Option.displayName = "Content";
Select.Option = Option;

export default function Select({ children, value, onChange, className, ...other })
{
    const [open, setOpen] = useState(false);

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

    const contextValue = useMemo(
        () => ({
            value,
            onChange,
            open,
            setOpen,
            selectedLabel
        }),
        [children, value, onChange, open, selectedLabel]
    );

    return (
        <SelectContext.Provider value={contextValue}>
            <div {...other} className={clsx(className, styles.select)}>
                {children}
            </div>
        </SelectContext.Provider>
    );
}