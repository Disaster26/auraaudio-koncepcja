# Aura Audio Polska - podgląd strony głównej

Statyczna strona: HTML + CSS + JavaScript, bez WordPressa i bez bazy danych.

| Plik / folder | Co zawiera |
|---|---|
| `index.html` | treść strony; każda sekcja zaczyna się komentarzem `SEKCJA: ...`, style w bloku `<style>` z nagłówkami |
| `js/main.js` | menu na telefonie, galeria filmów, przeciąganie kart, formularz, mapa |
| `dane/filmy.json` | lista filmów YouTube / Vimeo - dopisanie bloku = nowy film na stronie |
| `img/` | zdjęcia WebP, `img/filmy/` miniatury filmów |
| `fonts/` | czcionki Barlow trzymane lokalnie |

Nowy produkt: w `index.html` skopiuj blok `<article class="karta"> ... </article>` w wybranej grupie i zmień treść.

Docelowo formularz wysyła wiadomość prostym skryptem `wyslij.php` na hostingu home.pl.
Podgląd jest ukryty przed wyszukiwarkami (`noindex`, `robots.txt`).
