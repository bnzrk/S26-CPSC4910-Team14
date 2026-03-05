import { useEffect, createContext, useContext, Children } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.scss';
import clsx from 'clsx';

const ModalContext = createContext(null);

function useModal()
{
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("Modal.* components must be used inside <Modal />");
    return ctx;
}

const getChildrenFromDisplayName = (children, displayName) =>
{
    return Children.map(children, (child) =>
    {
        return child?.type?.displayName === displayName ? child : null;
    });
}

const Header = ({ children, title, className, ...other }) =>
{
    const { onClose, closeButton } = useModal();

    return (
        <div {...other} className={clsx(className, styles.header)}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {children}
            {closeButton &&
                <button className={styles.close} onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>}
        </div>
    );
}
Header.displayName = "Header";
Modal.Header = Header;

const Body = ({ children, className, ...other }) => (
    <div {...other} className={clsx(className, styles.body)}>
        {children}
    </div>
)
Body.displayName = "Body";
Modal.Body = Body;

const Footer = ({ children, className, ...other }) => (
    <div {...other} className={clsx(className, styles.footer)}>
        {children}
    </div>
)
Footer.displayName = "Footer";
Modal.Footer = Footer;

const Buttons = ({
    children,
    position,
    className,
    ...other }) =>
{
    var positionStyle;
    switch (position) {
        case 'right':
            positionStyle = styles.right;
            break;
        case 'left':
            positionStyle = styles.left;
            break;
        default:
            positionStyle = '';
            break;
    }

    return (
        <div {...other} className={clsx(className, styles.buttons, positionStyle)}>
            {children}
        </div>
    );
}
Buttons.displayName = "Buttons";
Modal.Buttons = Buttons;

export default function Modal({ isOpen, onClose, closeButton = true, children, className, ...other })
{
    // Scroll lock when open
    useEffect(() =>
    {
        if (!isOpen) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () =>
        {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    if (!isOpen)
        return null

    const root = document.getElementById("modal-root");
    if (!root)
        return null;

    return createPortal(
        <ModalContext.Provider value={{ onClose, closeButton }}>
            <div className={styles.overlay}>
                <div {...other} className={clsx(styles.modal, className)}>
                    {children}
                </div>
            </div>
        </ModalContext.Provider>
        ,
        root
    )
}
