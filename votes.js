import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get, runTransaction } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCb9A2wqpcg8K3gJmNg7F1hPqInp2910u8",
  authDomain: "hamster-hub-1.firebaseapp.com",
  projectId: "hamster-hub-1",
  storageBucket: "hamster-hub-1.appspot.com",
  messagingSenderId: "833563548088",
  appId: "1:833563548088:web:bca8dc2a69b4de5d49d74d"
};

// Initialize Firebase (prevent duplicate)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app, "https://hamster-hub-1-default-rtdb.europe-west1.firebasedatabase.app");

export function createVote(containerId, voteId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const upBtn = container.querySelector('#upvote');
  const downBtn = container.querySelector('#downvote');
  const voteCount = container.querySelector('#vote-count');

  const votedKey = `voted_${voteId}`;
  let voted = localStorage.getItem(votedKey); // 'up', 'down', or null

  async function updateCount() {
    const snap = await get(ref(db, `votes/${voteId}/score`));
    const score = snap.val() || 0;
    voteCount.textContent = score;

    // update arrow colors
    upBtn.classList.toggle('active-up', voted === 'up');
    downBtn.classList.toggle('active-down', voted === 'down');
  }

  async function vote(type) {
    const scoreRef = ref(db, `votes/${voteId}/score`);

    let delta = 0;

    if (!voted) {
      // first vote
      delta = type === 'up' ? 1 : -1;
      voted = type;
      localStorage.setItem(votedKey, type);
    } else if (voted === type) {
      // unvote
      delta = type === 'up' ? -1 : 1;
      voted = null;
      localStorage.removeItem(votedKey);
    } else {
      // switch vote
      delta = type === 'up' ? 2 : -2; // from -1→+1 or +1→-1
      voted = type;
      localStorage.setItem(votedKey, type);
    }

    await runTransaction(scoreRef, current => (current || 0) + delta);

    updateCount();
  }

  upBtn.onclick = () => vote('up');
  downBtn.onclick = () => vote('down');

  updateCount(); // initial
}
