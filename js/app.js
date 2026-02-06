// ===========================================
// GÉNÉRATEUR DE HEADLINE LINKEDIN PÉTÉE
// Frontend Logic — Skaale 2025
// ===========================================

// State
const state = {
  formData: {},
  profileData: null,
  currentHeadline: null,
  translations: []
};

// DOM Elements
const pages = {
  home: document.getElementById('page-home'),
  form: document.getElementById('page-form'),
  interview: document.getElementById('page-interview'),
  result: document.getElementById('page-result'),
  offers: document.getElementById('page-offers')
};

// Homepage elements
const btnStart = document.getElementById('btn-start');
const btnBackHome = document.getElementById('btn-back-home');
const taglineText = document.getElementById('tagline-text');

const form = document.getElementById('headline-form');
const linkedinInput = document.getElementById('linkedin');
const linkedinWrapper = document.getElementById('linkedin-wrapper');
const linkedinIcon = document.getElementById('linkedin-icon');
const linkedinError = document.getElementById('linkedin-error');
const submitBtn = document.getElementById('submit-btn');

// Interview elements
const typingIndicator = document.getElementById('typing-indicator');
const questionText = document.getElementById('question-text');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// Result elements
const profileBanner = document.getElementById('profile-banner');
const profilePhoto = document.getElementById('profile-photo');
const profileName = document.getElementById('profile-name');
const profileHeadline = document.getElementById('profile-headline');
const profileLocation = document.getElementById('profile-location');
const translationsContainer = document.getElementById('translations');
const btnCopy = document.getElementById('btn-copy');
const btnNext = document.getElementById('btn-next');

// Modal elements
const errorModal = document.getElementById('error-modal');
const errorTitle = document.getElementById('error-title');
const errorSubtitle = document.getElementById('error-subtitle');
const btnRetry = document.getElementById('btn-retry');
const btnModalClose = document.getElementById('btn-modal-close');

// ===========================================
// INTERVIEW QUESTIONS
// ===========================================

const introMessages = [
  "Connexion au serveur LinkedIn...",
  "Profil de {prenom} détecté ✓",
  "Initialisation de l'interview..."
];

const interviewQuestions = [
  "Sur une échelle de 1 à Elon Musk, à quel point es-tu disruptif ?",
  "Combien de fois par jour tu dis 'synergie' ?",
  "Est-ce que tu mets des émojis 🚀 dans tes emails pro ?",
  "Tu as déjà parlé de ton 'Why' à un inconnu dans un ascenseur ?",
  "Ton profil mentionne 'passionné' combien de fois ?",
  "Tu préfères 'CEO de ma vie' ou 'Entrepreneur de mon destin' ?",
  "Quel est ton ratio posts LinkedIn / douches par semaine ?",
  "Tu as déjà commencé une phrase par 'Je suis ravi d'annoncer...' ?",
  "Combien de groupes LinkedIn 'Entrepreneurs' tu as rejoint ?",
  "Tu mets 'Open to Work' même quand t'es pas open to work ?"
];

const finalMessages = [
  "Calcul du taux de bullshit optimal...",
  "Détection des buzzwords en cours...",
  "Niveau de cringe calibré à 87%...",
  "Injection de passion et de mindset...",
  "Ajout d'émojis stratégiques 🚀🙏💡...",
  "Préparation de ta headline de rêve...",
  "C'est prêt !"
];

// ===========================================
// ERROR MESSAGES
// ===========================================

const errorMessages = {
  400: {
    title: "Hé {prenom}, ce lien LinkedIn a l'air bizarre 🤔",
    subtitle: "Vérifie que c'est bien le bon format !"
  },
  404: {
    title: "Hé {prenom}, ton profil est carrément en train de casser notre outil là !! 😱",
    subtitle: "On dirait que ce profil n'existe pas ou est privé."
  },
  429: {
    title: "Wow {prenom}, on a trop de demandes là ! 🔥",
    subtitle: "Attends quelques secondes et réessaie."
  },
  500: {
    title: "Oups {prenom}, notre serveur fait des siennes 🤖",
    subtitle: "C'est pas toi, c'est nous. Réessaie !"
  },
  name_mismatch: {
    title: "Dis donc {prenom}, tu veux rigoler mais tu ne mets pas tes vraies informations ?? 👀",
    subtitle: "Le prénom ou nom ne correspond pas au profil LinkedIn."
  },
  default: {
    title: "Mince {prenom}, petite erreur sur la récupération de tes infos 😅",
    subtitle: "Tu veux bien relancer ?"
  }
};

// ===========================================
// HOMEPAGE TAGLINES
// ===========================================

const fakeHeadlines = [
  "CEO de ma vie 🚀 | Papa de 3 startups et 2 échecs 💀",
  "Ex-timide devenu mass-posteur LinkedIn | Mon Why ? Ton feed 🙏",
  "J'ai quitté mon CDI pour poster des citations sur LinkedIn ✨",
  "Serial entrepreneur (de side projects jamais finis) 🔥",
  "Je scale ton mindset pendant que tu scroll 💡",
  "TOP VOICE auto-proclamé | 47 abonnés mais je vise les 1M 🎯",
  "Passionné par l'humain (surtout ceux qui likent mes posts) ❤️",
  "Ex-salarié devenu libre (de revenus aussi) ☀️",
  "J'accompagne les gens à devenir la meilleure version de moi-même 🙏",
  "Disrupteur de machine à café | Visionnaire de l'open space 🚀",
  "Papa de 2 merveilles + 1 side project qui pivote 💡",
  "Mon Why ? J'ai vu une vidéo TED une fois ✨",
  "Growth Hacker (j'ai installé Google Analytics) 📈",
  "Je transforme les réunions en emails (et inversement) 🔄",
  "Entrepreneur de mon destin | Freelance de ma galère 💪",
];

let taglineAnimationRunning = true;

async function animateTaglines() {
  let index = 0;

  while (taglineAnimationRunning) {
    const headline = fakeHeadlines[index];

    // Clear current text
    taglineText.textContent = '';

    // Type the headline
    for (let i = 0; i < headline.length; i++) {
      if (!taglineAnimationRunning) break;
      taglineText.textContent += headline.charAt(i);
      await sleep(40);
    }

    // Wait before erasing
    await sleep(2000);

    // Erase the headline
    for (let i = headline.length; i > 0; i--) {
      if (!taglineAnimationRunning) break;
      taglineText.textContent = headline.substring(0, i - 1);
      await sleep(25);
    }

    // Small pause before next
    await sleep(300);

    // Next headline
    index = (index + 1) % fakeHeadlines.length;
  }
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_]/g, " ")
    .trim();
}

function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const editDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

function fuzzyMatch(input, scraped) {
  const inputNorm = normalizeString(input);
  const scrapedNorm = normalizeString(scraped);

  // Exact match
  if (inputNorm === scrapedNorm) return true;

  // Contains match
  if (scrapedNorm.includes(inputNorm) || inputNorm.includes(scrapedNorm)) return true;

  // First word match (for compound names)
  const inputFirst = inputNorm.split(" ")[0];
  const scrapedFirst = scrapedNorm.split(" ")[0];
  if (inputFirst === scrapedFirst && inputFirst.length > 2) return true;

  // Similarity check
  return similarity(inputNorm, scrapedNorm) > 0.6;
}

function isValidLinkedInUrl(url) {
  const pattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
  return pattern.test(url);
}

function showPage(pageId) {
  Object.values(pages).forEach(page => page.classList.remove('active'));
  pages[pageId].classList.add('active');
  window.scrollTo(0, 0);
}

function showError(code, prenom = 'toi') {
  const error = errorMessages[code] || errorMessages.default;
  errorTitle.textContent = error.title.replace('{prenom}', prenom);
  errorSubtitle.textContent = error.subtitle;
  errorModal.classList.add('active');
}

function hideError() {
  errorModal.classList.remove('active');
}

// ===========================================
// FORM VALIDATION
// ===========================================

linkedinInput.addEventListener('input', () => {
  const value = linkedinInput.value.trim();

  if (!value) {
    linkedinWrapper.classList.remove('valid', 'invalid');
    linkedinIcon.textContent = '';
    linkedinError.textContent = '';
    return;
  }

  if (isValidLinkedInUrl(value)) {
    linkedinWrapper.classList.add('valid');
    linkedinWrapper.classList.remove('invalid');
    linkedinInput.classList.add('valid');
    linkedinInput.classList.remove('invalid');
    linkedinIcon.textContent = '✓';
    linkedinError.textContent = '';
  } else {
    linkedinWrapper.classList.add('invalid');
    linkedinWrapper.classList.remove('valid');
    linkedinInput.classList.add('invalid');
    linkedinInput.classList.remove('valid');
    linkedinIcon.textContent = '✗';
    linkedinError.textContent = "Dis donc, ça ressemble pas à un lien LinkedIn ça 👀";
  }
});

// ===========================================
// TYPEWRITER EFFECT
// ===========================================

async function typeWriter(element, text, speed = 30) {
  element.textContent = '';
  for (let i = 0; i < text.length; i++) {
    element.textContent += text.charAt(i);
    await sleep(speed);
  }
}

// ===========================================
// INTERVIEW SEQUENCE
// ===========================================

async function runInterviewSequence(prenom) {
  let progress = 0;
  const startTime = Date.now();
  const minDuration = 5000; // Minimum 5 seconds

  // Progress bar animation (faster)
  const progressInterval = setInterval(() => {
    if (progress < 95) {
      progress += Math.random() * 4;
      progressFill.style.width = `${Math.min(progress, 95)}%`;
    }
  }, 80);

  // Phase 1: Intro (faster)
  for (const msg of introMessages) {
    typingIndicator.classList.remove('hidden');
    await sleep(400);
    typingIndicator.classList.add('hidden');
    await typeWriter(questionText, msg.replace('{prenom}', prenom), 20);
    await sleep(800);
  }

  // Phase 2: Questions (pick 3 only)
  const shuffled = [...interviewQuestions].sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffled.slice(0, 3);

  for (const question of selectedQuestions) {
    typingIndicator.classList.remove('hidden');
    await sleep(500);
    typingIndicator.classList.add('hidden');
    await typeWriter(questionText, question, 20);
    await sleep(1500);

    // Random glitch easter egg (10% chance)
    if (Math.random() < 0.1) {
      questionText.classList.add('glitch');
      await sleep(200);
      questionText.classList.remove('glitch');
    }
  }

  // Phase 3: Final messages (fewer, faster)
  progressText.textContent = 'Finalisation...';

  for (const msg of finalMessages.slice(0, 3)) {
    typingIndicator.classList.remove('hidden');
    await sleep(300);
    typingIndicator.classList.add('hidden');
    await typeWriter(questionText, msg, 15);
    await sleep(600);
  }

  // Ensure minimum duration
  const elapsed = Date.now() - startTime;
  if (elapsed < minDuration) {
    await sleep(minDuration - elapsed);
  }

  // Complete progress
  clearInterval(progressInterval);
  progressFill.style.width = '100%';

  // Final message
  typingIndicator.classList.add('hidden');
  await typeWriter(questionText, finalMessages[finalMessages.length - 1], 30);
  await sleep(800);
}

// ===========================================
// API CALLS
// ===========================================

async function scrapeLinkedIn(linkedinUrl) {
  const response = await fetch('/api/scrape-linkedin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linkedinUrl })
  });

  const data = await response.json();

  if (!response.ok) {
    throw { code: response.status, data };
  }

  return data;
}

async function generateHeadline(profileData, formData, level) {
  const response = await fetch('/api/generate-headline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileData,
      formData,
      level
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw { code: response.status, data };
  }

  return data;
}

// ===========================================
// DISPLAY RESULT
// ===========================================

function displayResult() {
  const { profileData, currentHeadline, translations } = state;
  const { prenom, nom } = state.formData;

  // Profile card
  profileName.textContent = `${prenom} ${nom}`;
  profileHeadline.textContent = currentHeadline;

  if (profileData?.photoUrl) {
    profilePhoto.src = profileData.photoUrl;
    profilePhoto.alt = `${prenom} ${nom}`;
  } else {
    // Default avatar
    profilePhoto.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(prenom + ' ' + nom)}&background=f7883e&color=fff&size=160`;
  }

  if (profileData?.backgroundUrl) {
    profileBanner.style.backgroundImage = `url(${profileData.backgroundUrl})`;
  }

  if (profileData?.location) {
    const loc = profileData.location;
    profileLocation.textContent = `📍 ${loc.city || ''}${loc.city && loc.country ? ', ' : ''}${loc.country || ''}`;
  } else {
    profileLocation.textContent = '';
  }

  // Translations
  translationsContainer.innerHTML = translations.map(t => `
    <div class="translation-item">
      <span class="translation-element">"${t.element}"</span>
      <span class="translation-meaning">→ ${t.traduction}</span>
    </div>
  `).join('');

  showPage('result');
}

// ===========================================
// EVENT HANDLERS
// ===========================================

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate LinkedIn URL
  const linkedinUrl = linkedinInput.value.trim();
  if (!isValidLinkedInUrl(linkedinUrl)) {
    linkedinError.textContent = "Dis donc, ça ressemble pas à un lien LinkedIn ça 👀";
    return;
  }

  // Collect form data
  state.formData = {
    prenom: document.getElementById('prenom').value.trim(),
    nom: document.getElementById('nom').value.trim(),
    metier: document.getElementById('metier').value.trim(),
    linkedin: linkedinUrl,
    passion: document.getElementById('passion').value.trim(),
    trucPasAssume: document.getElementById('truc-pas-assume').value.trim(),
    fierte: document.getElementById('fierte').value.trim(),
    buzzword: document.getElementById('buzzword').value.trim(),
    situation: document.getElementById('situation').value.trim()
  };

  // Disable button
  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Analyse en cours...';

  // Show interview page
  showPage('interview');

  try {
    // Start interview animation and API calls in parallel
    const [_, scrapedData] = await Promise.all([
      runInterviewSequence(state.formData.prenom),
      scrapeLinkedIn(linkedinUrl)
    ]);

    // Validate name match
    const person = scrapedData.person;
    const firstNameMatch = fuzzyMatch(state.formData.prenom, person.firstName || '');
    const lastNameMatch = fuzzyMatch(state.formData.nom, person.lastName || '');

    if (!firstNameMatch || !lastNameMatch) {
      throw { code: 'name_mismatch' };
    }

    // Store profile data
    state.profileData = {
      firstName: person.firstName,
      lastName: person.lastName,
      headline: person.headline,
      photoUrl: person.photoUrl,
      backgroundUrl: person.backgroundUrl,
      location: person.location,
      followerCount: person.followerCount,
      currentPosition: person.positions?.positionHistory?.[0]
    };

    // Generate headline (max cringe level 5)
    const headlineResult = await generateHeadline(
      state.profileData,
      state.formData,
      5
    );

    state.currentHeadline = headlineResult.headline;
    state.translations = headlineResult.traductions || [];

    // Display result
    displayResult();

  } catch (error) {
    console.error('Error:', error);
    showError(error.code || 'default', state.formData.prenom);
  } finally {
    // Reset button
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Générer ma headline de rêve';
  }
});

// Retry button
btnRetry.addEventListener('click', () => {
  hideError();
  showPage('form');
});

// Copy headline
btnCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(state.currentHeadline);
    btnCopy.querySelector('span').textContent = 'Copié ! ✓';
    btnCopy.classList.add('copied');

    setTimeout(() => {
      btnCopy.querySelector('span').textContent = 'Copier ma headline';
      btnCopy.classList.remove('copied');
    }, 2000);
  } catch (error) {
    console.error('Copy failed:', error);
  }
});

// Next button
btnNext.addEventListener('click', () => {
  showPage('offers');
});

// Close modal on click outside
errorModal.addEventListener('click', (e) => {
  if (e.target === errorModal) {
    hideError();
    showPage('form');
  }
});

// Close modal button
btnModalClose.addEventListener('click', () => {
  hideError();
  showPage('form');
});

// ===========================================
// HOMEPAGE NAVIGATION
// ===========================================

// Start button -> go to form
btnStart.addEventListener('click', () => {
  taglineAnimationRunning = false;
  showPage('form');
});

// Back button -> go to home
btnBackHome.addEventListener('click', () => {
  showPage('home');
  taglineAnimationRunning = true;
  animateTaglines();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  typingIndicator.classList.add('hidden');

  // Start tagline animation on homepage
  if (pages.home.classList.contains('active')) {
    animateTaglines();
  }
});
