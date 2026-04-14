import { useState, useEffect, useRef } from 'react';
import BankModal from './BankModal';
import { randomDigits, generateTxnId, generatePhonePeTxnId, buildUpiId, buildUpiTxnId } from '../data/banks';

const DEFAULT_BALANCE = 120;

function pad(n) { return String(n).padStart(2, '0'); }

function todayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function currentTime() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function BankSelector({ label, selectedBank, accountDigits, onOpen, error }) {
  return (
    <>
      <label className="label">{label}</label>
      <button
        className={`bank-selector${error ? ' error' : ''}`}
        onClick={onOpen}
        type="button"
      >
        {selectedBank ? (
          <>
            <img className="bank-logo-small" src={selectedBank.logo} alt={selectedBank.name} />
            <span className="bank-selector-text">{selectedBank.name}</span>
            <span className="bank-digits-badge">•••• {accountDigits}</span>
          </>
        ) : (
          <span className="bank-selector-placeholder">Select a bank</span>
        )}
        <span className="bank-selector-arrow">⌄</span>
      </button>
      {error && <span className="error-text">{error}</span>}
    </>
  );
}

export default function TransactionForm({ onSubmit }) {
  const [appMode, setAppMode] = useState('paytm'); // 'paytm' | 'phonepe' | 'navi'
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState(null);
  const [senderDigits, setSenderDigits] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientBank, setRecipientBank] = useState(null);
  const [recipientDigits, setRecipientDigits] = useState('');
  const [amount, setAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(String(DEFAULT_BALANCE));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [txnDate, setTxnDate] = useState(todayDate());
  const [txnTime, setTxnTime] = useState(currentTime());
  const [txnId, setTxnId] = useState(() => generateTxnId());
  const [naviUpiId, setNaviUpiId] = useState('');
  const [naviTxnId, setNaviTxnId] = useState('');
  const naviUpiDirty = useRef(false);
  const naviTxnDirty = useRef(false);
  const [bpIfsc, setBpIfsc] = useState('');
  const [bpRemark, setBpRemark] = useState('');
  const [ppTxnId, setPpTxnId] = useState(() => generatePhonePeTxnId());
  const ppTxnDirty = useRef(false);
  const [ppUtr, setPpUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalPicker, setModalPicker] = useState(null);

  useEffect(() => {
    if (!naviUpiDirty.current) {
      setNaviUpiId(buildUpiId(recipientPhone, recipientBank?.id));
    }
  }, [recipientPhone, recipientBank?.id]);

  useEffect(() => {
    if (!naviTxnDirty.current) {
      setNaviTxnId(buildUpiTxnId(txnId));
    }
  }, [txnId]);

  const validate = () => {
    const e = {};
    if (!senderName.trim()) e.senderName = 'Your name is required.';
    if (!senderBank) e.senderBank = 'Select your bank.';
    if (!recipientName.trim()) e.recipientName = 'Recipient name is required.';
    if (!recipientPhone.trim()) e.recipientPhone = 'Account number is required.';
    if (!recipientBank) e.recipientBank = 'Select recipient bank.';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      e.amount = 'Enter a valid transaction amount.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    setTimeout(() => {
      const balance = parseFloat(walletBalance || DEFAULT_BALANCE);
      const updatedBalance = (balance - parseFloat(amount)).toFixed(2);
      const timestamp = `${txnDate} ${txnTime}`;

      onSubmit({
        mode: appMode,
        senderName: senderName.trim(),
        senderBank,
        senderDigits,
        recipientName: recipientName.trim(),
        recipientPhone,
        recipientBank,
        recipientDigits,
        amount,
        updatedBalance,
        txnId,
        timestamp,
        naviUpiId: naviUpiId.trim(),
        naviTxnId: naviTxnId.trim(),
        bpIfsc: bpIfsc.trim(),
        bpRemark: bpRemark.trim(),
        ppTxnId: ppTxnId.trim(),
        ppUtr: ppUtr.trim(),
      });

      // Reset
      setSenderName(''); setSenderBank(null); setSenderDigits('');
      setRecipientName(''); setRecipientPhone('');
      setRecipientBank(null); setRecipientDigits('');
      setAmount(''); setWalletBalance(String(DEFAULT_BALANCE));
      setTxnDate(todayDate()); setTxnTime(currentTime());
      setTxnId(generateTxnId());
      naviUpiDirty.current = false; naviTxnDirty.current = false;
      setNaviUpiId(''); setNaviTxnId('');
      setBpIfsc(''); setBpRemark('');
      ppTxnDirty.current = false; setPpTxnId(generatePhonePeTxnId());
      setPpUtr('');
      setErrors({});
      setLoading(false);
    }, 1800);
  };

  const handleBankSelect = (bank) => {
    if (modalPicker === 'sender') {
      setSenderBank(bank); setSenderDigits(randomDigits());
      setErrors((prev) => { const e = { ...prev }; delete e.senderBank; return e; });
    } else {
      const last4 = recipientPhone.replace(/\D/g, '').slice(-4).padStart(4, '0');
      setRecipientBank(bank); setRecipientDigits(last4 || randomDigits());
      setErrors((prev) => { const e = { ...prev }; delete e.recipientBank; return e; });
    }
    setModalPicker(null);
  };

  const clearErr = (key) =>
    setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });

  return (
    <>
      <div id="form-screen">
        <form onSubmit={handleSubmit} noValidate>

          {/* Header */}
          <div className="header">
            {appMode === 'paytm' && (
              <img
                src="/assets/png-transparent-paytm-hd-logo.png"
                className="header-logo"
                alt="Paytm"
              />
            )}
            {appMode === 'phonepe' && (
              <div className="phonepe-logo-circle">
                <img
                  src="/assets/phonpe.png"
                  className="phonepe-logo-img"
                  alt="PhonePe"
                />
              </div>
            )}
            {appMode === 'navi' && (
              <img
                src="/assets/navi logo.png"
                className="header-logo"
                alt="Navi UPI"
              />
            )}
            <span className="header-sub">Receipt Generator</span>
          </div>

          {/* Mode Toggle */}
          <div className="toggle-row">
            <button
              type="button"
              className={`toggle-btn${appMode === 'paytm' ? ' active' : ''}`}
              onClick={() => setAppMode('paytm')}
            >
              Paytm
            </button>
            <button
              type="button"
              className={`toggle-btn${appMode === 'phonepe' ? ' active' : ''}`}
              onClick={() => setAppMode('phonepe')}
            >
              PhonePe
            </button>
            <button
              type="button"
              className={`toggle-btn${appMode === 'navi' ? ' active' : ''}`}
              onClick={() => setAppMode('navi')}
            >
              Navi
            </button>
            <button
              type="button"
              className={`toggle-btn${appMode === 'bankportal' ? ' active' : ''}`}
              onClick={() => setAppMode('bankportal')}
            >
              Bank Portal
            </button>
          </div>

          {/* Your Account Card */}
          <div className="card">
            <div className="section-header">
              <span className="section-icon">👤</span>
              <span className="section-title">Your Account</span>
            </div>

            <label className="label" htmlFor="senderName">Full Name</label>
            <input
              className={`input${errors.senderName ? ' error' : ''}`}
              id="senderName"
              type="text"
              placeholder="e.g. Masood Ahmad Bhat"
              value={senderName}
              onChange={(e) => { setSenderName(e.target.value); if (errors.senderName) clearErr('senderName'); }}
              autoComplete="off"
            />
            {errors.senderName && <span className="error-text">{errors.senderName}</span>}

            <BankSelector
              label="Bank Account"
              selectedBank={senderBank}
              accountDigits={senderDigits}
              onOpen={() => setModalPicker('sender')}
              error={errors.senderBank}
            />
          </div>

          {/* Recipient Details Card */}
          <div className="card">
            <div className="section-header">
              <span className="section-icon">🏦</span>
              <span className="section-title">Recipient Details</span>
            </div>

            <label className="label" htmlFor="recipientName">Recipient Name</label>
            <input
              className={`input${errors.recipientName ? ' error' : ''}`}
              id="recipientName"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={recipientName}
              onChange={(e) => { setRecipientName(e.target.value); if (errors.recipientName) clearErr('recipientName'); }}
              autoComplete="off"
            />
            {errors.recipientName && <span className="error-text">{errors.recipientName}</span>}

            <label className="label" htmlFor="recipientPhone">Account Number</label>
            <input
              className={`input${errors.recipientPhone ? ' error' : ''}`}
              id="recipientPhone"
              type="tel"
              inputMode="numeric"
              placeholder="Enter account number"
              value={recipientPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setRecipientPhone(val);
                if (val.length >= 4) setRecipientDigits(val.slice(-4));
                if (errors.recipientPhone) clearErr('recipientPhone');
              }}
              autoComplete="off"
            />
            {errors.recipientPhone && <span className="error-text">{errors.recipientPhone}</span>}

            <BankSelector
              label="Recipient Bank"
              selectedBank={recipientBank}
              accountDigits={recipientDigits}
              onOpen={() => setModalPicker('recipient')}
              error={errors.recipientBank}
            />
          </div>

          {/* Amount Card */}
          <div className="card">
            <div className="section-header">
              <span className="section-icon" style={{ fontSize: 14, fontWeight: 700, color: '#052a7b' }}>₹</span>
              <span className="section-title">Transaction Amount</span>
            </div>
            <label className="label" htmlFor="amount">Amount (₹)</label>
            <input
              className={`input${errors.amount ? ' error' : ''}`}
              id="amount"
              type="number"
              inputMode="decimal"
              placeholder="₹ 0.00"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); if (errors.amount) clearErr('amount'); }}
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>

          {/* Date & Time Card */}
          <div className="card">
            <div className="section-header">
              <span className="section-icon">🕐</span>
              <span className="section-title">Date &amp; Time</span>
            </div>
            <div className="date-time-row">
              <div className="date-time-field">
                <label className="label" htmlFor="txnDate">Date</label>
                <div className="picker-btn">
                  <span className="picker-btn-icon">📅</span>
                  <input
                    id="txnDate"
                    type="date"
                    className="picker-input"
                    value={txnDate}
                    onChange={(e) => setTxnDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="date-time-field">
                <label className="label" htmlFor="txnTime">Time</label>
                <div className="picker-btn">
                  <span className="picker-btn-icon">⏰</span>
                  <input
                    id="txnTime"
                    type="time"
                    className="picker-input"
                    value={txnTime}
                    onChange={(e) => setTxnTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Toggle */}
          <button
            type="button"
            className="advanced-toggle"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            <span className="advanced-toggle-icon">{showAdvanced ? '⌃' : '⌄'}</span>
            <span className="advanced-toggle-text">Advanced Settings</span>
          </button>

          {showAdvanced && (
            <div className="card">
              <div className="section-header">
                <span className="section-icon">👛</span>
                <span className="section-title">Wallet Balance Override</span>
              </div>
              <label className="label" htmlFor="txnId">Transaction / UTR Number</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className="input"
                  id="txnId"
                  type="text"
                  inputMode="numeric"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="advanced-toggle"
                  style={{ margin: 0, padding: '8px 12px', whiteSpace: 'nowrap' }}
                  onClick={() => setTxnId(generateTxnId())}
                >
                  ↻ Regenerate
                </button>
              </div>
              <span className="hint-text">Auto-generated 12-digit UTR. Edit or regenerate as needed.</span>

              <label className="label" htmlFor="walletBalance">Current Balance (₹)</label>
              <input
                className="input"
                id="walletBalance"
                type="number"
                inputMode="decimal"
                placeholder="120"
                value={walletBalance}
                onChange={(e) => setWalletBalance(e.target.value)}
              />
              <span className="hint-text">Default: ₹120. Override to simulate different account states.</span>

              {appMode === 'navi' && (
                <>
                  <div className="section-header" style={{ marginTop: 14 }}>
                    <span className="section-icon">📲</span>
                    <span className="section-title">Navi UPI Details</span>
                  </div>
                  <label className="label" htmlFor="naviUpiId">Recipient UPI Address</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      className="input"
                      id="naviUpiId"
                      type="text"
                      value={naviUpiId}
                      onChange={(e) => { naviUpiDirty.current = true; setNaviUpiId(e.target.value); }}
                      autoComplete="off"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="advanced-toggle"
                      style={{ margin: 0, padding: '8px 12px', whiteSpace: 'nowrap' }}
                      onClick={() => { naviUpiDirty.current = false; setNaviUpiId(buildUpiId(recipientPhone, recipientBank?.id)); }}
                    >
                      ↻ Regenerate
                    </button>
                  </div>

                  <label className="label" htmlFor="naviTxnId" style={{ marginTop: 10 }}>UPI Transaction Address</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      className="input"
                      id="naviTxnId"
                      type="text"
                      value={naviTxnId}
                      onChange={(e) => { naviTxnDirty.current = true; setNaviTxnId(e.target.value); }}
                      autoComplete="off"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="advanced-toggle"
                      style={{ margin: 0, padding: '8px 12px', whiteSpace: 'nowrap' }}
                      onClick={() => { naviTxnDirty.current = false; setNaviTxnId(buildUpiTxnId(txnId)); }}
                    >
                      ↻ Regenerate
                    </button>
                  </div>
                </>
              )}

              {appMode === 'bankportal' && (
                <>
                  <div className="section-header" style={{ marginTop: 14 }}>
                    <span className="section-icon">🏛️</span>
                    <span className="section-title">Bank Portal Details</span>
                  </div>
                  <label className="label" htmlFor="bpIfsc">Beneficiary IFSC Code</label>
                  <input
                    className="input"
                    id="bpIfsc"
                    type="text"
                    placeholder="Auto-generated from selected bank"
                    value={bpIfsc}
                    onChange={(e) => setBpIfsc(e.target.value.toUpperCase())}
                    autoComplete="off"
                  />
                  <span className="hint-text">Leave blank to auto-generate from recipient bank.</span>

                  <label className="label" htmlFor="bpRemark" style={{ marginTop: 10 }}>Remark</label>
                  <input
                    className="input"
                    id="bpRemark"
                    type="text"
                    placeholder="e.g. Payment for services"
                    value={bpRemark}
                    onChange={(e) => setBpRemark(e.target.value)}
                    autoComplete="off"
                  />
                  <span className="hint-text">Leave blank to use default remark.</span>
                </>
              )}

              {appMode === 'phonepe' && (
                <>
                  <div className="section-header" style={{ marginTop: 14 }}>
                    <span className="section-icon">📲</span>
                    <span className="section-title">PhonePe Transfer Details</span>
                  </div>
                  <label className="label" htmlFor="ppTxnId">Transaction ID</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      className="input"
                      id="ppTxnId"
                      type="text"
                      value={ppTxnId}
                      onChange={(e) => { ppTxnDirty.current = true; setPpTxnId(e.target.value); }}
                      autoComplete="off"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="advanced-toggle"
                      style={{ margin: 0, padding: '8px 12px', whiteSpace: 'nowrap' }}
                      onClick={() => { ppTxnDirty.current = false; setPpTxnId(generatePhonePeTxnId()); }}
                    >
                      ↻ Regenerate
                    </button>
                  </div>
                  <span className="hint-text">Format: T2 + 21 digits. Edit or regenerate as needed.</span>

                  <label className="label" htmlFor="ppUtr" style={{ marginTop: 10 }}>UTR (Debited from)</label>
                  <input
                    className="input"
                    id="ppUtr"
                    type="text"
                    inputMode="numeric"
                    placeholder="Auto-generated from Transaction ID"
                    value={ppUtr}
                    onChange={(e) => setPpUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    autoComplete="off"
                  />
                  <span className="hint-text">Leave blank to auto-generate from Transaction ID.</span>
                </>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            className={`submit-btn${appMode === 'phonepe' ? ' phonepe' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" />
            ) : (
              <>
                <span className="submit-btn-icon">➤</span>
                <span className="submit-btn-text">Send Money</span>
              </>
            )}
          </button>
        </form>
      </div>

      <BankModal
        visible={!!modalPicker}
        selectedBank={modalPicker === 'sender' ? senderBank : recipientBank}
        onSelect={handleBankSelect}
        onClose={() => setModalPicker(null)}
      />
    </>
  );
}
