
import { validDecimalString } from '@/helpers/formatting';
import TextInput from '@/components/TextInput/TextInput';
import UsdIcon from '@/assets/icons/dollar-sign.svg?react';

export default function UsdInput({ className, label, value, placeholder, onChange, onValidChange })
{
    return (
        <TextInput
            className={className}
            icon={UsdIcon}
            label={label}
            value={value}
            placeholder={placeholder}
            isValid={validDecimalString}
            onValidChange={onValidChange}
            onChange={onChange}
        />
    );
}