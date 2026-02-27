import { useEffect, createContext, useContext, Children } from 'react';
import { createPortal } from 'react-dom';
import Card from '../Card/Card';
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

const Header = ({ children, title, ...other }) =>
{
    const { onClose, closeButton } = useModal();

    return (
        <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {children}
            {closeButton &&
                <button className={styles.close} onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>}
        </div>
    );
}
Header.displayName = "Header";
Modal.Header = Header;

const Body = ({ children, title, ...other }) => (
    <div className={styles.body}>
        {children}
    </div>
)
Body.displayName = "Body";
Modal.Body = Body;

const Footer = ({ children, title, ...other }) => (
    <div className={styles.footer}>
        {children}
    </div>
)
Footer.displayName = "Footer";
Modal.Footer = Footer;

export default function Modal({ isOpen, onClose, closeButton, children })
{
    if (!isOpen)
        return null

    // Scroll lock when open
    useEffect(() =>
    {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = prev);
    }, []);

    const root = document.getElementById("modal-root");
    if (!root)
        return null;

    const header = getChildrenFromDisplayName(children, "Header");

    return createPortal(
        <ModalContext.Provider value={{ onClose, closeButton }}>
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    {children}
                </div>
            </div>
        </ModalContext.Provider>
        ,
        root
    )
}
