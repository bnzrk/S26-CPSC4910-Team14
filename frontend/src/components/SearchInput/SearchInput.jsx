import TextInput from '../TextInput/TextInput';
import SearchIcon from '@/assets/icons/search.svg?react';

export default function SearchInput({ label, placeholder = 'Search', className, value, onChange })
{
    return (
        <TextInput
            icon={SearchIcon}
            label={label}
            className={className}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    )
}
