# Règles d'organisation — Portfolio Lucas Fouquet

## Structure des fichiers

```
Portfolio/
├── index.html          ← page principale uniquement
├── space.js            ← moteur partagé (NE PAS dupliquer)
├── photo.jpg           ← photo de profil
├── assets/
│   ├── audio/          ← tous les fichiers .mp3 / .ogg / .wav
│   ├── img/            ← toutes les images (.jpg, .png, .webp, .svg décoratifs)
│   └── fonts/          ← polices locales uniquement si pas disponibles en CDN
└── projects/           ← une page HTML par projet, rien d'autre
```

## Règles par type de fichier

### HTML
- `index.html` → racine uniquement
- Pages projet → `projects/<nom-du-projet>.html` (kebab-case, tout en minuscules)
- Pas de sous-dossiers dans `projects/`

### JavaScript
- `space.js` → racine (partagé via `<script src="../space.js">` depuis les projets)
- Si un script est spécifique à une seule page, l'inliner dans le `<script>` de cette page
- Pas de fichiers JS séparés par page (sauf si > 200 lignes)

### Audio
- Tous les fichiers audio → `assets/audio/`
- Référence depuis `index.html` : `assets/audio/fichier.mp3`
- Référence depuis `projects/` : `../assets/audio/fichier.mp3`

### Images
- Captures d'écran projets → `assets/img/<nom-projet>-*.png`
- Photo de profil → racine (`photo.jpg`) — chemin attendu par le CSS existant
- Icônes SVG inline dans le HTML (pas de fichiers SVG séparés sauf si > 1 KB)

### CSS
- Styles dans `<style>` inline dans chaque fichier HTML (pas de fichier .css externe)
- Les variables CSS globales sont définies sur `:root` en tête de `<style>`

## Nommage

| Type | Convention | Exemple |
|------|-----------|---------|
| Fichiers HTML projet | kebab-case | `accidents-report.html` |
| Fichiers audio | kebab-case descriptif | `ambient-music.mp3` |
| Fichiers image | `<projet>-<description>` | `synapse-demo.png` |
| Variables JS | camelCase | `camTarget`, `galPts` |
| Constantes JS | SCREAMING_SNAKE | `GAL_PTS`, `IS_PROJECT` |
| IDs HTML | kebab-case | `#tx-content`, `#panel-close` |
| Classes HTML | kebab-case | `.preview-area`, `.nav-back` |

## Règles de code

- **Zéro dépendance externe** : pas de npm, pas de CDN, pas d'imports
- **Zéro framework** : vanilla JS uniquement
- **CSS inline** dans chaque HTML — pas de fichier `.css` externe
- `space.js` est partagé tel quel, ne pas le modifier pour un projet spécifique
- Les textes bilingues utilisent `data-fr` / `data-en` sur les éléments DOM
- Les textes canvas utilisent l'objet `L` : `L.fr.texte` / `L.en.texte`

## Fichiers à ne pas committer

```gitignore
# OS
.DS_Store
Thumbs.db

# Éditeurs
.vscode/settings.json
*.swp

# Temporaires
*.tmp
*.bak
```

## Checklist ajout d'un nouveau projet

1. Créer `projects/<nom>.html` en copiant la structure d'une page existante
2. Vérifier que `<script src="../space.js">` est présent
3. Ajouter les captures d'écran dans `assets/img/`
4. Référencer la planète dans `index.html` (tableau des objets célestes)
5. Ajouter l'entrée dans le tableau "Pages projet" du README.md
