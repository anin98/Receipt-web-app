export const BANKS = [
  // Public Sector
  { id: 'sbi',      name: 'State Bank of India',          logo: '/assets/Bank Logo/SBI-logo.svg.png' },
  { id: 'pnb',      name: 'Punjab National Bank',         logo: '/assets/Bank Logo/pnb.png' },
  { id: 'bob',      name: 'Bank of Baroda',               logo: '/assets/Bank Logo/BANKBARODA.NS-6790b239.png' },
  { id: 'canara',   name: 'Canara Bank',                  logo: '/assets/Bank Logo/CANBK.NS-94324ae3.png' },
  { id: 'union',    name: 'Union Bank of India',          logo: '/assets/Bank Logo/UNIONBANK.NS-5bba728d.png' },
  { id: 'boi',      name: 'Bank of India',                logo: '/assets/Bank Logo/bank-of-india.png' },
  { id: 'indian',   name: 'Indian Bank',                  logo: '/assets/Bank Logo/INDIANB.NS-a686632c.png' },
  { id: 'central',  name: 'Central Bank of India',        logo: '/assets/Bank Logo/CENTRALBK.NS-b0f5735a.png' },
  // Private Sector
  { id: 'hdfc',     name: 'HDFC Bank',                    logo: '/assets/Bank Logo/hdfc-bank.png' },
  { id: 'icici',    name: 'ICICI Bank',                   logo: '/assets/Bank Logo/icici-bank.png' },
  { id: 'axis',     name: 'Axis Bank',                    logo: '/assets/Bank Logo/axis-bank.png' },
  { id: 'kotak',    name: 'Kotak Mahindra Bank',          logo: '/assets/Bank Logo/kotak-bank.png' },
  { id: 'indusind', name: 'IndusInd Bank',                logo: '/assets/Bank Logo/indusind-bank.png' },
  // Payments & Small Finance
  { id: 'airtel',   name: 'Airtel Payments Bank',         logo: '/assets/Bank Logo/airtel-payments-bank.png' },
  { id: 'ippb',     name: 'India Post Payments Bank',     logo: '/assets/Bank Logo/ippb.png' },
  { id: 'au',       name: 'AU Small Finance Bank',        logo: '/assets/Bank Logo/au-small-finance-bank.png' },
  { id: 'equitas',  name: 'Equitas Small Finance Bank',   logo: '/assets/Bank Logo/equitas-bank.png' },
];

export const getBankById = (id) => BANKS.find((b) => b.id === id);

export const randomDigits = () => String(Math.floor(1000 + Math.random() * 9000));

export const generateTxnId = () => {
  return String(Math.floor(Math.random() * 9e11) + 1e11);
};

export const generatePhonePeTxnId = () => {
  const digits = Array.from({ length: 21 }, () => Math.floor(Math.random() * 10)).join('');
  return `T2${digits}`;
};

export const NAVI_IFSC_CODE = {
  sbi: 'sbin', pnb: 'punb', bob: 'barb', canara: 'cnrb', union: 'ubin',
  boi: 'boib', indian: 'idib', central: 'cbin',
  hdfc: 'hdfc', icici: 'icic', axis: 'utib', kotak: 'kkbk', indusind: 'indb',
  airtel: 'airp', ippb: 'ipos', au: 'aubl', equitas: 'esfb',
};

export function buildUpiId(recipientPhone, bankId) {
  const code = NAVI_IFSC_CODE[bankId] || 'bank';
  const acct = (recipientPhone || '').replace(/\D/g, '') || '0000000000000';
  const seed = parseInt(acct.slice(-6), 10) || 0;
  const suffix = String(1000000 + (seed % 8999999)).slice(0, 7);
  return `${acct}@${code}${suffix}.ifsc.npci`;
}

export function buildUpiTxnId(txnId) {
  const seed = parseInt(String(txnId).replace(/\D/g, '').slice(-9), 10) || 987654321;
  return String(600000000000 + (seed % 399999999999)).padStart(12, '0');
}
