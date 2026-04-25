import React from 'react'
import ReactDom from 'react-dom'

// 1. Define the look of the popup
const MODAL_STYLES = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
<<<<<<< HEAD
  backgroundColor: '#49634f',
  padding: '70px',
=======
  backgroundColor: '#111113',
  color: '#f4f4f5',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: '16px',
  padding: '24px',
  width: 'min(720px, calc(100vw - 32px))',
  maxHeight: 'calc(100vh - 32px)',
  overflowY: 'auto',
>>>>>>> 671a90f (Changed credit card input, added validation and changed credit card input UI)
  zIndex: 1000,
}


const OVERLAY_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  zIndex: 1000
}

export default function Modal({ open, children, onClose }) {
  if (!open) return null


  return ReactDom.createPortal(
    <>
      <div style={OVERLAY_STYLES} onClick={onClose} />
      <div style={MODAL_STYLES}>
        <button 
           onClick={onClose} 
           style={{
            marginBottom: '14px',
            cursor: 'pointer',
            background: 'transparent',
            color: '#a1a1aa',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '10px',
            padding: '8px 12px',
           }}
        >
          Close
        </button>
        {children}
      </div>
    </>,
    document.getElementById('portal')
  )
}