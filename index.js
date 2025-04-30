document.addEventListener("DOMContentLoaded", function () {
  // Menu toggle for both pages
  function setupSidePanel(menuSelector, panelSelector, closeSelector) {
    const menuTrigger = document.querySelector(".menu-trigger");
    console.log(menuTrigger); // Should output the button element or null if not found
    const menu = document.querySelector(menuSelector);
    const panel = document.querySelector(panelSelector);
    const closeBtn = document.querySelector(closeSelector);
    console.log(menu, panel, closeBtn);

    if (menu && panel && closeBtn) {
      menu.addEventListener("click", () => panel.classList.add("active"));
      closeBtn.addEventListener("click", () =>
        panel.classList.remove("active")
      );

      document.addEventListener("click", (event) => {
        if (
          panel.classList.contains("active") &&
          !panel.contains(event.target) &&
          !menu.contains(event.target)
        ) {
          panel.classList.remove("active");
        }
      });
    }
  }

  // Advanced options toggle
  function setupAdvancedOptions() {
    const advancedToggle = document.getElementById("advanced-toggle");
    const advancedOptions = document.getElementById("advanced-options");
    const advancedIcon = document.getElementById("advanced-icon");

    if (advancedToggle && advancedOptions && advancedIcon) {
      advancedToggle.addEventListener("click", function () {
        advancedOptions.classList.toggle("active");
        if (advancedOptions.classList.contains("active")) {
          advancedIcon.classList.replace("fa-chevron-down", "fa-chevron-up");

          // ⬇️ Set up genre, tempo, era only when advanced options are shown
          setupFilterSelections();
        } else {
          advancedIcon.classList.replace("fa-chevron-up", "fa-chevron-down");
        }
      });
    }
  }

  function setupFilterSelections() {
    const genreSelect = document.getElementById("genre");
    const tempoSelect = document.getElementById("tempo");
    const eraSelect = document.getElementById("era");

    if (!genreSelect || !tempoSelect || !eraSelect) {
      console.warn("Filter selects not found yet.");
      return;
    }

    // Restore previously selected options for genre, tempo, and era
    genreSelect.value = localStorage.getItem("selectedGenre") || "";
    tempoSelect.value = localStorage.getItem("selectedTempo") || "";
    eraSelect.value = localStorage.getItem("selectedEra") || "";

    genreSelect.addEventListener("change", function () {
      localStorage.setItem("selectedGenre", this.value);
    });

    tempoSelect.addEventListener("change", function () {
      localStorage.setItem("selectedTempo", this.value);
    });

    eraSelect.addEventListener("change", function () {
      localStorage.setItem("selectedEra", this.value);
    });
  }

  let selectedMood = localStorage.getItem("selectedMood") || null;

  function setupMoodSelection() {
    const moodCards = document.querySelectorAll(".mood-card");
    const generateBtnCards = document.getElementById("generate-btn-cards");

    // Restore previous mood selection
    if (selectedMood) {
      moodCards.forEach((card) => {
        if (card.getAttribute("data-mood") === selectedMood) {
          card.classList.add("selected");
          // Enable the button if mood is selected
        }
      });
    }

    moodCards.forEach((card) => {
      card.addEventListener("click", function () {
        moodCards.forEach((c) => c.classList.remove("selected"));
        this.classList.add("selected");

        selectedMood = this.getAttribute("data-mood");

        generateBtnCards.disabled = false;

        localStorage.setItem("selectedMood", selectedMood);

        // ✅ Update moodHistory
        let moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];

        // Remove if it already exists to avoid duplicates
        moodHistory = moodHistory.filter((m) => m !== selectedMood);

        // Add the new one at the beginning
        moodHistory.unshift(selectedMood);

        // Keep only the last 5
        moodHistory = moodHistory.slice(0, 5);

        localStorage.setItem("moodHistory", JSON.stringify(moodHistory));
      });
    });
  }

  // Playlist generation functionality
  function setupGeneratePlaylistButtons() {
    const generateBtnCards = document.getElementById("generate-btn-cards");
    const generateBtnText = document.getElementById("generate-btn-text");

    // Get the genre, tempo, and era elements within this function
    const genreSelect = document.getElementById("genre");
    const tempoSelect = document.getElementById("tempo");
    const eraSelect = document.getElementById("era");

    generateBtnCards.addEventListener("click", function () {
      if (!selectedMood) {
        alert("Please select a mood before generating a playlist.");
        return;
      }

      console.log(`Generating playlist for mood: ${selectedMood}`);

      // Save the selected mood and filters to localStorage
      localStorage.setItem("selectedMood", selectedMood); // save selected mood
      localStorage.setItem("selectedGenre", genreSelect.value); // save selected genre
      localStorage.setItem("selectedTempo", tempoSelect.value); // save selected tempo
      localStorage.setItem("selectedEra", eraSelect.value); // save selected era

      // Redirect to the playlist page
      window.location.href = "playlistpage.html"; // ✅ redirect to playlist page
    });

    generateBtnText.addEventListener("click", function () {
      const description = document.getElementById("mood-textarea").value;
      console.log(`Generating playlist based on description: ${description}`);

      // Optionally, save the description to localStorage if you want to use it on the playlist page
      localStorage.setItem("selectedDescription", description);
    });
  }

  // Tab switching functionality
  function setupTabSwitching() {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const tabId = this.getAttribute("data-tab");

        tabButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        tabContents.forEach((content) => content.classList.remove("active"));
        document.getElementById(tabId).classList.add("active");
      });
    });
  }

  const moodKeywords = {
    angry: [
      "angry",
      "furious",
      "mad",
      "irritated",
      "annoyed",
      "rage",
      "nostalgic",
    ],
    energetic: ["energetic", "hype", "lively", "active", "pumped", "excited"],
    focused: ["focused", "concentrated", "productive", "studying", "deep work"],
    happy: ["happy", "joyful", "cheerful", "smiling", "elated", "good vibes"],
    melancholic: ["melancholic", "sad", "blue", "down", "moody", "emotional"],
    peaceful: [
      "peaceful",
      "calm",
      "serene",
      "still",
      "quiet",
      "soothing",
      "dreamy",
    ],
    relaxed: ["relaxed", "chill", "laid-back", "easygoing", "comfy", "mellow"],
    romantic: [
      "romantic",
      "in love",
      "flirty",
      "crushing",
      "valentine",
      "sweet",
    ],
  };

  function setupMoodDescription() {
    const moodTextarea = document.getElementById("mood-textarea");
    const generateBtnText = document.getElementById("generate-btn-text");
    const suggestionTags = document.querySelectorAll(".suggestion-tag");

    let detectedMood = null;

    function detectMoodFromInput(text) {
      const lowerText = text.toLowerCase();
      for (const [mood, keywords] of Object.entries(moodKeywords)) {
        for (const keyword of keywords) {
          if (lowerText.includes(keyword)) {
            return mood;
          }
        }
      }
      return null;
    }

    moodTextarea.addEventListener("input", function () {
      detectedMood = detectMoodFromInput(this.value);
      generateBtnText.disabled = false;
    });

    suggestionTags.forEach((tag) => {
      tag.addEventListener("click", function () {
        const tagText = this.textContent;
        moodTextarea.value += (moodTextarea.value ? " " : "") + tagText;
        moodTextarea.focus();

        detectedMood = detectMoodFromInput(moodTextarea.value);
        generateBtnText.disabled = !detectedMood;
      });
    });

    // When the button is clicked, store the detected mood
    generateBtnText.addEventListener("click", function () {
      if (detectedMood) {
        localStorage.setItem("selectedMood", detectedMood);
        window.location.href = "playlistpage.html";
      }
    });
  }

  // Surprise me button
  function setupSurpriseButton() {
    const surpriseBtn = document.getElementById("surprise-btn");

    surpriseBtn.addEventListener("click", function () {
      console.log("Generating surprise playlist");
      alert("Generating a surprise playlist for you!");
    });
  }

  function setupMoodHistoryPanel() {
    const panel = document.getElementById("mood-history-panel");
    const list = document.getElementById("mood-history-list");
    const historyBtn = document.getElementById("history-btn");
    const clearBtn = document.getElementById("clear-history");

    historyBtn.addEventListener("click", function () {
      panel.classList.toggle("active"); // Show/hide expandable
      renderMoodHistory(); // Always refresh when toggled
    });

    clearBtn.addEventListener("click", function () {
      localStorage.removeItem("moodHistory");
      renderMoodHistory(); // Refresh UI
    });

    function renderMoodHistory() {
      const moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];
      list.innerHTML = ""; // Clear existing

      if (moodHistory.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No mood history yet.";
        list.appendChild(li);
        return;
      }

      moodHistory.forEach((mood) => {
        const li = document.createElement("li");
        li.className = "mood-history-item";
        li.textContent = mood;

        li.addEventListener("click", () => {
          localStorage.setItem("selectedMood", mood);
          window.location.href = "playlistpage.html";
        });

        list.appendChild(li);
      });
    }
  }

  function setupMoodSelectionClicks() {
    // Today's Featured Moods
    document
      .querySelectorAll(".playlist-card .playlist-listen")
      .forEach((btn) => {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          const card = btn.closest(".playlist-card");
          const mood =
            card.querySelector("img")?.alt?.replace(" Playlist", "") ||
            "Unknown";

          localStorage.setItem("selectedMood", mood);
          localStorage.setItem("selectedGenre", "Any");
          localStorage.setItem("selectedTempo", "Any");
          localStorage.setItem("selectedEra", "Any");

          window.location.href = "playlistpage.html";
        });
      });
  }

  function setupSearchMoodRedirect() {
    const searchInput = document.getElementById("search-input");

    if (!searchInput) return;

    searchInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        const mood = searchInput.value.trim().toLowerCase();

        const validMoods = [
          "angry",
          "energetic",
          "focused",
          "happy",
          "melancholic",
          "peaceful",
          "relaxed",
          "romantic",
        ];

        if (validMoods.includes(mood)) {
          localStorage.setItem("selectedMood", mood);
          localStorage.setItem("selectedGenre", "Any");
          localStorage.setItem("selectedTempo", "Any");
          localStorage.setItem("selectedEra", "Any");

          window.location.href = "playlistpage.html";
        } else {
          alert("Please enter a valid mood (e.g., happy, relaxed, focused).");
        }
      }
    });
  }

  // Initialize functionalities only if their required elements exist
  setupSidePanel(".menu-icon", ".side-panel", ".close-button");
  setupSidePanel(".menu-trigger", ".side-panel", ".close-button");

  if (document.getElementById("advanced-toggle")) {
    setupAdvancedOptions();
  }

  if (document.querySelector(".tab-button")) {
    setupTabSwitching();
  }

  if (document.getElementById("mood-textarea")) {
    setupMoodDescription();
  }

  setupMoodSelection();

  if (
    document.getElementById("generate-btn-cards") ||
    document.getElementById("generate-btn-text")
  ) {
    setupGeneratePlaylistButtons();
  }

  if (document.getElementById("surprise-btn")) {
    setupSurpriseButton();
  }

  if (window.location.pathname.includes("mood-selection.html")) {
    setupMoodHistoryPanel();
    // Add more code here specific to mood-selection.html
  }

  setupMoodSelectionClicks();
  setupSearchMoodRedirect(); // 👈 Call this inside DOMContentLoaded
});
