import { useEffect, createContext, useContext, Children} from 'react';
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

const Header = ({ children, title, closeButton, ...other }) =>
{
    const { onClose } = useModal();

    return (
        <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {children}
            <button onClick={onClose}>X</button>
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

export default function Modal({ title, subtitle, isOpen, onClose, children })
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
        <ModalContext.Provider value={{ onClose }}>
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
