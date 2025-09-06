document.addEventListener("DOMContentLoaded", () => {

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav ul");

navToggle?.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});


  // --- Placeholder blog injection ---
  const blogContainer = document.getElementById("blog-container");
  if (blogContainer) {
    const demoPosts = [
      {
        title: "Feedback Post",
        desc: "Post where you can give feedback about the whole site.",
        img: "pictures/need-your-feedback-3-v0-7yy67s6tshec1.png",
        link: "posts/feedback-post/"
      },
      {
        title: "Test Post",
        desc: "Test",
        img: "pictures/need-your-feedback-3-v0-7yy67s6tshec1.png",
        link: "posts/test-post/"
      },
    ];

    demoPosts.forEach(post => {
      const card = document.createElement("article");
      card.classList.add("blog-card");
      card.innerHTML = `
        <img src="${post.img}" alt="${post.title}">
        <div class="hamster-border">
          <h3>${post.title}</h3>
          <p>${post.desc}</p>
          <a href="${post.link}" class="link">Read More</a>
        </div>`;
      blogContainer.appendChild(card);
    });
  }

  // --- Learning module ---
  const startBtn = document.getElementById("start-learning");
  const learnIntro = document.getElementById("learn-intro");
  const learnSteps = document.getElementById("learn-steps");
  const learnContent = document.getElementById("learn-content");
  const quizScreen = document.getElementById("learn-quiz");
  const prevBtn = document.getElementById("prev-step");
  const nextBtn = document.getElementById("next-step");

  // Reference each learning step HTML file with .html extension in care/ folder
  const steps = [
    { title: "Habitat", file: "/care/habitat.html" },
    { title: "Diet", file: "/care/diet.html" },
    { title: "Health", file: "/care/health.html" },
    { title: "Playtime", file: "/care/playtime.html" }
  ];

  let currentStep = 0;

  // Load HTML content dynamically
  function showStep(index) {
    const step = steps[index];
    fetch(step.file)
      .then(response => response.text())
      .then(html => {
        learnContent.innerHTML = html;
      })
      .catch(err => {
        learnContent.innerHTML = `<p>Sorry, failed to load content for ${step.title}.</p>`;
        console.error(err);
      });
  }

  startBtn?.addEventListener("click", () => {
    learnIntro.classList.remove("active");
    learnSteps.classList.add("active");
    currentStep = 0;
    showStep(currentStep);
  });

  nextBtn?.addEventListener("click", () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    } else {
      learnSteps.classList.remove("active");
      quizScreen.classList.add("active");
      loadQuiz();
    }
  });

  prevBtn?.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  // Quiz
  function loadQuiz() {
    const quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = `
      <div class="quiz-question">
        <p>1. How much space does a hamster need?</p>
        <label><input type="radio" name="q1" value="wrong"> 1000 cm²</label><br>
        <label><input type="radio" name="q1" value="correct"> 5000 cm² or more</label><br>
        <label><input type="radio" name="q1" value="wrong"> 2000 cm²</label>
      </div>
      <div class="quiz-question">
        <p>2. Which food is best for a hamster?</p>
        <label><input type="radio" name="q2" value="correct"> Balanced seed mix</label><br>
        <label><input type="radio" name="q2" value="wrong"> Only carrots</label><br>
        <label><input type="radio" name="q2" value="wrong"> Bread and cheese</label>
      </div>
    `;
  }

  document.getElementById("submit-quiz")?.addEventListener("click", () => {
    const results = document.getElementById("quiz-results");
    let score = 0;
    const answers = document.querySelectorAll("#quiz-container input:checked");
    answers.forEach(a => {
      if (a.value === "correct") score++;
    });
    results.textContent = `You got ${score} / 2 correct!`;
  });

});

document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("imagePopup");
  const popupImg = document.getElementById("popupImg");

  document.querySelectorAll("img").forEach(img => {
    img.addEventListener("click", () => {
      popup.style.display = "flex";
      popupImg.src = img.src;
    });
  });

  popup.addEventListener("click", () => {
    popup.style.display = "none";
  });
});

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

      const optionText = document.createElement("div");
      optionText.textContent = opt;
      optionText.style.fontWeight = "600";
      optionText.style.marginBottom = "0.2rem";
      wrapper.appendChild(optionText);

      const barContainer = document.createElement("div");
      barContainer.className = "bar-container";

      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.width = pct + "%";

      const label = document.createElement("div");
      label.className = "bar-label";
      label.textContent = `${count} votes (${pct}%)`;

      barContainer.appendChild(bar);
      barContainer.appendChild(label);
      wrapper.appendChild(barContainer);

      optionsContainer.appendChild(wrapper);
    });

    totals.textContent = `Total votes: ${totalVotes}`;
  }

  renderOptions();
}