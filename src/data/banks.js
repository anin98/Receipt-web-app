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
  { id: 'iob',      name: 'Indian Overseas Bank',         logo: '/assets/Bank Logo/IOB.svg' },
  { id: 'uco',      name: 'UCO Bank',                     logo: '/assets/Bank Logo/uco-bank.png' },
  { id: 'mahb',     name: 'Bank of Maharashtra',          logo: '/assets/Bank Logo/bank-of-maharashtra-logo.png' },
  { id: 'psb',      name: 'Punjab & Sind Bank',           logo: '/assets/Bank Logo/punjab-sind-bank.png' },
  { id: 'idbi',     name: 'IDBI Bank',                    logo: '/assets/Bank Logo/IDBI-Bank-emblem.png' },
  // Private Sector
  { id: 'hdfc',     name: 'HDFC Bank',                    logo: '/assets/Bank Logo/hdfc-bank.png' },
  { id: 'icici',    name: 'ICICI Bank',                   logo: '/assets/Bank Logo/icici-bank.png' },
  { id: 'axis',     name: 'Axis Bank',                    logo: '/assets/Bank Logo/axis-bank.png' },
  { id: 'kotak',    name: 'Kotak Mahindra Bank',          logo: '/assets/Bank Logo/kotak-bank.png' },
  { id: 'indusind', name: 'IndusInd Bank',                logo: '/assets/Bank Logo/indusind-bank.png' },
  { id: 'idfc',     name: 'IDFC FIRST Bank',              logo: '/assets/Bank Logo/idfc-first-bank.png' },
  { id: 'yes',      name: 'Yes Bank',                     logo: '/assets/Bank Logo/yes-bank.png' },
  { id: 'federal',  name: 'Federal Bank',                 logo: '/assets/Bank Logo/federal.jpg' },
  { id: 'southind', name: 'South Indian Bank',            logo: '/assets/Bank Logo/south-indian-bank.png' },
  { id: 'kvb',      name: 'Karur Vysya Bank',             logo: '/assets/Bank Logo/KARURVYSYA.NS-2afed839.png' },
  { id: 'bandhan',  name: 'Bandhan Bank',                 logo: '/assets/Bank Logo/BANDHANBNK.NS-55891c4e.png' },
  { id: 'rbl',      name: 'RBL Bank',                     logo: '/assets/Bank Logo/RBLBANK.NS-eca1a0f2.png' },
  { id: 'karnataka',name: 'Karnataka Bank',               logo: '/assets/Bank Logo/KTKBANK.NS-6f6bc8b3.png' },
  { id: 'dhanlaxmi',name: 'Dhanlaxmi Bank',               logo: '/assets/Bank Logo/dhan-laxmi.png' },
  { id: 'cub',      name: 'City Union Bank',              logo: '/assets/Bank Logo/CUB.NS-9eb81137.png' },
  { id: 'dcb',      name: 'DCB Bank',                     logo: '/assets/Bank Logo/dcb%20bank.png' },
  { id: 'tmb',      name: 'Tamilnad Mercantile Bank',     logo: '/assets/Bank Logo/tamilnadu%20mercantile.png' },
  // Foreign Banks
  { id: 'hsbc',     name: 'HSBC Bank',                    logo: '/assets/Bank Logo/hsbc-bank.png' },
  { id: 'scb',      name: 'Standard Chartered Bank',      logo: '/assets/Bank Logo/standard_chartered_bank_logo.png' },
  { id: 'dbs',      name: 'DBS Bank (digibank)',          logo: '/assets/Bank Logo/DBS_Bank_Logo_(alternative).svg.png' },
  // Payments Banks
  { id: 'airtel',   name: 'Airtel Payments Bank',         logo: '/assets/Bank Logo/airtel-payments-bank.png' },
  { id: 'ippb',     name: 'India Post Payments Bank',     logo: '/assets/Bank Logo/ippb.png' },
  { id: 'fino',     name: 'Fino Payments Bank',           logo: '/assets/Bank Logo/fino%20bank.png' },
  // Small Finance Banks
  { id: 'au',       name: 'AU Small Finance Bank',        logo: '/assets/Bank Logo/au-small-finance-bank.png' },
  { id: 'equitas',  name: 'Equitas Small Finance Bank',   logo: '/assets/Bank Logo/equitas-bank.png' },
  { id: 'jana',     name: 'Jana Small Finance Bank',      logo: '/assets/Bank Logo/jana%20bank.jpg' },
  { id: 'ujjivan',  name: 'Ujjivan Small Finance Bank',   logo: '/assets/Bank Logo/Ujjivan%20Small%20Finance%20Bank.jpg' },
  { id: 'suryoday', name: 'Suryoday Small Finance Bank',  logo: '/assets/Bank Logo/suryoday.png' },
  // Co-operative Banks
  { id: 'saraswat', name: 'Saraswat Co-operative Bank',   logo: '/assets/Bank Logo/Saraswat-Bank-Logo-Vector.svg-.png' },
  { id: 'cosmos',   name: 'Cosmos Bank',                  logo: '/assets/Bank Logo/Cosmos_Bank_(emblem).jpg' },
  { id: 'tjsb',     name: 'TJSB Sahakari Bank',           logo: '/assets/Bank Logo/tjsb.png' },
  { id: 'svc',      name: 'SVC Co-operative Bank',        logo: '/assets/Bank Logo/svc-bank.webp' },
  { id: 'abhyudaya',name: 'Abhyudaya Co-op Bank',         logo: '/assets/Bank Logo/Abhyudaya%20Co-op%20Bank.png' },
  { id: 'gpparsik', name: 'G P Parsik Bank',              logo: '/assets/Bank Logo/G%20P%20Parsik%20Bank.png' },
  // Regional Rural Banks
  { id: 'hpgb',     name: 'Himachal Pradesh Gramin Bank', logo: '/assets/Bank Logo/Himachal%20Pradesh%20Gramin%20Bank.png' },
  { id: 'kgb',      name: 'Kerala Gramin Bank',           logo: '/assets/Bank Logo/kerala-gramin-bank-regional-rural-bank.png' },
  { id: 'apgvb',    name: 'Andhra Pradesh Grameena Vikas Bank', logo: '/assets/Bank Logo/andhra-pradesh-grameena-vikas-bank.png' },
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
  iob: 'ioba', uco: 'ucba', mahb: 'mahb', psb: 'psib', idbi: 'ibkl',
  hdfc: 'hdfc', icici: 'icic', axis: 'utib', kotak: 'kkbk', indusind: 'indb',
  idfc: 'idfb', yes: 'yesb', federal: 'fdrl', southind: 'sibl', kvb: 'kvbl',
  bandhan: 'bdbl', rbl: 'ratn', karnataka: 'karb', dhanlaxmi: 'dlxb',
  cub: 'ciub', dcb: 'dcbl', tmb: 'tmbl',
  hsbc: 'hsbc', scb: 'scbl', dbs: 'dbss',
  airtel: 'airp', ippb: 'ipos', fino: 'fino',
  au: 'aubl', equitas: 'esfb', jana: 'jsfb', ujjivan: 'ujvn', suryoday: 'sury',
  saraswat: 'srcb', cosmos: 'cosb', tjsb: 'tjsb', svc: 'svcb',
  abhyudaya: 'abhy', gpparsik: 'gppb',
  hpgb: 'hpsc', kgb: 'klgb', apgvb: 'apgv',
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
