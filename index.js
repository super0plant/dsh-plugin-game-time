/**
 * Game Time — Host entry.
 *
 * The implementation lives in `src/host/*`; this file only keeps the package
 * entry contract stable (`exports["."]` points here) so the Host keeps
 * importing a module named `index.js`.
 *
 * @module dsh-plugin-game-time
 */

export { name, inject, apply } from './src/host/main.js'
