'use strict';

// Presentation controls only: no personal documents, uploads or persistent storage.
for (const [id, className] of [['reading', 'reading-mode'], ['contrast', 'high-contrast'], ['simple', 'simple-mode']]) {
  document.getElementById(id).addEventListener('click', (event) => {
    const enabled = document.body.classList.toggle(className);
    event.currentTarget.setAttribute('aria-pressed', String(enabled));
  });
}

const search = document.getElementById('search');
const region = document.getElementById('region');
const sources = [...document.querySelectorAll('.source')];
const normalise = (value) => value.toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
function filterSources() {
  const term = normalise(search.value.trim());
  let count = 0;
  for (const source of sources) {
    const matches = (region.value === 'all' || source.dataset.region === region.value) && normalise(source.textContent).includes(term);
    source.hidden = !matches;
    if (matches) count++;
  }
  document.getElementById('source-count').textContent = `${count} ${count === 1 ? 'Quelle' : 'Quellen'} gefunden`;
  document.getElementById('empty').hidden = count !== 0;
}
search.addEventListener('input', filterSources);
region.addEventListener('change', filterSources);
document.getElementById('source-search').addEventListener('submit', (event) => event.preventDefault());
document.getElementById('source-search').addEventListener('reset', () => {
  requestAnimationFrame(filterSources);
});
filterSources();

const examples = {
  licence: ['Führerschein · Muster', 'Erfundener Beispielnachweis für die Klasse B. Keine reale Person, keine Fahrerlaubnis und kein vorzeigbarer Ausweis.'],
  certificate: ['Teilnahmebescheinigung · Muster', 'Beispiel für die Teilnahme am Workshop „Musik verbindet“. Diese Ansicht bestätigt keine echte Teilnahme.'],
  book: ['Mein digitales Lesebuch · Beispiel', 'Ein guter Weg beginnt mit Rücksicht. Wir hören einander zu. Wir planen unsere Fahrt. Wer fährt, trinkt keinen Alkohol. Gemeinsam kommen wir sicher an.'],
};
const dialog = document.getElementById('document-dialog');
let opener;
for (const button of document.querySelectorAll('[data-doc]')) {
  button.addEventListener('click', () => {
    opener = button;
    const [title, description] = examples[button.dataset.doc];
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-description').textContent = description;
    dialog.showModal();
  });
}
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => opener?.focus());
dialog.addEventListener('click', (event) => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
