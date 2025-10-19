/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import rawVocabData from './vocab.json';


interface RawVocabEntry {
  hanzi: string;
  pinyin: string;
  english: string;
  hsk: string;
}

interface ExampleSentence {
  chinese: string;
  pinyin: string;
  english: string;
}

interface HskDataRow {
  hanza: string;
  pinyin: string;
  english: string;
  hsk: string;
  id: number;
  exampleSentences?: ExampleSentence[];
}


// DOM Elements
const flashcardViewer = document.getElementById('flashcardViewer') as HTMLDivElement;
const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
const hskFilterButtons = document.querySelectorAll('.hsk-filter-button') as NodeListOf<HTMLButtonElement>;
const prevButton = document.getElementById('prevButton') as HTMLButtonElement;
const nextButton = document.getElementById('nextButton') as HTMLButtonElement;
const shuffleButton = document.getElementById('shuffleButton') as HTMLButtonElement;
const cardCounter = document.getElementById('cardCounter') as HTMLSpanElement;
const navigationControls = document.getElementById('navigationControls') as HTMLDivElement;
const themeToggleButton = document.getElementById('themeToggleButton') as HTMLButtonElement;


// State
let allHskData: HskDataRow[] = [];
let currentDeck: HskDataRow[] = [];
let currentIndex = 0;
let isAnimating = false; // Prevent multiple navigations during animation
let touchStartX = 0;
let currentTranslateX = 0;
let isDragging = false;
const swipeThreshold = 50; // Min px distance for a swipe

// Generate example sentences for each entry from the vocabulary data.
const hskData: Omit<HskDataRow, 'id'>[] = (rawVocabData as RawVocabEntry[]).map((entry) => {
  const hanza = entry.hanzi.trim();
  const pinyin = entry.pinyin.trim();
  const english = entry.english.trim();
  const hsk = entry.hsk.trim();

  const exampleSentences: ExampleSentence[] = [
    {
      chinese: `我们在课上学习“${hanza}”这个词。`,
      pinyin: `Wǒmen zài kè shàng xuéxí “${pinyin}” zhège cí.`,
      english: `We are learning the word "${english}" in class.`
    },
    {
      chinese: `老师解释说“${hanza}”表示“${english}”。`,
      pinyin: `Lǎoshī jiěshì shuō “${pinyin}” biǎoshì “${english}”。`,
      english: `The teacher explained that "${hanza}" means "${english}".`
    }
  ];

  return {
    hanza,
    pinyin,
    english,
    hsk,
    exampleSentences
  };
});


/**
 * Uses the browser's SpeechSynthesis API to speak the given text in Chinese.
 * @param text The text to be spoken.
 */
function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; // Specify Chinese (Mandarin, Mainland China)
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Text-to-Speech is not supported in this browser.');
    // Optionally, alert the user that the feature is unavailable.
  }
}


/**
 * Creates and returns a single flashcard HTML element.
 * @param row The data for the flashcard.
 * @returns The HTMLDivElement for the flashcard.
 */
function createFlashcardElement(row: HskDataRow): HTMLDivElement {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('flashcard');
  cardDiv.dataset['index'] = row.id.toString();

  const cardInner = document.createElement('div');
  cardInner.classList.add('flashcard-inner');

  // --- FRONT OF CARD ---
  const cardFront = document.createElement('div');
  cardFront.classList.add('flashcard-front');

  const termDiv = document.createElement('div');
  termDiv.classList.add('term');
  
  const hanzaSpan = document.createElement('span');
  hanzaSpan.classList.add('hanza-text');
  hanzaSpan.textContent = row.hanza;
  termDiv.appendChild(hanzaSpan);

  if (row.hsk) {
      const hskSpan = document.createElement('span');
      hskSpan.classList.add('hsk-level-text');
      hskSpan.textContent = `(${row.hsk})`;
      termDiv.appendChild(hskSpan);
  }

  cardFront.appendChild(termDiv);

  // --- BACK OF CARD ---
  const cardBack = document.createElement('div');
  cardBack.classList.add('flashcard-back');

  // Definition Section
  const definitionDiv = document.createElement('div');
  definitionDiv.classList.add('definition');
  const pinyinText = row.pinyin ? `[${row.pinyin}]` : '';
  const backText = `${pinyinText}\n${row.english}`.trim();
  definitionDiv.textContent = backText;

  // Example Sentences Section
  const examplesContainer = document.createElement('div');
  examplesContainer.classList.add('examples-container');

  const examplesTitle = document.createElement('h3');
  examplesTitle.classList.add('examples-title');
  examplesTitle.textContent = 'Example Sentences';
  
  const examplesList = document.createElement('ul');
  examplesList.classList.add('examples-list');

  examplesContainer.appendChild(examplesTitle);
  examplesContainer.appendChild(examplesList);

  const sentences = row.exampleSentences || [];
  if (sentences.length > 0) {
      sentences.forEach(sentence => {
          const li = document.createElement('li');
          li.classList.add('example-sentence');

          const chineseSpan = document.createElement('span');
          chineseSpan.classList.add('sentence-chinese');
          chineseSpan.textContent = sentence.chinese;

          const pinyinSpan = document.createElement('span');
          pinyinSpan.classList.add('sentence-pinyin');
          pinyinSpan.textContent = sentence.pinyin;

          const englishSpan = document.createElement('span');
          englishSpan.classList.add('sentence-english');
          englishSpan.textContent = sentence.english;
          
          li.appendChild(chineseSpan);
          li.appendChild(pinyinSpan);
          li.appendChild(englishSpan);
          examplesList.appendChild(li);
      });
  } else {
      const noExamples = document.createElement('li');
      noExamples.textContent = 'No examples available.';
      noExamples.classList.add('no-examples');
      examplesList.appendChild(noExamples);
  }


  // Audio Button
  const audioButton = document.createElement('button');
  audioButton.classList.add('audio-button');
  audioButton.setAttribute('aria-label', 'Play pronunciation');
  audioButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  audioButton.addEventListener('click', (event) => {
    event.stopPropagation();
    speak(row.hanza);
  });
  
  // Assemble Back
  cardBack.appendChild(definitionDiv);
  cardBack.appendChild(examplesContainer);
  cardBack.appendChild(audioButton);

  // --- ASSEMBLE CARD ---
  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  cardDiv.appendChild(cardInner);

  // Add click listener to toggle the 'flipped' class
  cardDiv.addEventListener('click', () => {
    if (!isDragging) {
      cardDiv.classList.toggle('flipped');
    }
  });

  return cardDiv;
}

/**
 * Displays the current flashcard based on the currentIndex.
 */
function renderCurrentCard() {
  flashcardViewer.innerHTML = '';
  errorMessage.textContent = '';
  isAnimating = false; // Reset animation lock

  if (currentDeck.length === 0) {
    navigationControls.style.visibility = 'hidden';
    // Check if any filter is active before showing the message
    const hasActiveFilter = Array.from(hskFilterButtons).some(btn => btn.getAttribute('aria-checked') === 'true');
    if (hasActiveFilter) {
      errorMessage.textContent = 'No matching entries found for the selected HSK level(s).';
    } else {
      errorMessage.textContent = 'Select an HSK level to begin.';
    }
    return;
  }
  
  navigationControls.style.visibility = 'visible';

  const row = currentDeck[currentIndex];
  const cardElement = createFlashcardElement(row);
  flashcardViewer.appendChild(cardElement);

  // Update counter
  cardCounter.textContent = `${currentIndex + 1} / ${currentDeck.length}`;

  // Update button states
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === currentDeck.length - 1;
  shuffleButton.disabled = currentDeck.length <= 1;
}

/**
 * Shuffles the current deck of flashcards and displays the first card.
 */
function shuffleDeck() {
  // Fisher-Yates shuffle algorithm
  for (let i = currentDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
  }
  currentIndex = 0;
  renderCurrentCard();
}

/**
 * Filters the main data set based on selected HSK levels and renders the first card.
 */
function updateDeckAndRender() {
  const selectedLevels = Array.from(hskFilterButtons)
    .filter(btn => btn.getAttribute('aria-checked') === 'true')
    .map(btn => btn.dataset.hskLevel);

  currentDeck = selectedLevels.length === 0
    ? allHskData
    : allHskData.filter(row => selectedLevels.includes(row.hsk));

  currentIndex = 0;
  renderCurrentCard();
}

/**
 * Handles the logic for animating and changing cards for both buttons and swipes.
 * @param direction 'next' or 'prev'
 */
function changeCard(direction: 'next' | 'prev') {
  if (isAnimating) return; // Prevent multiple navigations

  const canGoNext = currentIndex < currentDeck.length - 1;
  const canGoPrev = currentIndex > 0;
  
  if ((direction === 'next' && !canGoNext) || (direction === 'prev' && !canGoPrev)) {
    return;
  }

  isAnimating = true;
  const card = flashcardViewer.querySelector('.flashcard');
  const cardInner = flashcardViewer.querySelector('.flashcard-inner') as HTMLElement;

  if (!card || !cardInner) {
    isAnimating = false;
    return;
  }
  
  const isFlipped = card.classList.contains('flipped');
  // Set CSS variable for rotation, used by the animation keyframes
  cardInner.style.setProperty('--start-rotate', isFlipped ? '180deg' : '0deg');

  const animationClass = direction === 'next' ? 'is-exiting-left' : 'is-exiting-right';
  cardInner.classList.add(animationClass);

  cardInner.addEventListener('animationend', () => {
    if (direction === 'next') {
      currentIndex++;
    } else {
      currentIndex--;
    }
    renderCurrentCard(); // Creates a fresh card, resetting animations
  }, { once: true });
}


// --- Theme Management ---
/**
 * Applies the selected theme and saves it to localStorage.
 * @param theme The theme to apply ('light' or 'dark').
 */
function setTheme(theme: 'light' | 'dark') {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark-mode', isDark);
  localStorage.setItem('theme', theme);
  themeToggleButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
}

/**
 * Initializes the theme based on user preference or system settings.
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || savedTheme === 'light') {
    setTheme(savedTheme);
  } else {
    setTheme(prefersDark ? 'dark' : 'light');
  }
}

// --- Event Listeners ---

// Theme toggle
themeToggleButton.addEventListener('click', () => {
  const isDarkMode = document.documentElement.classList.contains('dark-mode');
  setTheme(isDarkMode ? 'light' : 'dark');
});


// HSK filter buttons
hskFilterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const isChecked = button.getAttribute('aria-checked') === 'true';
    button.setAttribute('aria-checked', isChecked ? 'false' : 'true');
    updateDeckAndRender();
  });
});

// Navigation
prevButton.addEventListener('click', () => changeCard('prev'));
nextButton.addEventListener('click', () => changeCard('next'));
shuffleButton.addEventListener('click', shuffleDeck);

// Swipe Gesture Logic
flashcardViewer.addEventListener('touchstart', (e) => {
  if (isAnimating || currentDeck.length === 0) return;
  const target = e.target as HTMLElement;
  if (!target.closest('.flashcard-inner')) return;

  isDragging = true;
  touchStartX = e.touches[0].clientX;
  currentTranslateX = 0;

  const cardInner = flashcardViewer.querySelector('.flashcard-inner');
  if (cardInner) {
    cardInner.classList.add('is-dragging');
  }
}, { passive: true });

flashcardViewer.addEventListener('touchmove', (e) => {
  if (!isDragging) return;

  const currentX = e.touches[0].clientX;
  currentTranslateX = currentX - touchStartX;
  const card = flashcardViewer.querySelector('.flashcard');
  const cardInner = flashcardViewer.querySelector('.flashcard-inner') as HTMLElement;
  
  if (card && cardInner) {
    const isFlipped = card.classList.contains('flipped');
    const rotateValue = isFlipped ? 180 : 0;
    // Move card with finger, preserving flip state
    cardInner.style.transform = `translateX(${currentTranslateX}px) rotateY(${rotateValue}deg)`;
  }
}, { passive: true });

flashcardViewer.addEventListener('touchend', () => {
  if (!isDragging) return;

  isDragging = false;
  const cardInner = flashcardViewer.querySelector('.flashcard-inner') as HTMLElement;
  if (!cardInner) return;

  cardInner.classList.remove('is-dragging');
  // Clear inline transform to allow CSS transitions/animations to take over
  cardInner.style.transform = ''; 

  if (Math.abs(currentTranslateX) > swipeThreshold) {
    // Successful swipe
    if (currentTranslateX < 0) {
      changeCard('next'); // Swipe left
    } else {
      changeCard('prev'); // Swipe right
    }
  }
  // If not a successful swipe, the card snaps back automatically
  // because the inline transform is removed and the default CSS takes over.
});

// Initial setup when the script loads
function main() {
  initializeTheme();
  // Process the raw data into the structured format with unique IDs
  allHskData = hskData.map((row, index) => ({
      ...row,
      id: index
  }));
  // Initially, no deck is loaded until a user selects a filter.
  currentDeck = [];
  renderCurrentCard();
}

main();
