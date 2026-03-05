import InfoIcon from '@/assets/icons/info.svg?react';
import AlertIcon from '@/assets/icons/circle-alert.svg?react';
import styles from './InlineInfo.module.scss';
import clsx from 'clsx';

export default function InlineInfo({ messages, type = 'info', showIcon = true, className, ...other })
{
    var multipleMessages = messages && messages.length > 1;
    var hasMessage = messages && messages.length > 0;

    return (
        <div {...other} className={clsx(className, styles.messages, styles[type])}>
            {showIcon && type == 'info' && <InfoIcon />}
            {showIcon && type == 'warning' && <AlertIcon />}
            {multipleMessages &&
                <ul>
                    {messages.map((message) => (
                        <li key={message} className={styles.message}>{message}</li>
                    ))}
                </ul>
            }
            {!multipleMessages &&
                <div className={styles.message}>
                    { hasMessage && messages[0]}
                </div>
            }
        </div>
    )
}