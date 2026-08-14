#!/usr/bin/env node
/**
 * Headless test for the scroll-reveal controller.
 *
 * This exists because the bug it guards against is invisible to the build, the
 * typechecker and SSR: reveal targets start at `opacity: 0`, so a target the
 * controller fails to register renders as a BLANK PAGE rather than as a missing
 * animation. It only reproduced on client-side navigation.
 *
 * Run with: npm run test:reveal
 * Requires happy-dom (dev-only; installed on demand by the script if absent).
 */
import { Window } from 'happy-dom'
import { build } from 'esbuild'
import { readFile, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/* -------------------------------------------------------------------------- */
/* Harness                                                                    */
/* -------------------------------------------------------------------------- */

let passed = 0
const failures = []

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1
    console.log(`  ✓ ${name}`)
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))

/** Compiles the TS controller to JS so plain Node can import it. */
async function loadController() {
  const outfile = join(ROOT, '.reveal-test.mjs')
  await build({
    entryPoints: [join(ROOT, 'app/utils/reveal.ts')],
    outfile,
    format: 'esm',
    platform: 'neutral',
    bundle: true,
    logLevel: 'silent',
  })
  const source = await readFile(outfile, 'utf8')
  await rm(outfile, { force: true })
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
}

/**
 * Installs a DOM plus a controllable IntersectionObserver.
 * happy-dom has MutationObserver but no IntersectionObserver, so we supply one
 * whose delivery we can withhold — that is how the failsafe gets tested.
 */
function installDom({ deliverIntersections = true } = {}) {
  const window = new Window({ url: 'http://localhost/', width: 1024, height: 768 })
  const { document } = window

  document.body.innerHTML = '<main id="main"></main>'

  const observed = new Set()

  class FakeIntersectionObserver {
    constructor(callback) {
      this.callback = callback
    }
    observe(el) {
      observed.add(el)
      if (!deliverIntersections) return
      // Real observers deliver asynchronously; mirror that.
      setTimeout(() => {
        if (!observed.has(el)) return
        this.callback([{ target: el, isIntersecting: true }])
      }, 0)
    }
    unobserve(el) {
      observed.delete(el)
    }
    disconnect() {
      observed.clear()
    }
  }

  globalThis.window = window
  globalThis.document = document
  globalThis.MutationObserver = window.MutationObserver
  globalThis.IntersectionObserver = FakeIntersectionObserver
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(0), 8)
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id)

  // Reveal targets are treated as on-screen unless a test says otherwise.
  window.Element.prototype.getBoundingClientRect = function () {
    return { top: this.__offscreen ? 5000 : 10, left: 0, bottom: 0, right: 0, width: 100, height: 100 }
  }

  return { window, document, observed }
}

const addSection = (document, count, { offscreen = false } = {}) => {
  const main = document.getElementById('main')
  const created = []
  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('div')
    el.setAttribute('data-reveal', '')
    el.__offscreen = offscreen
    main.appendChild(el)
    created.push(el)
  }
  return created
}

const hidden = (document) =>
  document.querySelectorAll('[data-reveal]:not(.is-revealed)').length

/* -------------------------------------------------------------------------- */
/* Tests                                                                      */
/* -------------------------------------------------------------------------- */

const { createRevealController } = await loadController()

console.log('\nscroll-reveal controller\n')

// 1 — targets present at start are revealed.
{
  const { document } = installDom()
  addSection(document, 3)
  const controller = createRevealController()
  controller.start()
  await tick(30)
  check('reveals targets present on first render', hidden(document) === 0, `${hidden(document)} still hidden`)
  controller.stop()
}

// 2 — THE REGRESSION. Content injected long after navigation is confirmed —
//     which is what `pageTransition: out-in` does — must still be revealed.
{
  const { document } = installDom()
  addSection(document, 2)
  const controller = createRevealController()
  controller.start()
  await tick(30)

  // Simulate leaving the route, then the new page mounting 300ms later.
  document.getElementById('main').innerHTML = ''
  await tick(300)
  const incoming = addSection(document, 4)
  await tick(60)

  const stillHidden = incoming.filter((el) => !el.classList.contains('is-revealed')).length
  check(
    'reveals a route mounted after the leave transition (out-in)',
    stillHidden === 0,
    `${stillHidden}/4 of the new page stayed invisible`,
  )
  controller.stop()
}

// 3 — repeated navigations keep working.
{
  const { document } = installDom()
  const controller = createRevealController()
  controller.start()
  let worstCase = 0
  for (let nav = 0; nav < 5; nav += 1) {
    document.getElementById('main').innerHTML = ''
    await tick(280)
    addSection(document, 3)
    await tick(60)
    worstCase = Math.max(worstCase, hidden(document))
  }
  check('survives repeated client-side navigation', worstCase === 0, `${worstCase} hidden at worst`)
  controller.stop()
}

// 4 — failsafe: on-screen content appears even if intersections never arrive.
{
  const { document } = installDom({ deliverIntersections: false })
  const controller = createRevealController({ failsafeMs: 60 })
  controller.start()
  addSection(document, 3)
  await tick(200)
  check(
    'failsafe reveals on-screen targets when intersections never fire',
    hidden(document) === 0,
    `${hidden(document)} still hidden`,
  )
  controller.stop()
}

// 5 — the failsafe must not defeat the effect for below-the-fold content.
{
  const { document } = installDom({ deliverIntersections: false })
  const controller = createRevealController({ failsafeMs: 60 })
  controller.start()
  const offscreen = addSection(document, 3, { offscreen: true })
  await tick(200)
  const revealed = offscreen.filter((el) => el.classList.contains('is-revealed')).length
  check('failsafe leaves below-the-fold targets alone', revealed === 0, `${revealed} revealed early`)
  controller.stop()
}

// 6 — reduced motion shows everything immediately, including later routes.
{
  const { window, document } = installDom()
  window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })
  const controller = createRevealController()
  controller.start()
  addSection(document, 3)
  await tick(60)
  check('reduced motion reveals everything without animating', hidden(document) === 0)
  controller.stop()
}

// 7 — stop() releases everything.
{
  const { document } = installDom()
  const controller = createRevealController()
  controller.start()
  controller.stop()
  addSection(document, 2)
  await tick(60)
  check('stop() detaches observers', hidden(document) === 2, 'controller kept working after stop')
}

/* -------------------------------------------------------------------------- */

console.log('')
if (failures.length) {
  console.error(`✗ ${failures.length} failed, ${passed} passed\n`)
  process.exit(1)
}
console.log(`✓ ${passed} passed\n`)
