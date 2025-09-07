import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get, runTransaction } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCb9A2wqpcg8K3gJmNg7F1hPqInp2910u8",
  authDomain: "hamster-hub-1.firebaseapp.com",
  projectId: "hamster-hub-1",
  storageBucket: "hamster-hub-1.firebasedatabase.app",
  messagingSenderId: "833563548088",
  appId: "1:833563548088:web:bca8dc2a69b4de5d49d74d"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app, "https://hamster-hub-1-default-rtdb.europe-west1.firebasedatabase.app");

export function createVote(containerId, voteId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const upBtn = container.querySelector('#upvote');
  const downBtn = container.querySelector('#downvote');
  const upCount = container.querySelector('#upvote-count');
  const downCount = container.querySelector('#downvote-count');

  const votedKey = `voted_${voteId}`;
  let voted = localStorage.getItem(votedKey); // 'up', 'down', or null

  async function updateCounts() {
    const snap = await get(ref(db, `votes/${voteId}`));
    const data = snap.val() || { up: 0, down: 0 };
    upCount.textContent = data.up;
    downCount.textContent = data.down;
  }

  async function vote(type) {
    const opposite = type === 'up' ? 'down' : 'up';

    // If changing vote
    if (voted && voted !== type) {
      // decrement previous
      const prevRef = ref(db, `votes/${voteId}/${voted}`);
      await runTransaction(prevRef, current => (current || 1) - 1);

      // increment new
      const newRef = ref(db, `votes/${voteId}/${type}`);
      await runTransaction(newRef, current => (current || 0) + 1);

      voted = type;
      localStorage.setItem(votedKey, type);

    } else if (!voted) {
      // first vote
      const voteRef = ref(db, `votes/${voteId}/${type}`);
      await runTransaction(voteRef, current => (current || 0) + 1);
      voted = type;
      localStorage.setItem(votedKey, type);
    }

    updateCounts();
  }

  upBtn.onclick = () => vote('up');
  downBtn.onclick = () => vote('down');

  updateCounts();
}
