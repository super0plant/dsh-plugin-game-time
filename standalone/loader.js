/**
 * Standalone shim for `window.__ModuleLoader__`.
 *
 * DSH hands plugins a `ctx` with `effect` / `locale` / `slots`. This file builds
 * the smallest ctx that still satisfies `client.js`: dictionaries are registered
 * and bound, the `main` slot is mounted into #root with React, and the sidebar
 * glyph registration is ignored (there is no sidebar outside DSH).
 */
(function () {
  'use strict'

  var loader = window.__ModuleLoader__ || (window.__ModuleLoader__ = {})
  var mounted = false
  var dicts = {}

  function language() {
    var query = new URLSearchParams(window.location.search).get('lang')
    if (query === 'en' || query === 'zh') return query
    var tag = String(navigator.language || 'zh').toLowerCase()
    return tag.indexOf('zh') === 0 ? 'zh' : 'en'
  }

  var lang = language()

  function translate(ns, key) {
    var tables = dicts[ns]
    var table = tables ? tables[lang] || tables.zh || tables.en : null
    var value = table ? table[key] : null
    return value == null ? key : value
  }

  function showError(error) {
    console.error(error)
    var box = document.getElementById('boot-error')
    if (!box) return
    box.hidden = false
    box.textContent = String((error && error.stack) || error)
  }

  function mountPane(options, Component) {
    if (mounted) return
    mounted = true
    var props = typeof options.inject === 'function' ? options.inject() : {}
    var host = document.getElementById('root')
    try {
      window.ReactDOM.createRoot(host).render(window.React.createElement(Component, props))
    } catch (error) {
      showError(error)
    }
  }

  function makeCtx() {
    return {
      effect: function (fn) {
        try {
          var dispose = typeof fn === 'function' ? fn() : null
          return function () {
            if (typeof dispose === 'function') dispose()
          }
        } catch (error) {
          showError(error)
          return function () {}
        }
      },
      locale: {
        register: function (ns, tables) {
          dicts[ns] = tables
        },
        bind: function (ns) {
          return function (key) {
            return translate(ns, key)
          }
        },
      },
      slots: {
        inject: function (name, callback) {
          if (name !== 'main') return function () {}
          try {
            var dispose = callback()
            return typeof dispose === 'function' ? dispose : function () {}
          } catch (error) {
            showError(error)
            return function () {}
          }
        },
        register: function (options, Component) {
          if (options && options.name === 'main') mountPane(options, Component)
          return function () {}
        },
      },
    }
  }

  function requireModule(id) {
    if (id === 'react') return window.React
    throw new Error('standalone: module "' + id + '" is not in the page table')
  }

  loader.load = function (entry) {
    try {
      var module = entry.factory(requireModule)
      module.apply(makeCtx())
    } catch (error) {
      showError(error)
    }
  }
})()
