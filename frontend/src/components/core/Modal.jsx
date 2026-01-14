import React, { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import "../../css/core/Modal.css";

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </Button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}