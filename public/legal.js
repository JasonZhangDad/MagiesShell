/**
 * Localize privacy / terms pages to match the main site UI language.
 * Full body blocks: zh / zh-TW / en / ja / ko / de / fr / es / pt / ru.
 * Resolution: ?lang= → localStorage(magies-shell-lang) → navigator.
 */
;(function () {
  var STORAGE_KEY = 'magies-shell-lang'
  var LANG_IDS = {
    zh: 1,
    'zh-TW': 1,
    en: 1,
    ja: 1,
    ko: 1,
    de: 1,
    fr: 1,
    es: 1,
    pt: 1,
    ru: 1,
  }

  var HTML_LANG = {
    zh: 'zh-CN',
    'zh-TW': 'zh-TW',
    en: 'en',
    ja: 'ja',
    ko: 'ko',
    de: 'de',
    fr: 'fr',
    es: 'es',
    pt: 'pt-BR',
    ru: 'ru',
  }

  /** Page chrome: privacy | terms */
  var CHROME = {
    privacy: {
      zh: {
        title: '隐私政策 — MagiesTerminal',
        h1: '隐私政策',
        meta: '最后更新：2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'MagiesTerminal 桌面客户端与网站的隐私政策。',
      },
      'zh-TW': {
        title: '隱私權政策 — MagiesTerminal',
        h1: '隱私權政策',
        meta: '最後更新：2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'MagiesTerminal 桌面用戶端與網站的隱私權政策。',
      },
      en: {
        title: 'Privacy Policy — MagiesTerminal',
        h1: 'Privacy Policy',
        meta: 'Last updated: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'Privacy Policy for MagiesTerminal desktop client and website.',
      },
      ja: {
        title: 'プライバシー — MagiesTerminal',
        h1: 'プライバシーポリシー',
        meta: '最終更新: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'MagiesTerminal デスクトップとサイトのプライバシーポリシー。',
      },
      ko: {
        title: '개인정보 — MagiesTerminal',
        h1: '개인정보 처리방침',
        meta: '최종 업데이트: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'MagiesTerminal 데스크톱 클라이언트 및 웹사이트의 개인정보 처리방침.',
      },
      de: {
        title: 'Datenschutz — MagiesTerminal',
        h1: 'Datenschutzrichtlinie',
        meta: 'Zuletzt aktualisiert: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'Datenschutzrichtlinie für den MagiesTerminal-Desktop-Client und die Website.',
      },
      fr: {
        title: 'Confidentialité — MagiesTerminal',
        h1: 'Politique de confidentialité',
        meta: 'Dernière mise à jour : 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'Politique de confidentialité du client de bureau et du site MagiesTerminal.',
      },
      es: {
        title: 'Privacidad — MagiesTerminal',
        h1: 'Política de privacidad',
        meta: 'Última actualización: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'Política de privacidad del cliente de escritorio y el sitio MagiesTerminal.',
      },
      pt: {
        title: 'Privacidade — MagiesTerminal',
        h1: 'Política de privacidade',
        meta: 'Última atualização: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'Política de privacidade do cliente desktop e do site MagiesTerminal.',
      },
      ru: {
        title: 'Конфиденциальность — MagiesTerminal',
        h1: 'Политика конфиденциальности',
        meta: 'Обновлено: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'Политика конфиденциальности клиента MagiesTerminal и сайта.',
      },
    },
    terms: {
      zh: {
        title: '使用条款 — MagiesTerminal',
        h1: '使用条款',
        meta: '最后更新：2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'MagiesTerminal 桌面客户端与网站的使用条款。',
      },
      'zh-TW': {
        title: '使用條款 — MagiesTerminal',
        h1: '使用條款',
        meta: '最後更新：2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'MagiesTerminal 桌面用戶端與網站的使用條款。',
      },
      en: {
        title: 'Terms of Use — MagiesTerminal',
        h1: 'Terms of Use',
        meta: 'Last updated: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'Terms of use for MagiesTerminal desktop client and website.',
      },
      ja: {
        title: '利用規約 — MagiesTerminal',
        h1: '利用規約',
        meta: '最終更新: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'MagiesTerminal デスクトップとサイトの利用規約。',
      },
      ko: {
        title: '이용약관 — MagiesTerminal',
        h1: '이용약관',
        meta: '최종 업데이트: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'MagiesTerminal 데스크톱 클라이언트 및 웹사이트 이용약관.',
      },
      de: {
        title: 'Nutzungsbedingungen — MagiesTerminal',
        h1: 'Nutzungsbedingungen',
        meta: 'Zuletzt aktualisiert: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'Nutzungsbedingungen für den MagiesTerminal-Desktop-Client und die Website.',
      },
      fr: {
        title: 'Conditions — MagiesTerminal',
        h1: "Conditions d'utilisation",
        meta: 'Dernière mise à jour : 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: "Conditions d'utilisation du client de bureau et du site MagiesTerminal.",
      },
      es: {
        title: 'Términos — MagiesTerminal',
        h1: 'Términos de uso',
        meta: 'Última actualización: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'Términos de uso del cliente de escritorio y el sitio MagiesTerminal.',
      },
      pt: {
        title: 'Termos — MagiesTerminal',
        h1: 'Termos de uso',
        meta: 'Última atualização: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'Termos de uso do cliente desktop e do site MagiesTerminal.',
      },
      ru: {
        title: 'Условия — MagiesTerminal',
        h1: 'Условия использования',
        meta: 'Обновлено: 2026-07-15 · Magies Technology',
        back: '← MagiesTerminal',
        desc: 'Условия использования клиента MagiesTerminal и сайта.',
      },
    },
  }

  function isLang(value) {
    return Boolean(value && LANG_IDS[value])
  }

  function detectFromNavigator(navLang) {
    var raw = String(navLang || 'en')
      .toLowerCase()
      .replace('_', '-')
    if (raw.indexOf('zh-tw') === 0 || raw.indexOf('zh-hk') === 0 || raw.indexOf('zh-mo') === 0 || raw === 'zh-hant') {
      return 'zh-TW'
    }
    if (raw.indexOf('zh') === 0) return 'zh'
    if (raw.indexOf('ja') === 0) return 'ja'
    if (raw.indexOf('ko') === 0) return 'ko'
    if (raw.indexOf('de') === 0) return 'de'
    if (raw.indexOf('fr') === 0) return 'fr'
    if (raw.indexOf('es') === 0) return 'es'
    if (raw.indexOf('pt') === 0) return 'pt'
    if (raw.indexOf('ru') === 0) return 'ru'
    if (raw.indexOf('en') === 0) return 'en'
    return 'en'
  }

  function resolveUiLang() {
    try {
      var q = new URLSearchParams(location.search).get('lang')
      if (isLang(q)) return q
    } catch (_) {
      /* ignore */
    }
    try {
      var saved = localStorage.getItem(STORAGE_KEY)
      if (isLang(saved)) return saved
    } catch (_) {
      /* ignore */
    }
    try {
      return detectFromNavigator(navigator.language || 'en')
    } catch (_) {
      return 'en'
    }
  }

  /**
   * Body text locale: each UI language has a full block (data-legal-block="{lang}").
   * Fall back to English if a block is missing.
   */
  function contentLocale(uiLang) {
    if (document.querySelector('[data-legal-block="' + uiLang + '"]')) return uiLang
    return 'en'
  }

  function applyLegalLocale() {
    var page = document.body && document.body.getAttribute('data-legal-page')
    if (page !== 'privacy' && page !== 'terms') return

    var uiLang = resolveUiLang()
    var bodyLang = contentLocale(uiLang)
    var chromePack = CHROME[page] || CHROME.privacy
    var chrome = chromePack[uiLang] || chromePack.en

    document.documentElement.lang = HTML_LANG[uiLang] || 'en'
    document.title = chrome.title

    var desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', chrome.desc)

    var back = document.querySelector('[data-legal-back]')
    if (back) back.textContent = chrome.back

    var h1 = document.querySelector('[data-legal-h1]')
    if (h1) h1.textContent = chrome.h1

    var meta = document.querySelector('[data-legal-meta]')
    if (meta) meta.textContent = chrome.meta

    document.body.classList.add('legal-localized')
    document.body.setAttribute('data-ui-lang', uiLang)
    document.body.setAttribute('data-content-lang', bodyLang)

    var blocks = document.querySelectorAll('[data-legal-block]')
    for (var i = 0; i < blocks.length; i++) {
      var el = blocks[i]
      var match = el.getAttribute('data-legal-block') === bodyLang
      el.classList.toggle('is-active', match)
      el.hidden = !match
    }

    // Keep URL shareable with current lang without polluting history on every load.
    try {
      var url = new URL(location.href)
      if (url.searchParams.get('lang') !== uiLang) {
        url.searchParams.set('lang', uiLang)
        history.replaceState(null, '', url.pathname + url.search + url.hash)
      }
    } catch (_) {
      /* ignore */
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLegalLocale)
  } else {
    applyLegalLocale()
  }
})()
