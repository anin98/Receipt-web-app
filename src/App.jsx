import { useState } from 'react';
import TransactionForm from './components/TransactionForm';
import SuccessReceipt from './components/SuccessReceipt';
import PhonePeReceipt from './components/PhonePeReceipt';
import NaviReceipt from './components/NaviReceipt';
import BankPortalReceipt from './components/BankPortalReceipt';
import './index.css';

export default function App() {
  const [screen, setScreen] = useState('form'); // 'form' | 'paytm-receipt' | 'phonepe-receipt' | 'navi-receipt'
  const [receiptData, setReceiptData] = useState(null);

  const handleSubmit = (data) => {
    setReceiptData(data);
    if (data.mode === 'phonepe') setScreen('phonepe-receipt');
    else if (data.mode === 'navi') setScreen('navi-receipt');
    else if (data.mode === 'bankportal') setScreen('bankportal-receipt');
    else setScreen('paytm-receipt');
    window.scrollTo(0, 0);
  };

  const handleNewTransaction = () => {
    setScreen('form');
    window.scrollTo(0, 0);
  };

  return (
    <>
      {screen === 'form' && <TransactionForm onSubmit={handleSubmit} />}
      {screen === 'paytm-receipt' && receiptData && (
        <SuccessReceipt data={receiptData} onNewTransaction={handleNewTransaction} />
      )}
      {screen === 'phonepe-receipt' && receiptData && (
        <PhonePeReceipt data={receiptData} onNewTransaction={handleNewTransaction} />
      )}
      {screen === 'navi-receipt' && receiptData && (
        <NaviReceipt data={receiptData} onNewTransaction={handleNewTransaction} />
      )}
      {screen === 'bankportal-receipt' && receiptData && (
        <BankPortalReceipt data={receiptData} onNewTransaction={handleNewTransaction} />
      )}
    </>
  );
}
