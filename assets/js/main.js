const data = window.PROJECT_DATA;

const galleryState = {
  visible: 12
};

function createVideo(src, autoplay = true) {
  const video = document.createElement("video");
  video.dataset.src = src;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.controls = true;
  video.preload = "none";
  video.dataset.autoplay = autoplay ? "true" : "false";
  return video;
}

function createCard(item, options = {}) {
  const card = document.createElement("article");
  card.className = "video-card" + (options.featured ? " featured" : "");

  const label = document.createElement("div");
  label.className = "video-label";

  const labelText = document.createElement("span");
  labelText.textContent = options.label || item.label || "Video";
  label.appendChild(labelText);

  const frame = document.createElement("div");
  frame.className = "video-frame";
  frame.appendChild(createVideo(item.src, options.autoplay !== false));

  card.appendChild(label);
  card.appendChild(frame);

  const titleText = options.title || item.title;
  if (titleText) {
    const title = document.createElement("p");
    title.className = "card-title";
    title.textContent = titleText;
    card.appendChild(title);
  }

  return card;
}

function renderComparison() {
  const root = document.getElementById("comparison-root");
  root.textContent = "";

  data.comparison.forEach((row) => {
    const section = document.createElement("article");
    section.className = "comparison-row";

    const header = document.createElement("div");
    header.className = "row-header";

    const prompt = document.createElement("p");
    prompt.className = "row-title";
    prompt.textContent = row.prompt;

    header.appendChild(prompt);
    section.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "comparison-grid";
    row.videos.forEach((video) => {
      grid.appendChild(createCard(video, {
        label: video.label,
        featured: video.accent === "ours",
        autoplay: true
      }));
    });

    section.appendChild(grid);
    root.appendChild(section);
  });
}

function renderGallery() {
  const root = document.getElementById("gallery-root");
  const loadMore = document.getElementById("load-more");
  const items = data.more || [];
  const visibleItems = items.slice(0, galleryState.visible);

  root.textContent = "";
  visibleItems.forEach((item) => {
    root.appendChild(createCard(item, {
      label: "One-Forcing",
      title: item.title,
      autoplay: true
    }));
  });

  loadMore.hidden = visibleItems.length >= items.length;
  setupLazyVideos(root.querySelectorAll("video[data-src]"));
}

function setupGalleryControls() {
  document.getElementById("load-more").addEventListener("click", () => {
    galleryState.visible = (data.more || []).length;
    renderGallery();
  });
}

function setupLazyVideos(videoNodes) {
  const videos = Array.from(videoNodes || document.querySelectorAll("video[data-src]"));
  const loadVideo = (video) => {
    if (!video.src) {
      video.src = video.dataset.src;
      video.load();
    }
  };

  if (!("IntersectionObserver" in window)) {
    videos.forEach(loadVideo);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        loadVideo(video);
        if (video.dataset.autoplay === "true") {
          video.play().catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, { rootMargin: "420px 0px", threshold: 0.02 });

  videos.forEach((video) => observer.observe(video));
}

renderComparison();
setupGalleryControls();
renderGallery();
setupLazyVideos();
