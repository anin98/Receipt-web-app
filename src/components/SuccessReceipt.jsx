import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { getBankById } from '../data/banks';

function formatTimestamp(ts) {
  try {
    const d = new Date(ts.replace(' ', 'T'));
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const month = months[d.getMonth()];
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day} ${month}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  } catch {
    return ts;
  }
}

function formatINR(num) {
  return Number(num).toLocaleString('en-IN');
}


export default function SuccessReceipt({ data, onNewTransaction }) {
  const {
    senderName, senderBank, senderDigits,
    recipientName, recipientBank, recipientDigits,
    amount, txnId, timestamp,
  } = data;

  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const recipientBankInfo = getBankById(recipientBank?.id);
  const senderBankInfo = getBankById(senderBank?.id);

  const paidInSeconds = (1.5 + (parseInt(txnId.slice(-3), 36) % 500) / 100).toFixed(2);

  const handleDownloadPDF = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      // Capture the live card element — already fully rendered by the browser
      // so mask / -webkit-mask is respected by html-to-image's foreignObject approach.
      const cardDataUrl = await toPng(cardRef.current, { pixelRatio: 3 });

      const img = new Image();
      img.src = cardDataUrl;
      await new Promise((res) => { img.onload = res; });

      // PDF canvas: card width + 20pt padding on each side
      const pad = 20;
      const pdfW = 390;
      const cardPdfW = pdfW - pad * 2;
      const cardPdfH = (img.naturalHeight / img.naturalWidth) * cardPdfW;
      const pdfH = cardPdfH + pad * 2;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [pdfW, pdfH] });

      // Two-tone background matching the live screen (50/50 split)
      pdf.setFillColor('#01b9f3');
      pdf.rect(0, 0, pdfW, pdfH / 2, 'F');
      pdf.setFillColor('#052a7b');
      pdf.rect(0, pdfH / 2, pdfW, pdfH / 2, 'F');

      // Card image centred with padding
      pdf.addImage(cardDataUrl, 'PNG', pad, pad, cardPdfW, cardPdfH);

      pdf.save(`paytm-receipt-${txnId}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div id="receipt-screen">
      <div className="receipt-fullscreen-layout">
        {/* Card area — scrollable on very small screens */}
        <div className="receipt-card-area">
          <div className="receipt-card" ref={cardRef}>
            <img
              src="/assets/png-transparent-paytm-hd-logo.png"
              className="receipt-logo"
              alt="Paytm"
            />

            <p className="success-text">Payment Successful</p>

            <div className="amount-row">
              <span className="amount-text">₹{formatINR(amount)}</span>
              <img
                src="/assets/pmn-success.png"
                className="success-icon"
                alt="Success"
              />
            </div>

            <div className="hairline" />

            {/* To */}
            <div className="party-block">
              <p className="party-name">
                <span className="to-from-label">To: </span>{recipientName}
              </p>
              <div className="bank-row-receipt">
                <span className="bank-text-receipt">
                  {(recipientBankInfo?.name ?? recipientBank?.name)} – {recipientDigits}
                </span>
                {recipientBankInfo && (
                  <img
                    className="bank-logo-receipt"
                    src={recipientBankInfo.logo}
                    alt={recipientBankInfo.name}
                  />
                )}
              </div>
            </div>

            {/* Paid row */}
            <div className="paid-row">
              <div className="dotted-line" />
              <span className="paid-text">🚀 Paid in {paidInSeconds} Seconds</span>
              <div className="dotted-line" />
            </div>

            {/* From */}
            <div className="party-block">
              <p className="party-name">
                <span className="to-from-label">From: </span>{senderName}
              </p>
              <div className="bank-row-receipt">
                
                <span className="bank-text-receipt">
                  {(senderBankInfo?.name ?? senderBank?.name)} – {senderDigits}
                </span>
                {senderBankInfo && (
                  <img
                    className="bank-logo-receipt"
                    src={senderBankInfo.logo}
                    alt={senderBankInfo.name}
                  />
                )}
              </div>
            </div>

            <p className="ref-text">
              {formatTimestamp(timestamp)} | Ref. No: {txnId}
            </p>

            <div className="card-footer-divider" />

            <div className="card-footer">
              <img src="/assets/b-ptm.png" className="footer-logo" alt="Paytm" />
              <div className="footer-divider" />
              <div className="upi-box">
                <span className="powered-by">Powered{'\n'}by</span>
                <img src="/assets/b-upi.png" className="upi-logo" alt="UPI" />
              </div>
              <div className="footer-divider" />
              <img src="/assets/b-hdfc.png" className="hdfc-logo" alt="HDFC Bank" />
            </div>
          </div>
        </div>

        {/* Action buttons pinned to bottom */}
        <div className="receipt-actions">
          <button
            className="action-btn download-btn"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? (
              <span className="action-btn-text">Generating PDF…</span>
            ) : (
              <>
                <span className="action-btn-icon-inline">⬇</span>
                <span className="action-btn-text">Download as PDF</span>
              </>
            )}
          </button>

          <button className="action-btn" onClick={onNewTransaction}>
            <span className="action-btn-text">New Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
}
