import SearchIcon from '@/assets/icons/search.svg?react';
import styles from './SearchInput.module.scss';
import clsx from 'clsx';

export default function SearchInput({ placeholder = 'Search', className, onChange })
{
    return (
        <div className={clsx(className, styles.inputWrapper)}>
            <input 
                type='text'
                onChange={onChange}
                placeholder={placeholder}
            />
            <SearchIcon />
        </div>
    )
}