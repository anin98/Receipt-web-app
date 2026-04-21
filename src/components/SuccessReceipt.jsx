import { useRef, useState, useLayoutEffect } from 'react';
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


export default function SuccessReceipt({ data, onNewTransaction, preview }) {
  const {
    senderName, senderBank, senderDigits,
    recipientName, recipientBank, recipientDigits,
    amount, txnId, timestamp,
  } = data;

  const cardRef = useRef(null);
  const amountRowRef = useRef(null);
  const amountTextRef = useRef(null);
  const iconRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);

  // Auto-fit amount font size: pick the largest size within [MIN, MAX] that
  // keeps amount text + icon inside the row. Short values grow, long values
  // shrink — something plain CSS clamp can't do because it doesn't know
  // content length.
  useLayoutEffect(() => {
    const row = amountRowRef.current;
    const text = amountTextRef.current;
    const icon = iconRef.current;
    if (!row || !text) return;
    const MIN = 18;
    const MAX = 36;
    const fit = () => {
      const iconW = icon ? icon.getBoundingClientRect().width : 0;
      const gap = 10;
      const available = row.clientWidth - iconW - gap;
      let lo = MIN;
      let hi = MAX;
      text.style.fontSize = `${MAX}px`;
      // Binary search for largest size that fits.
      for (let i = 0; i < 10; i++) {
        const mid = (lo + hi) / 2;
        text.style.fontSize = `${mid}px`;
        if (text.scrollWidth <= available) lo = mid;
        else hi = mid;
      }
      text.style.fontSize = `${Math.floor(lo)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(row);
    return () => ro.disconnect();
  }, [amount]);

  const recipientBankInfo = getBankById(recipientBank?.id);
  const senderBankInfo = getBankById(senderBank?.id);

  const paidInSeconds = (1.5 + (parseInt(txnId.slice(-3), 36) % 500) / 100).toFixed(2);

  const captureCard = async () => {
    // html-to-image (via SVG foreignObject) is the only option that respects
    // CSS mask — needed for the scallop edges. But mobile Safari drops remote
    // <img> during serialization, so we pre-inline every image as a data URL
    // before the capture, then restore the originals afterwards.
    const imgs = Array.from(cardRef.current.querySelectorAll('img'));
    const originals = imgs.map((el) => el.src);
    await Promise.all(
      imgs.map(async (el) => {
        try {
          // Load the image so we know its intrinsic size.
          if (!(el.complete && el.naturalWidth > 0)) {
            await new Promise((r) => { el.onload = r; el.onerror = r; });
          }
          // Downscale through a canvas to cap the data URL size. Safari iOS
          // drops SVG foreignObject when an embedded image data URL is too
          // large (rocket.png = 1.5MB was failing). Target 2× the displayed
          // box so the capture stays sharp at devicePixelRatio up to 2.
          // Scale to 3× rendered size to match toPng's pixelRatio of 3,
          // so the embedded image stays sharp in the final capture.
          const rect = el.getBoundingClientRect();
          const targetW = Math.max(1, Math.round(rect.width * 3));
          const targetH = Math.max(1, Math.round(rect.height * 3));
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(el, 0, 0, targetW, targetH);
          el.src = canvas.toDataURL('image/png');
          await new Promise((r) => {
            if (el.complete && el.naturalWidth > 0) return r();
            el.onload = r;
            el.onerror = r;
          });
        } catch {
          // Leave original src on failure.
        }
      })
    );

    try {
      await toPng(cardRef.current, { pixelRatio: 1 });
      return await toPng(cardRef.current, { pixelRatio: 3 });
    } finally {
      imgs.forEach((el, i) => { el.src = originals[i]; });
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const cardDataUrl = await captureCard();

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

  const handleDownloadPNG = async () => {
    if (!cardRef.current || downloadingPng) return;
    setDownloadingPng(true);
    try {
      const cardDataUrl = await captureCard();

      const img = new Image();
      img.src = cardDataUrl;
      await new Promise((res) => { img.onload = res; });

      const pad = 60;
      const outW = img.naturalWidth + pad * 2;
      const outH = img.naturalHeight + pad * 2;

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#01b9f3';
      ctx.fillRect(0, 0, outW, outH / 2);
      ctx.fillStyle = '#052a7b';
      ctx.fillRect(0, outH / 2, outW, outH / 2);

      ctx.drawImage(img, pad, pad);

      const link = document.createElement('a');
      link.download = `paytm-receipt-${txnId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('PNG generation failed', err);
    } finally {
      setDownloadingPng(false);
    }
  };

  const card = (
    <div className="receipt-card" ref={cardRef}>
      <img
        src="/assets/png-transparent-paytm-hd-logo.png"
        className="receipt-logo"
        alt="Paytm"
      />

      <h4 className="success-text">Payment Successful</h4>

      <div className="amount-row" ref={amountRowRef}>
        <span className="amount-text" ref={amountTextRef}>₹{formatINR(amount)}</span>
        <img
          src="/assets/pmn-success.png"
          className="success-icon"
          alt="Success"
          ref={iconRef}
        />
      </div>

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
        <span className="paid-text"><img src="/assets/rocket.png" className="rocket-icon" alt="" />Paid in {paidInSeconds} Seconds</span>
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
  );

  if (preview) {
    return <div className="receipt-preview-card-wrap">{card}</div>;
  }

  return (
    <div id="receipt-screen">
      <div className="receipt-fullscreen-layout">
        {/* Card area — scrollable on very small screens */}
        <div className="receipt-card-area">
          {card}
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

          <button
            className="action-btn download-btn"
            onClick={handleDownloadPNG}
            disabled={downloadingPng}
          >
            {downloadingPng ? (
              <span className="action-btn-text">Generating PNG…</span>
            ) : (
              <>
                <span className="action-btn-icon-inline">⬇</span>
                <span className="action-btn-text">Download as PNG</span>
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
