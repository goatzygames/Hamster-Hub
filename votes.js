import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get, runTransaction } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app, "https://YOUR_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app");

// --- Reusable Upvote/Downvote ---
export function createVote(containerId, voteId) {
  const container = document.getElementById(containerId);
  if (!container) return console.error(`Vote container #${containerId} not found`);

  const votedKey = `voted_${voteId}`;
  let voted = localStorage.getItem(votedKey); // 'up', 'down' or null

  const upBtn = document.createElement('button');
  upBtn.textContent = '▲';
  upBtn.className = 'vote-btn';

  const downBtn = document.createElement('button');
  downBtn.textContent = '▼';
  downBtn.className = 'vote-btn';

  const countDisplay = document.createElement('span');
  countDisplay.className = 'vote-count';
  countDisplay.textContent = '0';

  container.appendChild(upBtn);
  container.appendChild(downBtn);
  container.appendChild(countDisplay);

  async function updateDisplay() {
    const voteRef = ref(db, `votes/${voteId}`);
    const snapshot = await get(voteRef);
    const data = snapshot.val() || { up: 0, down: 0 };
    countDisplay.textContent = data.up - data.down; // net votes
  }

  async function vote(type) {
    if (voted) return; // prevent multiple votes
    const voteRef = ref(db, `votes/${voteId}/${type}`);
    await runTransaction(voteRef, current => (current || 0) + 1);
    localStorage.setItem(votedKey, type);
    voted = type;
    updateDisplay();
  }

  upBtn.onclick = () => vote('up');
  downBtn.onclick = () => vote('down');

  updateDisplay();
}
