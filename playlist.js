document.addEventListener("DOMContentLoaded", function () {
  const audio = new Audio();
  let currentTrackIndex = -1;
  let isPlaying = false;
  let isShuffle = false;
  let isRepeat = false;
  let playlist = [];

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  function updatePlaylistStats(tracks) {
    const duration = tracks.reduce((sum, track) => sum + track.duration, 0);
    const totalMinutes = Math.ceil(duration / 60);
    document.querySelector(
      ".playlist-stats .stat span"
    ).textContent = `${totalMinutes} minutes`;
    document.querySelectorAll(
      ".playlist-stats .stat span"
    )[1].textContent = `${(Math.random() * 5 + 1).toFixed(1)}k likes`;
  }

  function playTrack(index) {
    const track = playlist[index];
    if (!track) return;

    const trackItems = document.querySelectorAll(".track-item");
    trackItems.forEach((item) => item.classList.remove("active"));
    trackItems[index].classList.add("active");

    const songTitle = document.querySelector(".song-title");
    const songTime = document.querySelector(".song-time");
    const playButton = document.querySelector(".play-button");

    audio.src = `Audio/${track.track}`;
    audio.play();
    isPlaying = true;
    currentTrackIndex = index;
    songTitle.textContent = track.track.replace(".mp3", "").replace(/_/g, " ");
    playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';

    audio.addEventListener("loadedmetadata", () => {
      const total = formatDuration(audio.duration);
      songTime.textContent = `0:00 / ${total}`;
    });

    audio.ontimeupdate = () => {
      const current = formatDuration(audio.currentTime);
      const total = formatDuration(audio.duration);
      songTime.textContent = `${current} / ${total}`;

      const percent = (audio.currentTime / audio.duration) * 100;
      document.querySelector(".progress").style.width = `${percent}%`;
    };

    audio.onended = () => {
      if (isRepeat) {
        playTrack(currentTrackIndex);
      } else {
        playNext();
      }
    };
  }

  function playNext() {
    if (isShuffle) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentTrackIndex);
      playTrack(nextIndex);
    } else {
      const next = (currentTrackIndex + 1) % playlist.length;
      playTrack(next);
    }
  }

  function playPrevious() {
    const prev = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    playTrack(prev);
  }

  // Handle page load
  if (window.location.pathname.includes("playlistpage.html")) {
    const mood = localStorage.getItem("selectedMood");
    const genre = localStorage.getItem("selectedGenre");
    const tempo = localStorage.getItem("selectedTempo");
    const era = localStorage.getItem("selectedEra");

    const subtitle = document.getElementById("mood-subtitle");
    const title = document.getElementById("playlist-title");
    const description = document.getElementById("playlist-description");
    const image = document.getElementById("hero-image");

    subtitle.textContent = `Based on your ${mood} mood`;
    title.textContent = `${mood} Boost`;
    description.textContent = `High-tempo tracks to match your ${mood.toLowerCase()} vibe`;
    image.src = `Css/Images/${mood.toLowerCase()}.jpg`;
    image.alt = `${mood} Playlist`;

    let filteredTracks = tracks.filter(
      (track) => track.mood.toLowerCase() === mood.toLowerCase()
    );
    if (genre !== "Any" && genre)
      filteredTracks = filteredTracks.filter((t) => t.genre === genre);
    if (tempo !== "Any" && tempo)
      filteredTracks = filteredTracks.filter((t) => t.tempo === tempo);
    if (era !== "Any" && era)
      filteredTracks = filteredTracks.filter((t) => t.era === era);

    const trackList = document.querySelector(".tracks-list");
    trackList.innerHTML = "";

    let loadedCount = 0;
    playlist = filteredTracks;

    filteredTracks.forEach((track, index) => {
      // Create base track div
      const trackDiv = document.createElement("div");
      trackDiv.classList.add("track-item");
      trackDiv.innerHTML = `
        <div class="track-number">${index + 1}</div>
        <div class="track-title">${track.track
          .replace(".mp3", "")
          .replace(/_/g, " ")}</div>
        <div class="track-artist">${track.artist}</div>
        <div class="track-album">${track.album}</div>
        <div class="track-duration">Loading...</div>
        <div class="track-actions">
          <button class="track-action-btn"><i class="fa-solid fa-ellipsis"></i></button>
        </div>
      `;
      trackList.appendChild(trackDiv);

      // Load audio duration separately
      const tempAudio = new Audio(`Audio/${track.track}`);
      tempAudio.addEventListener("loadedmetadata", () => {
        track.duration = tempAudio.duration;
        const duration = formatDuration(tempAudio.duration);
        trackDiv.querySelector(".track-duration").textContent = duration;

        loadedCount++;
        if (loadedCount === filteredTracks.length) {
          // All durations loaded
          updatePlaylistStats(playlist);
          setupPlayButtonToggle(".play-button");
          setupControlButtons();
          setupTrackSelection();
          setupProgressBar();
          setupVolumeSlider();
          setupTrackActionButtons();
        }
      });
    });
  }

  function setupPlayButtonToggle(buttonSelector) {
    const playButton = document.querySelector(buttonSelector);
    if (!playButton) return;

    playButton.addEventListener("click", function () {
      if (!audio.src && playlist.length > 0) {
        playTrack(0);
      } else {
        isPlaying = !isPlaying;
        if (isPlaying) {
          audio.play();
          playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
          audio.pause();
          playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
      }
    });
  }

  function setupControlButtons() {
    document
      .querySelector(".fa-shuffle")
      ?.parentElement.addEventListener("click", () => {
        isShuffle = !isShuffle;
        alert("Shuffle: " + (isShuffle ? "On" : "Off"));
      });

    document
      .querySelector(".fa-repeat")
      ?.parentElement.addEventListener("click", () => {
        isRepeat = !isRepeat;
        alert("Repeat: " + (isRepeat ? "On" : "Off"));
      });

    document
      .querySelector(".fa-forward-step")
      ?.parentElement.addEventListener("click", playNext);
    document
      .querySelector(".fa-backward-step")
      ?.parentElement.addEventListener("click", playPrevious);
  }

  function setupTrackSelection() {
    const trackItems = document.querySelectorAll(".track-item");
    trackItems.forEach((trackEl, index) => {
      trackEl.addEventListener("click", function (e) {
        if (e.target.closest(".track-action-btn")) return;
        playTrack(index);
      });
    });
  }

  function setupVolumeSlider() {
    const volumeSlider = document.querySelector(".volume-slider");
    if (!volumeSlider) return;

    volumeSlider.addEventListener("input", function () {
      audio.volume = this.value / 100;
    });
  }

  function setupProgressBar() {
    const progressBar = document.querySelector(".progress-bar");
    const progress = document.querySelector(".progress");
    if (!progressBar || !progress) return;

    progressBar.addEventListener("click", function (e) {
      if (!audio.duration) return;
      const rect = this.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      audio.currentTime = percentage * audio.duration;
    });
  }

  function setupTrackActionButtons() {
    const trackActionBtns = document.querySelectorAll(".track-action-btn");
    if (!trackActionBtns.length) return;

    trackActionBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const trackTitle =
          this.closest(".track-item")?.querySelector(".track-title")
            ?.textContent || "Unknown";
        alert(`Options for "${trackTitle}": Add to playlist, Download, Share`);
      });
    });
  }

  // Add click handling for mood cards on the same page
  document.querySelectorAll(".recommendation-card").forEach((card) => {
    card.addEventListener("click", function () {
      const newMood =
        this.querySelector(".recommendation-title")?.textContent || "Unknown";

      // Save mood to localStorage
      localStorage.setItem("selectedMood", newMood);

      // Reload the page to re-trigger playlist rendering
      window.location.reload();
    });
  });
});
