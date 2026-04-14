import { useEffect } from 'react';
import { BANKS } from '../data/banks';

export default function BankModal({ visible, selectedBank, onSelect, onClose }) {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className={`modal-overlay${visible ? ' visible' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-sheet">
        <div className="modal-header">
          <span className="modal-title">Select Bank</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="bank-list">
          {BANKS.map((bank, idx) => (
            <div key={bank.id}>
              <div
                className={`bank-row${selectedBank?.id === bank.id ? ' selected' : ''}`}
                onClick={() => onSelect(bank)}
              >
                <img className="bank-logo-list" src={bank.logo} alt={bank.name} />
                <span className="bank-row-text">{bank.name}</span>
                {selectedBank?.id === bank.id && (
                  <span className="bank-check">✓</span>
                )}
              </div>
              {idx < BANKS.length - 1 && <div className="bank-separator" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
