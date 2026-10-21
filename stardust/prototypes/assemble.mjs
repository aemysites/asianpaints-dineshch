// Assembles stardust/prototypes/index-proposed.html from fragments/ (header, main-a, main-b, footer).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const dir = new URL('.', import.meta.url).pathname;
const frag = (n) => (existsSync(`${dir}fragments/${n}.html`) ? readFileSync(`${dir}fragments/${n}.html`, 'utf8') : `<!-- ${n}: pending -->`);
const css = ['canon', 'chrome', 'index-a', 'index-b'].map((n) => `<link rel="stylesheet" href="css/${n}.css">`).join('\n');
const js = ['chrome', 'index-a', 'index-b'].filter((n) => existsSync(`${dir}js/${n}.js`)).map((n) => `<script src="js/${n}.js" defer></script>`).join('\n');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Trusted Wall Painting, Home Painting &amp; Waterproofing in India - Asian Paints</title>
${css}
${js}
</head>
<body>
${frag('header')}
<main>
${frag('main-a')}
${frag('main-b')}
</main>
${frag('footer')}
</body>
</html>
`;
writeFileSync(`${dir}index-proposed.html`, html);
console.log('assembled index-proposed.html');
