// Bundled by esbuild into public/auth.js. Exposes Netlify Identity to the app.
import * as NI from '@netlify/identity'
window.NI = NI
window.dispatchEvent(new Event('ni-ready'))
