/* =====================================================================
   AURA AUDIO POLSKA - skrypt strony
   Bez bibliotek i bez frameworków. Każda funkcja odpowiada za jedną rzecz
   i jest uruchamiana na dole pliku. Gdy jakiegoś elementu nie ma na
   podstronie, funkcja po prostu nic nie robi.
   ===================================================================== */

/* ---------- 1. Menu na telefonie ---------- */
function menuTelefon() {
  const przycisk = document.querySelector('.burger');
  const menu = document.getElementById('menu');
  if (!przycisk || !menu) return;

  function ustaw(otwarte) {
    menu.classList.toggle('otwarte', otwarte);
    przycisk.setAttribute('aria-expanded', String(otwarte));
    przycisk.setAttribute('aria-label', otwarte ? 'Zamknij menu' : 'Otwórz menu');
  }
  przycisk.addEventListener('click', () => ustaw(!menu.classList.contains('otwarte')));
  // kliknięcie w link zamyka menu
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) ustaw(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') ustaw(false); });
}

/* ---------- 2. Filmy: fasada (miniatura + odtwórz) ----------
   Prawdziwy odtwarzacz YouTube/Vimeo wstawiamy dopiero po kliknięciu.
   Dzięki temu strona nie ładuje kilkunastu odtwarzaczy na starcie. */
function adresOdtwarzacza(platforma, id) {
  if (platforma === 'vimeo') return 'https://player.vimeo.com/video/' + id + '?autoplay=1&dnt=1';
  return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
}

function wlaczFilm(przycisk) {
  const iframe = document.createElement('iframe');
  iframe.src = adresOdtwarzacza(przycisk.dataset.platforma, przycisk.dataset.id);
  iframe.title = przycisk.getAttribute('aria-label') || 'Film';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  przycisk.replaceChildren(iframe);
  przycisk.removeAttribute('aria-label');
  przycisk.style.cursor = 'default';
}

function fasadyFilmow() {
  document.addEventListener('click', (e) => {
    const przycisk = e.target.closest('button.film');
    if (przycisk && !przycisk.querySelector('iframe')) wlaczFilm(przycisk);
  });
}

/* ---------- 3. Galeria filmów z pliku dane/filmy.json ---------- */
// tyle filmów widać od razu: 4 na telefonie, 8 na komputerze
const FILMY_NA_START = window.matchMedia('(max-width: 599px)').matches ? 4 : 8;

function miniatura(film) {
  if (film.miniatura) return film.miniatura;
  // brak własnej miniatury -> bierzemy ją prosto z YouTube
  return 'https://i.ytimg.com/vi/' + film.id + '/hqdefault.jpg';
}

function kartaFilmu(film, indeks) {
  const karta = document.createElement('article');
  karta.className = 'film-karta';
  if (indeks >= FILMY_NA_START) karta.hidden = true;

  const przycisk = document.createElement('button');
  przycisk.type = 'button';
  przycisk.className = 'film';
  przycisk.dataset.platforma = film.platforma;
  przycisk.dataset.id = film.id;
  przycisk.setAttribute('aria-label', 'Odtwórz film: ' + film.tytul);

  const img = document.createElement('img');
  img.src = miniatura(film);
  img.width = 640; img.height = 360;
  img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
  const play = document.createElement('span');
  play.className = 'film-play';
  przycisk.append(img, play);

  const tytul = document.createElement('h3');
  tytul.textContent = film.tytul;
  const autor = document.createElement('p');
  autor.textContent = film.autor + (film.jezyk ? ' - ' + film.jezyk : '');

  karta.append(przycisk, tytul, autor);
  return karta;
}

async function galeriaFilmow() {
  const lista = document.getElementById('filmy-lista');
  if (!lista) return;
  try {
    const odp = await fetch('dane/filmy.json');
    const dane = await odp.json();
    dane.filmy.forEach((film, i) => lista.append(kartaFilmu(film, i)));

    const wiecej = document.getElementById('filmy-wiecej');
    const ukryte = dane.filmy.length - FILMY_NA_START;
    if (wiecej && ukryte > 0) {
      wiecej.textContent = 'Pokaż wszystkie filmy (' + dane.filmy.length + ')';
      wiecej.hidden = false;
      wiecej.addEventListener('click', () => {
        lista.querySelectorAll('.film-karta[hidden]').forEach((k) => { k.hidden = false; });
        wiecej.hidden = true;
      });
    }
  } catch (blad) {
    lista.innerHTML = '<p>Filmy są na kanale <a href="https://www.youtube.com/@AuraAudioOfficial/">Aura Audio na YouTube</a>.</p>';
  }
}

/* ---------- 4. Rzędy kart przesuwane myszą ----------
   Palcem działa to samo przez przewijanie w poziomie (CSS scroll-snap),
   a tu dokładamy przeciąganie myszą na komputerze. */
function przeciaganieMysza() {
  document.querySelectorAll('.rzad').forEach((rzad) => {
    let start = 0, przewiniecie = 0, wcisniety = false, przesunieto = false;
    rzad.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      wcisniety = true; przesunieto = false;
      start = e.clientX; przewiniecie = rzad.scrollLeft;
    });
    rzad.addEventListener('pointermove', (e) => {
      if (!wcisniety) return;
      const dx = e.clientX - start;
      if (Math.abs(dx) > 5) { przesunieto = true; rzad.classList.add('ciagniety'); }
      rzad.scrollLeft = przewiniecie - dx;
    });
    const koniec = () => { wcisniety = false; rzad.classList.remove('ciagniety'); };
    rzad.addEventListener('pointerup', koniec);
    rzad.addEventListener('pointerleave', koniec);
    // po przeciągnięciu nie traktujemy puszczenia przycisku jak kliknięcia w link
    rzad.addEventListener('click', (e) => { if (przesunieto) { e.preventDefault(); przesunieto = false; } }, true);
  });
}

/* ---------- 5. "Zapytaj o ..." wpisuje produkt do formularza ---------- */
function pytaniaOProdukt() {
  const pole = document.getElementById('f-wiadomosc');
  if (!pole) return;
  document.querySelectorAll('[data-pytanie]').forEach((link) => {
    link.addEventListener('click', () => {
      pole.value = 'Interesuje mnie: ' + link.dataset.pytanie + '. ';
    });
  });
}

/* ---------- 6. Formularz ----------
   W podglądzie tylko pokazujemy komunikat. Docelowo: fetch('wyslij.php', ...)
   - prosty skrypt PHP na serwerze home.pl wysyła maila na info@auraaudio.pl. */
function formularz() {
  const f = document.getElementById('formularz');
  if (!f) return;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('formularz-info').hidden = false;
  });
}

/* ---------- 7. Mapa Google wczytywana dopiero przy przewinięciu ---------- */
function mapaPrzyPrzewinieciu() {
  const mapa = document.getElementById('mapa');
  if (!mapa || !('IntersectionObserver' in window)) return;
  const obserwator = new IntersectionObserver((wpisy) => {
    if (!wpisy[0].isIntersecting) return;
    const iframe = document.createElement('iframe');
    iframe.src = mapa.dataset.src;
    iframe.title = 'Mapa dojazdu: ul. Perłowa 14, Łęgowo';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    mapa.replaceChildren(iframe);
    obserwator.disconnect();
  }, { rootMargin: '200px' });
  obserwator.observe(mapa);
}

/* ---------- 8. Bieżący rok w stopce ---------- */
function rokWStopce() {
  const rok = document.getElementById('rok');
  if (rok) rok.textContent = new Date().getFullYear();
}

/* ---------- Start ---------- */
menuTelefon();
fasadyFilmow();
galeriaFilmow();
przeciaganieMysza();
pytaniaOProdukt();
formularz();
mapaPrzyPrzewinieciu();
rokWStopce();
