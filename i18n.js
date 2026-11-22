/**
 * I18N — traduction FR/EN des pages projet.
 * Chaque page contient un dictionnaire : <script type="application/json" id="i18n-en">{"texte FR": "EN text"}</script>
 * Les clés sont les textes FR tels qu'affichés (espaces normalisés) : nœuds texte, alt, title, placeholder, aria-label, <title>.
 * La langue est partagée avec index.html via localStorage('portfolioLang').
 * Inclus par : <script src="../i18n.js" defer></script>
 */
(function () {
  var KEY = 'portfolioLang';
  var ATTRS = ['alt', 'title', 'placeholder', 'aria-label'];
  var dict = {};
  var textNodes = [];   // [{ node, fr, en, pre, post }]
  var attrItems = [];   // [{ el, attr, fr, en }]
  var titleFr = document.title;
  var current = 'fr';

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function getLang() { try { return localStorage.getItem(KEY) === 'en' ? 'en' : 'fr'; } catch (e) { return 'fr'; } }
  function setLang(l) { try { localStorage.setItem(KEY, l); } catch (e) {} }

  function collect() {
    var src = document.getElementById('i18n-en');
    if (src) { try { dict = JSON.parse(src.textContent); } catch (e) { dict = {}; } }
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        if (p === 'SCRIPT' || p === 'STYLE' || p === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        return dict.hasOwnProperty(norm(n.nodeValue)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    var n;
    while ((n = walker.nextNode())) {
      var v = n.nodeValue, k = norm(v);
      textNodes.push({ node: n, fr: k, en: dict[k], pre: v.match(/^\s*/)[0], post: v.match(/\s*$/)[0] });
    }
    document.querySelectorAll('[' + ATTRS.join('],[') + ']').forEach(function (el) {
      ATTRS.forEach(function (a) {
        var v = el.getAttribute(a);
        if (v && dict.hasOwnProperty(norm(v))) attrItems.push({ el: el, attr: a, fr: v, en: dict[norm(v)] });
      });
    });
  }

  function apply(l) {
    current = l;
    document.documentElement.lang = l;
    textNodes.forEach(function (t) { t.node.nodeValue = t.pre + (l === 'en' ? t.en : t.fr) + t.post; });
    attrItems.forEach(function (a) { a.el.setAttribute(a.attr, l === 'en' ? a.en : a.fr); });
    var tk = norm(titleFr);
    document.title = (l === 'en' && dict[tk]) ? dict[tk] : titleFr;
    var b = document.getElementById('i18n-btn');
    if (b) { b.textContent = l === 'en' ? 'FR' : 'EN'; b.setAttribute('aria-label', l === 'en' ? 'Passer en français' : 'Switch to English'); }
    // pages intégrées en iframe (ex. rapport accidents)
    for (var i = 0; i < window.frames.length; i++) {
      try { if (window.frames[i].__i18nApply) window.frames[i].__i18nApply(l); } catch (e) {}
    }
  }
  window.__i18nApply = apply;

  function addButton() {
    if (window.top !== window) return; // pas de bouton dans une iframe
    var b = document.createElement('button');
    b.id = 'i18n-btn';
    b.type = 'button';
    b.style.cssText = 'position:fixed;top:1.5rem;right:1.75rem;z-index:100;background:rgba(2,2,14,.8);' +
      'backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1);border-radius:.35rem;color:rgba(255,255,255,.6);' +
      'font:700 .75rem "Segoe UI",system-ui,sans-serif;padding:.38rem .9rem;letter-spacing:.08em;cursor:pointer';
    b.addEventListener('click', function () {
      var l = current === 'fr' ? 'en' : 'fr';
      setLang(l); apply(l);
    });
    document.body.appendChild(b);
  }

  function init() {
    collect();
    addButton();
    apply(getLang());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
