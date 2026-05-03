/* ═══════════════════════════════════════════
   WEB3 PAYMENT — web3.js
   ═══════════════════════════════════════════ */

const TREASURY = '0xCcD7569F3197cd74116D01433E6e7673b6dcF30F';
const BASE_CHAIN_ID = 8453;
const BASE_CHAIN_HEX = '0x2105';
const PLAY_COST_WEI = '1000000000000'; // 0.000001 ETH
const SESSION_KEY = 'abz_session';
const LAST_ACTIVE_KEY = 'abz_last_active';
const MAX_IDLE_TIME = 5 * 60 * 1000; // 5 minutes in ms

let provider = null;
let signer = null;

function shortAddr(addr) {
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

function showGateStep(id) {
  document.querySelectorAll('.gate-step').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showGateError(msg) {
  const el = document.getElementById('gate-error');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 6000);
}

async function connectWallet() {
  const btn = document.getElementById('btn-connect');
  btn.disabled = true;
  btn.textContent = 'Connecting…';
  try {
    if (!window.ethereum) throw new Error('Web3 wallet not detected. Please use a Web3-enabled browser (like Coinbase Wallet).');
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    signer = await provider.getSigner();
    const addr = await signer.getAddress();
    const network = await provider.getNetwork();
    document.getElementById('wallet-address').textContent = shortAddr(addr);
    if (Number(network.chainId) !== BASE_CHAIN_ID) {
      await switchToBase();
    }
    showGateStep('step-pay');
  } catch (e) {
    showGateError(e.message || 'Connection failed');
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🔵</span> Connect Wallet';
  }
}

async function switchToBase() {
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BASE_CHAIN_HEX }] });
  } catch (switchErr) {
    if (switchErr.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: BASE_CHAIN_HEX, chainName: 'Base',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.base.org'],
          blockExplorerUrls: ['https://basescan.org']
        }]
      });
    } else throw switchErr;
  }
}

async function payToPlay() {
  const btn = document.getElementById('btn-pay');
  btn.disabled = true;
  document.getElementById('gate-error').style.display = 'none';
  try {
    if (!signer) throw new Error('Wallet not connected');
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== BASE_CHAIN_ID) {
      await switchToBase();
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
    }
    const balance = await provider.getBalance(await signer.getAddress());
    if (balance < BigInt(PLAY_COST_WEI)) throw new Error('Insufficient ETH balance on Base Mainnet');

    showGateStep('step-confirming');

    const tx = await signer.sendTransaction({
      to: TREASURY, value: BigInt(PLAY_COST_WEI)
    });

    const txLink = 'https://basescan.org/tx/' + tx.hash;
    document.getElementById('tx-link').href = txLink;
    document.getElementById('tx-hash-preview').style.display = 'block';

    const receipt = await tx.wait(1);
    if (!receipt || receipt.status === 0) throw new Error('Transaction failed on-chain');

    // Save session
    const session = { txHash: tx.hash, ts: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    updateLastActive();

    document.getElementById('tx-link-final').href = txLink;
    document.getElementById('tx-link-final').textContent = shortTx(tx.hash) + ' → Basescan';
    showGateStep('step-unlocked');
  } catch (e) {
    showGateStep('step-pay');
    btn.disabled = false;
    if (e.code === 4001 || e.code === 'ACTION_REJECTED') {
      showGateError('Transaction rejected by user.');
    } else {
      showGateError(e.message || 'Payment failed');
    }
  }
}

function shortTx(hash) { return hash.slice(0, 10) + '…' + hash.slice(-6); }

function checkExistingSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return false;
  try {
    const s = JSON.parse(raw);
    if (!s.txHash) return false;

    // Check idle time
    const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0');
    if (lastActive > 0 && (Date.now() - lastActive > MAX_IDLE_TIME)) {
      console.log('Session expired due to inactivity');
      clearSession();
      return false;
    }

    // Refresh last active on check
    updateLastActive();
    return true;
  } catch { return false; }
}

function updateLastActive() {
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

function clearSession() { 
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
}

function showPaymentGate() {
  document.getElementById('wallet-gate').classList.add('active');
  document.getElementById('game-container').style.display = 'none';
  showGateStep('step-connect');
}

function startGame() {
  document.getElementById('wallet-gate').classList.remove('active');
  document.getElementById('game-container').style.display = 'block';
  initGame();
}

function retryOrPay() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    // Already paid this session — just retry level
    restartLevel();
    document.getElementById('screen-gameover').style.display = 'none';
  } else {
    showPaymentGate();
  }
}

// On load: check if already paid or debug mode
window.addEventListener('DOMContentLoaded', () => {
  if (checkExistingSession()) {
    showGateStep('step-unlocked');
    document.getElementById('btn-pay') && (document.getElementById('btn-pay').disabled = false);
    const unlocked = document.getElementById('step-unlocked');
    const payBtn = unlocked.querySelector('.btn-play');
    if (payBtn) payBtn.textContent = '🎮 Continue Playing!';
    const txFinal = document.getElementById('tx-link-final');
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY));
      txFinal.href = 'https://basescan.org/tx/' + s.txHash;
      txFinal.textContent = shortTx(s.txHash) + ' → Basescan';
    } catch {}
    showGateStep('step-unlocked');
  }

  // Continuous activity tracking
  setInterval(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) updateLastActive();
  }, 10000); // every 10s

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Re-check session on return
      if (!checkExistingSession() && !document.getElementById('wallet-gate').classList.contains('active')) {
        location.reload(); // Force payment gate if expired while away
      }
    } else {
      updateLastActive();
    }
  });
});
