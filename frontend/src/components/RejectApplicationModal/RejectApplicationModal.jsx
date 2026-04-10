import { useEffect } from "react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import styles from "./RejectApplicationModal.module.scss";

export default function RejectApplicationModal({ isOpen, onClose, rejectReason, setRejectReason, onReject, isRejectDisabled = false })
{
    useEffect(() => {
        if (!isOpen)
            setRejectReason("");
        else
            return;
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Modal.Header title='Reject Application' />
            <Modal.Body>
                <div className={styles.body}>
                    <p>Please provide a reason for the rejection:</p>
                    <div className={styles.reason}>
                        <label>Reason:</label>
                        <textarea required placeholder='Reason for rejection...' value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
                        </textarea>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Buttons position='right'>
                <Button text='Cancel' color='secondary' onClick={onClose} />
                <Button text='Reject' color='warn' onClick={onReject} disabled={isRejectDisabled} />
            </Modal.Buttons>
        </Modal>
    );
}