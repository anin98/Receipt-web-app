import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getBankById } from '../data/banks';

function formatTimestamp(ts) {
  try {
    const d = new Date(ts.replace(' ', 'T'));
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm} on ${day} ${month} ${year}`;
  } catch {
    return ts;
  }
}

function generateUTR(txnId) {
  const seed = parseInt(txnId.replace(/\D/g, '').slice(-9), 10) || 123456789;
  return String(500000000000 + (seed % 499999999999)).padStart(12, '0');
}

export default function PhonePeReceipt({ data, onNewTransaction, preview }) {
  const {
    senderBank, senderDigits,
    recipientName, recipientBank, recipientDigits,
    amount, txnId, timestamp, ppTxnId, ppUtr,
  } = data;

  const recipientBankInfo = getBankById(recipientBank?.id);
  const senderBankInfo = getBankById(senderBank?.id);

  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const wrapperRef = useRef(null);
  const cardRef = useRef(null);

  const utr = ppUtr || generateUTR(txnId);
  const maskedRecipient = `XXXXXXXXXX${recipientDigits}`;
  const maskedSender = `XXXXX${senderDigits}`;

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.style.animation = 'none';
      wrapperRef.current.offsetHeight;
      wrapperRef.current.style.animation = '';
    }
  }, []);

  const renderCanvas = async () => {
    const offscreen = document.createElement('div');
    Object.assign(offscreen.style, {
      position: 'fixed',
      left: '-9999px',
      top: '0',
      width: '390px',
      background: '#0D0D0D',
      padding: '20px',
      boxSizing: 'border-box',
    });

    const clone = wrapperRef.current.cloneNode(true);
    clone.style.animation = 'none';
    clone.style.background = '#0D0D0D';

    clone.querySelectorAll('*').forEach(el => {
      const computed = window.getComputedStyle(el).backgroundColor;
      if (computed === 'rgba(0, 0, 0, 0)' || computed === 'transparent') {
        el.style.backgroundColor = '#0D0D0D';
      }
    });

    const card = clone.querySelector('.pp-card');
    if (card) card.style.backgroundColor = '#1C1C1E';
    const bankCircles = clone.querySelectorAll('.pp-bank-logo-circle, .pp-debit-icon-box');
    bankCircles.forEach(el => { el.style.backgroundColor = '#ffffff'; });

    const logoCircle = clone.querySelector('.pp-logo-circle');
    if (logoCircle) {
      logoCircle.style.backgroundColor = '#fff';
      logoCircle.style.boxShadow = 'none';
    }

    offscreen.appendChild(clone);
    document.body.appendChild(offscreen);

    try {
      return await html2canvas(offscreen, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#0D0D0D',
        logging: false,
      });
    } finally {
      document.body.removeChild(offscreen);
    }
  };

  const handleDownloadPDF = async () => {
    if (!wrapperRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await renderCanvas();
      const pdfW = 595.28;
      const pdfH = (canvas.height / canvas.width) * pdfW;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [pdfW, pdfH] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`phonepe-receipt-${txnId}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!wrapperRef.current || downloadingPng) return;
    setDownloadingPng(true);
    try {
      const canvas = await renderCanvas();
      const link = document.createElement('a');
      link.download = `phonepe-receipt-${txnId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('PNG generation failed', err);
    } finally {
      setDownloadingPng(false);
    }
  };

  const wrapper = (
    <div className="pp-wrapper" ref={wrapperRef}>
      {/* Header */}
      <div className="pp-header">
        <div className="pp-logo-circle">
          <img src="/assets/phonpe.png" className="pp-logo-img" alt="PhonePe" />
        </div>
        <div className="pp-header-text">
          <p className="pp-success-title">Transaction Successful</p>
          <p className="pp-timestamp">{formatTimestamp(timestamp)}</p>
        </div>
      </div>

      {/* Main card */}
      <div className="pp-card">
        <p className="pp-section-label">Paid to</p>

        <div className="pp-paid-to-row">
          <div className="pp-bank-logo-circle">
            {recipientBankInfo
              ? <img src={recipientBankInfo.logo} className="pp-bank-logo-img" alt={recipientBankInfo.name} />
              : <span style={{ fontSize: 20 }}>🏦</span>
            }
          </div>
          <div className="pp-paid-to-info">
            <p className="pp-recipient-name">{recipientName}</p>
            <p className="pp-masked-acct">{maskedRecipient}</p>
            <p className="pp-bank-name">{recipientBankInfo?.name ?? recipientBank?.name}</p>
          </div>
          <span className="pp-amount-text">₹{Number(amount).toLocaleString('en-IN')}</span>
        </div>

        <div className="pp-divider" />

        <div className="pp-banking-name-row">
          <span className="pp-banking-name-label">Banking Name</span>
          <div className="pp-banking-name-value">
            <span className="pp-colon">: </span>
            <span className="pp-banking-name-text">{recipientName}</span>
            <img src="/assets/shield-check.png" className="pp-verified-badge" alt="Verified" />
          </div>
        </div>

        <div className="pp-divider" />

        <button
          className="pp-transfer-header"
          onClick={() => setDetailsExpanded((v) => !v)}
          type="button"
        >
          <div className="pp-transfer-left">
            <div className="pp-details-icon-box">
              <img src="/assets/Listicon.png" alt="List" className="pp-details-icon-img" />
            </div>
            <span className="pp-transfer-title">Transfer Details</span>
          </div>
          <span className="pp-chevron">{detailsExpanded ? '⌃' : '⌄'}</span>
        </button>

        {detailsExpanded && (
          <div className="pp-details-body">
            <p className="pp-detail-label">Transaction ID</p>
            <p className="pp-detail-value">{ppTxnId || txnId}</p>

            <p className="pp-detail-label" style={{ marginTop: 14 }}>Debited from</p>
            <div className="pp-debited-row">
              <div className="pp-debit-icon-box">
                {senderBankInfo
                  ? <img src={senderBankInfo.logo} className="pp-debit-bank-logo" alt={senderBankInfo.name} />
                  : <span style={{ fontSize: 18 }}>🏦</span>
                }
              </div>
              <div className="pp-debit-info">
                <p className="pp-debit-acct">{maskedSender}</p>
                <p className="pp-debit-utr">UTR: {utr}</p>
              </div>
              <span className="pp-debit-amount">₹{Number(amount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Powered by */}
      <div className="pp-powered-row">
        <span className="pp-powered-text">Powered by</span>
        <img src="/assets/Bank%20Logo/UPI-Logo-vector.png" className="pp-upi-logo" alt="UPI" />
        <img src="/assets/Yes.png" className="pp-yes-logo" alt="Yes Bank" />
      </div>
    </div>
  );

  if (preview) {
    return <div className="pp-preview-wrap">{wrapper}</div>;
  }

  return (
    <div id="phonepe-screen">
      <div className="pp-fullscreen-layout">
        <div className="pp-content-area" ref={cardRef}>
          {wrapper}
        </div>

        {/* Action buttons pinned to bottom */}
        <div className="pp-actions">
          <button
            className="pp-action-btn pp-download-btn"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? (
              <span className="pp-action-text">Generating PDF…</span>
            ) : (
              <>
                <span className="action-btn-icon-inline">⬇</span>
                <span className="pp-action-text">Download as PDF</span>
              </>
            )}
          </button>

          <button
            className="pp-action-btn pp-download-btn"
            onClick={handleDownloadPNG}
            disabled={downloadingPng}
          >
            {downloadingPng ? (
              <span className="pp-action-text">Generating PNG…</span>
            ) : (
              <>
                <span className="action-btn-icon-inline">⬇</span>
                <span className="pp-action-text">Download as PNG</span>
              </>
            )}
          </button>

          <button className="pp-action-btn" onClick={onNewTransaction}>
            <span className="pp-action-text">New Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
}
