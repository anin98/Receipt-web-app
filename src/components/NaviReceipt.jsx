import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getBankById } from '../data/banks';

function formatNaviTimestamp(ts) {
  try {
    const d = new Date(ts.replace(' ', 'T'));
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}, ${hours}:${minutes} ${ampm}`;
  } catch {
    return ts;
  }
}

const TXN_SECONDS = (Math.floor(Math.random() * 49) + 1) / 10;

export default function NaviReceipt({ data, onNewTransaction }) {
  const {
    senderName, senderBank, senderDigits,
    recipientName,
    amount, txnId, timestamp, naviUpiId, naviTxnId,
  } = data;

  const senderBankInfo = getBankById(senderBank?.id);

  const [downloading, setDownloading] = useState(false);
  const wrapperRef = useRef(null);

  const upiId = naviUpiId;
  const upiTxnId = naviTxnId;

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.style.animation = 'none';
      wrapperRef.current.offsetHeight;
      wrapperRef.current.style.animation = '';
    }
  }, []);

  const handleDownloadPDF = async () => {
    if (!wrapperRef.current || downloading) return;
    setDownloading(true);
    try {
      const offscreen = document.createElement('div');
      Object.assign(offscreen.style, {
        position: 'fixed',
        left: '-9999px',
        top: '0',
        width: '390px',
        background: '#33043F',
        padding: '0',
        boxSizing: 'border-box',
      });

      const clone = wrapperRef.current.cloneNode(true);
      clone.style.animation = 'none';
      clone.style.paddingBottom = '40px';

      offscreen.appendChild(clone);
      document.body.appendChild(offscreen);

      const canvas = await html2canvas(offscreen, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#33043F',
        logging: false,
      });

      document.body.removeChild(offscreen);

      const pdfW = 595.28;
      const pdfH = (canvas.height / canvas.width) * pdfW;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [pdfW, pdfH],
      });

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`navi-receipt-${txnId}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div id="navi-screen">
      <div className="navi-fullscreen-layout">

        <div className="navi-content-area">
          <div className="navi-wrapper" ref={wrapperRef}>

            {/* Purple top section */}
            <div className="navi-top">
              <p className="navi-paid-securely">Paid securely on</p>
              <img src="/assets/navi logo.png" className="navi-brand-logo" alt="Navi UPI" />
              <div className="navi-win-row">
                <span style={{ fontSize: 16 }}>⚡</span>
                <span className="navi-win-text">Transaction speed</span>
                <span className="navi-win-amt">{TXN_SECONDS}s</span>
              </div>
            </div>

            {/* Receipt card */}
            <div className="navi-card">
              <div className="navi-card-top">
                <p className="navi-success-label">Payment successful</p>
                <p className="navi-recipient">to {recipientName?.toUpperCase()}</p>
                <p className="navi-upi-id">{upiId}</p>

                <div className="navi-amount-row">
                  <span className="navi-amount">₹{Number(amount).toLocaleString('en-IN')}</span>
                  <span className="navi-check">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <circle cx="14" cy="14" r="14" fill="#1FAD5B" />
                      <path d="M8 14.5l4 4 8-9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>

                <div className="navi-upi-badge">Navi UPI</div>
              </div>

              {/* Ticket tear */}
              <div className="navi-tear">
                <span className="navi-tear-circle navi-tear-left" />
                <span className="navi-tear-dash" />
                <span className="navi-tear-circle navi-tear-right" />
              </div>

              <div className="navi-card-bottom">
                <p className="navi-timestamp">{formatNaviTimestamp(timestamp)}</p>
                <p className="navi-from">from {senderName?.toUpperCase()}</p>

                <div className="navi-bank-row">
                  {senderBankInfo ? (
                    <img src={senderBankInfo.logo} className="navi-bank-icon" alt="" />
                  ) : (
                    <span className="navi-bank-icon-fallback">🏦</span>
                  )}
                  <span className="navi-bank-text">
                    {senderBankInfo?.name ?? senderBank?.name} - {senderDigits}
                  </span>
                </div>

                <p className="navi-txn-id">UPI transaction ID: {upiTxnId}</p>
              </div>
            </div>

          </div>
        </div>

        <div className="navi-actions">
          <button
            className="navi-action-btn navi-download-btn"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? (
              <span className="navi-action-text">Generating PDF…</span>
            ) : (
              <>
                <span className="action-btn-icon-inline">⬇</span>
                <span className="navi-action-text">Download as PDF</span>
              </>
            )}
          </button>

          <button className="navi-action-btn" onClick={onNewTransaction}>
            <span className="navi-action-text">New Transaction</span>
          </button>
        </div>

      </div>
    </div>
  );
}
