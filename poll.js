import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get, runTransaction } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyCb9A2wqpcg8K3gJmNg7F1hPqInp2910u8",
  authDomain: "hamster-hub-1.firebaseapp.com",
  projectId: "hamster-hub-1",
  storageBucket: "hamster-hub-1.firebasestorage.app",
  messagingSenderId: "833563548088",
  appId: "1:833563548088:web:bca8dc2a69b4de5d49d74d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app, "https://hamster-hub-1-default-rtdb.europe-west1.firebasedatabase.app");

// --- Reusable Poll Function ---
export function createPoll({ containerId, pollId, question, options }) {
  const container = document.getElementById(containerId);
  if (!container) return console.error(`Poll container #${containerId} not found`);

  container.innerHTML = "";

  const votedKey = `voted_${pollId}`;
  let voted = localStorage.getItem(votedKey);

  const title = document.createElement("h2");
  title.textContent = question;
  container.appendChild(title);

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "options-container";
  container.appendChild(optionsContainer);

  const totals = document.createElement("h3");
  totals.id = `totals-${pollId}`;
  container.appendChild(totals);

  function renderOptions() {
    optionsContainer.innerHTML = "";
    if (voted) {
      renderResults();
      return;
    }

    options.forEach(opt => {
      const card = document.createElement("div");
      card.className = "option-card";
      card.textContent = opt;
      card.onclick = () => vote(opt);
      optionsContainer.appendChild(card);
    });
  }

  async function vote(option) {
    const voteRef = ref(db, `polls/${pollId}/${option}`);
    await runTransaction(voteRef, current => (current || 0) + 1);
    localStorage.setItem(votedKey, option);
    voted = option;
    renderResults();
  }

async function renderResults() {
  const pollRef = ref(db, `polls/${pollId}`);
  const snapshot = await get(pollRef);
  const data = snapshot.val() || {};
  const totalVotes = Object.values(data).reduce((a, b) => a + b, 0);

  optionsContainer.innerHTML = "";

  options.forEach(opt => {
    const count = data[opt] || 0;
    const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.marginBottom = "1rem";

    // Option label (e.g. "Unreal Engine 5")
    const optionText = document.createElement("div");
    optionText.textContent = opt;
    optionText.style.fontWeight = "600";
    optionText.style.marginBottom = "0.2rem";
    wrapper.appendChild(optionText);

    // Horizontal container: bar + percentage
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "0.6rem";

    // Progress bar container
    const barContainer = document.createElement("div");
    barContainer.className = "bar-container";
    barContainer.style.flex = "1"; // make bar expand

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = pct + "%";

    // Label inside bar = vote count only
    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = count; // just number of votes

    barContainer.appendChild(bar);
    barContainer.appendChild(label);

    // Percentage text outside the bar
    const pctText = document.createElement("div");
    pctText.textContent = `${pct}%`;
    pctText.style.minWidth = "40px";
    pctText.style.fontWeight = "600";

    row.appendChild(barContainer);
    row.appendChild(pctText);

    wrapper.appendChild(row);
    optionsContainer.appendChild(wrapper);
  });

  totals.textContent = `Total votes: ${totalVotes}`;
}

  renderOptions();
}