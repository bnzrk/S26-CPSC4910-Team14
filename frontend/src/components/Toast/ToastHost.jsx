import React from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/Toast/ToastContext";
import SuccessIcon from "@/assets/icons/circle-check.svg?react";
import ErrorIcon from "@/assets/icons/circle-x.svg?react";
import CloseIcon from "@/assets/icons/x.svg?react";
import InfoIcon from "@/assets/icons/info.svg?react";
import styles from "./Toast.module.scss";

function ToastItem({ toast, onDismiss }) {
  return (
    <div
      className={`${styles.toast} ${styles[`toast--${toast.type}`]}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.toast__content}>
        {toast.type == 'success' && <SuccessIcon />}
        {toast.type == 'error' && <ErrorIcon />}
        {toast.type == 'info' && <InfoIcon />}
        {toast.message ? (
          <div className={styles.toast__message}>{toast.message}</div>
        ) : null}
      </div>

      {toast.dismissible ? (
        <button
          className={styles.toast__close}
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss"
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}

export default function ToastHost() {
  const { toasts, dismiss } = useToast();

  return createPortal(
    <div className={styles.toastViewport} aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>,
    document.body
  );
}