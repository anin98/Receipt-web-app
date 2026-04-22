import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getBankById } from '../data/banks';

const BANK_IFSC_CODE = {
  sbi: 'SBIN', pnb: 'PUNB', bob: 'BARB', canara: 'CNRB', union: 'UBIN',
  boi: 'BKID', indian: 'IDIB', central: 'CBIN',
  hdfc: 'HDFC', icici: 'ICIC', axis: 'UTIB', kotak: 'KKBK', indusind: 'INDB',
  airtel: 'AIRP', ippb: 'IPOS', au: 'AUBL', equitas: 'ESFB',
};

function seedFrom(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) >>> 0;
  return h;
}

function buildDebitAccount(senderDigits, txnId) {
  const prefix = String(5000000000 + (seedFrom(txnId + 'd') % 4999999999));
  return (prefix + (senderDigits || '0000')).slice(0, 13);
}

function buildIfsc(bankId, txnId) {
  const code = BANK_IFSC_CODE[bankId] || 'BANK';
  const num = String(1000000 + (seedFrom(txnId + 'i') % 8999999)).slice(0, 6);
  return `${code}0${num.padStart(6, '0')}`;
}

function buildRefId(txnId) {
  return String(100000 + (seedFrom(txnId) % 899999));
}

function formatDMY(ts) {
  try {
    const d = new Date(ts.replace(' ', 'T'));
    const day = String(d.getDate()).padStart(2, '0');
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${mon}/${d.getFullYear()}`;
  } catch {
    return ts;
  }
}

export default function BankPortalReceipt({ data, onNewTransaction, preview }) {
  const {
    senderDigits,
    recipientName, recipientPhone, recipientBank,
    amount, txnId, timestamp, bpIfsc, bpRemark,
  } = data;

  const recipientBankInfo = getBankById(recipientBank?.id);

  const [downloading, setDownloading] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const cardRef = useRef(null);

  const refId = buildRefId(txnId);
  const debitAccount = recipientPhone && recipientPhone.length >= 10
    ? buildDebitAccount(senderDigits, txnId)
    : buildDebitAccount(senderDigits, txnId);
  const ifsc = bpIfsc || buildIfsc(recipientBank?.id, txnId);
  const amtFmt = Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const renderCanvas = async () => {
    const offscreen = document.createElement('div');
    Object.assign(offscreen.style, {
      position: 'fixed',
      left: '-9999px',
      top: '0',
      width: '900px',
      background: '#fff',
      padding: '24px',
      boxSizing: 'border-box',
    });

    const clone = cardRef.current.cloneNode(true);
    offscreen.appendChild(clone);
    document.body.appendChild(offscreen);

    try {
      return await html2canvas(offscreen, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#fff',
        logging: false,
      });
    } finally {
      document.body.removeChild(offscreen);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await renderCanvas();
      const pdfW = 842;
      const pdfH = (canvas.height / canvas.width) * pdfW;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [pdfW, pdfH] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`payment-summary-${refId}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!cardRef.current || downloadingPng) return;
    setDownloadingPng(true);
    try {
      const canvas = await renderCanvas();
      const link = document.createElement('a');
      link.download = `payment-summary-${refId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('PNG generation failed', err);
    } finally {
      setDownloadingPng(false);
    }
  };

  const page = (
    <div className="bp-page" ref={cardRef}>
      <h1 className="bp-title">Initiate Single Entry Payment Summary</h1>

      <div className="bp-success-bar">
        <span className="bp-success-icon">
          <img src="/assets/Bank%20Logo/bankinfo.png" className="bp-bankinfo-logo" alt="" />
        </span>
        <span className="bp-success-text">
          Transaction with reference id {refId} processed successfully.
        </span>
      </div>

      <div className="bp-details">
        <div className="bp-row">
          <span className="bp-label">Reference ID:</span>
          <span className="bp-value">{refId}</span>
        </div>
        <div className="bp-row">
          <span className="bp-label">Debit Account Number :</span>
          <span className="bp-value bp-link">{debitAccount}</span>
        </div>
        <div className="bp-row">
          <span className="bp-label">Beneficiary Name:</span>
          <span className="bp-value bp-link">{(recipientName || '').toUpperCase()}</span>
        </div>
        <div className="bp-row">
          <span className="bp-label">Beneficiary Bank Name:</span>
          <span className="bp-value">
            {(recipientBankInfo?.name ?? recipientBank?.name ?? '').toUpperCase()}
          </span>
        </div>
        <div className="bp-row">
          <span className="bp-label">IFSC Code:</span>
          <span className="bp-value">{ifsc}</span>
        </div>
        <div className="bp-row">
          <span className="bp-label">Amount (INR) :</span>
          <span className="bp-value">INR {amtFmt}</span>
        </div>
        <div className="bp-row">
          <span className="bp-label">Transaction Date(dd/MM/yyyy)</span>
          <span className="bp-value">{formatDMY(timestamp)}</span>
        </div>
        <div className="bp-row">
          <span className="bp-label">Remark:</span>
          <span className="bp-value">{bpRemark || '12'}</span>
        </div>
      </div>
    </div>
  );

  if (preview) {
    return <div className="bp-preview-wrap">{page}</div>;
  }

  return (
    <div id="bankportal-screen">
      <div className="bp-layout">
        {page}

        <div className="bp-actions">
          <button
            className="bp-action-btn bp-download-btn"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? 'Generating PDF…' : '⬇  Download as PDF'}
          </button>
          <button
            className="bp-action-btn bp-download-btn"
            onClick={handleDownloadPNG}
            disabled={downloadingPng}
          >
            {downloadingPng ? 'Generating PNG…' : '⬇  Download as PNG'}
          </button>
          <button className="bp-action-btn" onClick={onNewTransaction}>
            New Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
