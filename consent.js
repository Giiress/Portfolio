/**
 * CONSENT — Google Analytics chargé uniquement après accord explicite (RGPD / CNIL).
 * Partagé par toutes les pages : <script src="consent.js" defer> (ou ../consent.js).
 * Choix mémorisé dans localStorage ('portfolioConsent' = 'granted' | 'denied').
 * Un petit bouton « Cookies » (bas gauche) permet de revenir sur son choix à tout moment.
 */
(function () {
  var GA_ID = 'G-65H9NJS598';
  var KEY = 'portfolioConsent';

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadGA() {
    window['ga-disable-' + GA_ID] = false;
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

  function lang() {
    try { if (localStorage.getItem('portfolioLang') === 'en') return 'en'; } catch (e) {}
    return 'fr';
  }

  // Retrait du consentement : coupe GA et supprime ses cookies (_ga, _ga_*)
  function revokeGA() {
    window['ga-disable-' + GA_ID] = true;
    var host = location.hostname, parts = host.split('.');
    var domains = ['', host, '.' + host];
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  function showManageButton() {
    if (document.getElementById('consent-manage')) return;
    var en = lang() === 'en';
    var m = document.createElement('button');
    m.id = 'consent-manage';
    m.type = 'button';
    m.textContent = 'Cookies';
    m.setAttribute('aria-label', en ? 'Manage cookie preferences' : 'Gérer les cookies');
    m.style.cssText = 'position:fixed;left:.75rem;bottom:.75rem;z-index:9998;background:rgba(2,2,14,.8);' +
      'border:1px solid rgba(255,255,255,.15);border-radius:.3rem;color:rgba(255,255,255,.6);' +
      'font:600 11px "Segoe UI",system-ui,sans-serif;padding:.25rem .6rem;cursor:pointer';
    m.addEventListener('click', function () { m.remove(); showBanner(); });
    document.body.appendChild(m);
  }

  function showBanner() {
    if (document.getElementById('consent-banner')) return;
    var en = lang() === 'en';
    var b = document.createElement('div');
    b.id = 'consent-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', en ? 'Cookie consent' : 'Consentement aux cookies');
    b.style.cssText = 'position:fixed;left:1rem;bottom:1rem;z-index:10000;max-width:340px;' +
      'background:rgba(2,2,14,.95);border:1px solid rgba(255,255,255,.18);border-radius:.5rem;' +
      'padding:.9rem 1rem;color:#dde4f0;font:13px/1.45 "Segoe UI",system-ui,sans-serif;' +
      'box-shadow:0 8px 30px rgba(0,0,0,.5);cursor:auto';
    var p = document.createElement('p');
    p.style.margin = '0 0 .7rem';
    p.textContent = en
      ? 'This site uses Google Analytics to measure visits. Do you accept audience cookies?'
      : 'Ce site utilise Google Analytics pour mesurer les visites. Acceptez-vous les cookies de mesure d’audience ?';
    b.appendChild(p);
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:.5rem;justify-content:flex-end';
    function btn(label, primary, choice) {
      var x = document.createElement('button');
      x.type = 'button';
      x.textContent = label;
      x.style.cssText = 'font:inherit;font-weight:600;padding:.4rem .9rem;border-radius:.35rem;cursor:pointer;' +
        (primary ? 'background:#6366f1;color:#fff;border:1px solid #6366f1'
                 : 'background:transparent;color:#dde4f0;border:1px solid rgba(255,255,255,.35)');
      x.addEventListener('click', function () {
        set(choice);
        b.remove();
        if (choice === 'granted') loadGA(); else revokeGA();
        showManageButton();
      });
      return x;
    }
    row.appendChild(btn(en ? 'Decline' : 'Refuser', false, 'denied'));
    row.appendChild(btn(en ? 'Accept' : 'Accepter', true, 'granted'));
    b.appendChild(row);
    document.body.appendChild(b);
  }

  window.resetCookieConsent = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.reload();
  };

  function onReady(fn) {
    if (document.body) fn(); else document.addEventListener('DOMContentLoaded', fn);
  }
  var c = get();
  if (c === 'granted') loadGA();
  // pas de bouton dans une page affichée en iframe (ex. rapport accidents)
  if (window.top !== window) return;
  onReady(c === 'granted' || c === 'denied' ? showManageButton : showBanner);
})();
