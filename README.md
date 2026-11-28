# Portfolio — Lucas Fouquet

Portfolio personnel interactif à thème spatial, développé entièrement en HTML/CSS/JavaScript vanilla (zéro dépendance, zéro framework).

---

## Architecture générale

```
Portfolio/
├── index.html                  # Page principale + moteur univers interactif
├── space.js                    # Moteur fond étoilé (partagé toutes les pages)
├── photo.jpg                   # Photo de profil (à fournir manuellement)
├── CLAUDE.md                   # Règles d'organisation du projet
├── assets/
│   ├── audio/
│   │   ├── StarboyV2.mp3       # Musique d'ambiance
│   │   └── among-us-eject-sound-effect.mp3  # Son easter egg
│   ├── downloads/
│   │   └── paris-sportifs.xlsx # Fichier téléchargeable Paris Sportifs
│   ├── img/                    # Captures d'écran projets
│   └── fonts/                  # Polices locales (si nécessaire)
└── projects/
    ├── discogs.html
    ├── synapse.html
    ├── accidents.html
    ├── accidents-report.html
    ├── olist.html
    └── together.html
```

---

## Système à deux canvas

La page principale utilise **deux canvas superposés** :

| Canvas | z-index | pointer-events | Rôle |
|--------|---------|----------------|------|
| `#starfield` | 0 | none | Fond étoilé animé (`space.js`) |
| `#universe` | 1 | all | Univers interactif + caméra |

`space.js` lit `window.SPACE_CAM` (écrit par le moteur univers chaque frame) pour appliquer un effet de parallaxe au fond.

Sur les **pages projet**, `space.js` détecte l'absence de `#universe` via `IS_PROJECT = !document.getElementById('universe')` et gère lui-même la caméra + le soleil.

---

## Moteur univers (index.html)

### Caméra

```js
let cam  = { x, y, zoom };  // état courant (interpolé)
let camT = { x, y, zoom };  // cible
// lerp chaque frame : cam += (camT - cam) * 0.065
```

- Drag : déplace `cam` directement + inertie (`vel * 11`) au relâchement
- `didDrag` : booléen empêchant un clic de se déclencher après un drag
- `window.SPACE_CAM` : partagé avec `space.js` pour parallaxe (facteur x 0.1)

### Objets célestes

| Objet | Type | Position monde | Interaction |
|-------|------|----------------|-------------|
| Étoile centrale | Soleil | (0, 0) | Décoratif |
| Galaxie spirale | ~3200 pts pré-générés, rotation continue | (292, -172) | Clic → zoom → vue projets |
| Amas globulaire | ~820 pts pré-générés | (-280, -160) | Clic → zoom → vue compétences |
| Pulsar | Neutron star + anneaux pulsants + jets polaires | (-248, 225) | Clic → transmission À Propos / Contact |
| Planète secrète | Sphère verte cachée hors champ | (-590, -440) | Hover → révèle ??? / Clic → easter egg |

### Géométrie pré-générée (IIFE au chargement)

- `GAL_PTS` : 440 étoiles de cœur (chaudes/froides) + 2 bras spiraux x 1380 étoiles jeunes bleues
- `CL_PTS` : 820 étoiles, distribution sphérique aplatie, teinte bleu-blanc

Chaque point : `{ lx, ly, sz, al, cr:[r,g,b] }`. Coordonnées en espace local (centrées sur 0,0), appliquées à l'écran via la matrice caméra.

### Rendu sphères (drawSphere)

`createRadialGradient` offset (highlight) + overlay limb-darkening radial noir → aspect 3D réaliste sans WebGL.

### Pulsar

Tableau `PRINGS` de rings actifs. Chaque frame : spawn si `t - lastPulse > 1100 ms`, filtrage des rings dont `age >= 1`, dessin avec `opacity = (1 - age) * 0.3` et rayon `age^0.68 * 82`.

---

## Vues et navigation

```
'home'      → vue globale, tous les corps visibles, orbites en pointillés
'projects'  → zoom sur la galaxie, 5 planètes en orbite elliptique (perspective x0.55)
'skills'    → zoom sur l'amas, 7 étoiles nommées avec scintillement
```

Les planètes sont triées back-to-front par `sin(angle) * oR * 0.55` (Y écran) à chaque frame.

---

## Overlays UI

### Transmission (#transmission)
Typewriter monospace sur fond `rgba(2,2,14,.96)`. Utilisé pour :
- **À Propos / Contact** : bio + coordonnées + liens cliquables (email, LinkedIn, GitHub)
- **Easter egg** : message crypté en vert

### Intro (#intro)
Overlay z-index 300, bloque toute interaction au chargement. Typewriter de bienvenue, bouton `[ COMMENCER LA MISSION ]` apparaît après la fin de la frappe.

---

## Curseur rocket

Défini en CSS via `--rocket-cur` (data URI SVG inline encodé). Appliqué à `html, body` et `#universe`. Le SVG représente une fusée rotée à 45° : corps blanc, flamme orange, hublot bleu.

---

## Easter egg

Planète verte cachée à la position monde `(-590, -440)`, bien hors du champ de vision initial. Aucun label affiché tant qu'on ne survole pas l'objet. Clic → transmission verte "ZONE INTERDITE".

Pour la trouver : naviguer vers le coin supérieur gauche de l'espace.

---

## Pages projet

Chaque page projet (`projects/*.html`) est une page HTML autonome avec :
- `<script src="../space.js">` pour le fond étoilé
- Un layout en deux colonnes (hero + détails)
- Une section `.preview-area` pour captures d'écran

| ID | Titre | Stack |
|----|-------|-------|
| discogs | Discogs Scraper | Python · Scraping |
| synapse | Synapse | RAG · LangChain |
| accidents | Accidents de la Route | Python · Plotly |
| accidents-report | Rapport Accidents | Data Analysis |
| olist | Analyse Olist | Tableau · Data Viz |
| paris-sportifs | Paris Sportifs | Excel · Analyse Sportive |
| together | Together | Next.js · Supabase |
| hackathon-mirakl | Hackathon Mirakl | React · Supabase · IA |
| hackathon-twiin | Hackathon Twiin (Build The Future, vainqueur) | Agents IA · n8n · Holo |

---

## Internationalisation

`lang = 'fr' | 'en'` — basculement via bouton EN/FR. Les textes canvas lisent `L[lang]`, les éléments DOM utilisent `data-fr` / `data-en` lus par `applyLang(root)`.

---

## Audio

| Fichier | Usage |
|---------|-------|
| `assets/audio/StarboyV2.mp3` | Musique d'ambiance (lecture auto en boucle) |
| `assets/audio/among-us-eject-sound-effect.mp3` | Son déclenché par l'easter egg |

---

## Dépendances

Aucune. Vanilla HTML/CSS/JS, compatible tous navigateurs modernes.
