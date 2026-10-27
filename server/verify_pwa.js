const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

const testPwa = async () => {
  console.log('===============================================================');
  console.log(' CLASSMATE: PROGRESSIVE WEB APP (PWA) AUDIT & VERIFICATION');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`[PASS] ${title}`);
      if (details) console.log(`       -> ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}`);
      if (details) console.error(`       -> ${details}`);
      failed++;
    }
  };

  try {
    // 1. Manifest verification
    const manifestRes = await fetch(`${BASE_URL}/manifest.webmanifest`);
    const manifestContentType = manifestRes.headers.get('content-type') || '';
    let manifestData = null;
    try {
      manifestData = await manifestRes.json();
    } catch (e) {}

    assert(
      manifestRes.status === 200 && manifestData && manifestData.display === 'standalone',
      'Web App Manifest Accessible & Standalone',
      `Status: ${manifestRes.status}, Content-Type: ${manifestContentType}, Display: ${manifestData?.display}`
    );

    assert(
      manifestData?.icons?.length >= 3 &&
      manifestData.icons.some((i) => i.sizes === '192x192') &&
      manifestData.icons.some((i) => i.sizes === '512x512') &&
      manifestData.icons.some((i) => i.purpose === 'maskable'),
      'PWA Required App Icons (192px, 512px, Maskable)',
      `Icons found: ${manifestData?.icons?.length} (${manifestData?.icons?.map((i) => i.sizes).join(', ')})`
    );

    // 2. Service Worker File & HTTP Headers
    const swRes = await fetch(`${BASE_URL}/sw.js`);
    const swContentType = swRes.headers.get('content-type') || '';
    const swAllowed = swRes.headers.get('service-worker-allowed');
    const swText = await swRes.text();

    assert(
      swRes.status === 200 && swContentType.includes('javascript') && swAllowed === '/',
      'Service Worker Accessible & Root Scope Allowed',
      `Status: ${swRes.status}, Content-Type: ${swContentType}, Service-Worker-Allowed: ${swAllowed}`
    );

    // 3. Icon HTTP Serving & PNG Signature Check
    const icon192Res = await fetch(`${BASE_URL}/icons/icon-192.png`);
    const icon192Buf = Buffer.from(await icon192Res.arrayBuffer());
    const isPng192 = icon192Buf[0] === 0x89 && icon192Buf[1] === 0x50 && icon192Buf[2] === 0x4e && icon192Buf[3] === 0x47;
    assert(
      icon192Res.status === 200 && isPng192,
      '192x192 PNG Icon Header & Byte Verification',
      `Status: ${icon192Res.status}, Size: ${icon192Buf.length} bytes, PNG Signature valid: ${isPng192}`
    );

    const icon512Res = await fetch(`${BASE_URL}/icons/icon-512.png`);
    const icon512Buf = Buffer.from(await icon512Res.arrayBuffer());
    const isPng512 = icon512Buf[0] === 0x89 && icon512Buf[1] === 0x50 && icon512Buf[2] === 0x4e && icon512Buf[3] === 0x47;
    assert(
      icon512Res.status === 200 && isPng512,
      '512x512 PNG Icon Header & Byte Verification',
      `Status: ${icon512Res.status}, Size: ${icon512Buf.length} bytes, PNG Signature valid: ${isPng512}`
    );

    const maskableRes = await fetch(`${BASE_URL}/icons/icon-maskable-512.png`);
    assert(maskableRes.status === 200, '512x512 Maskable Icon Accessible', `Status: ${maskableRes.status}`);

    const svgIconRes = await fetch(`${BASE_URL}/icons/icon.svg`);
    const svgText = await svgIconRes.text();
    assert(svgIconRes.status === 200 && svgText.includes('<svg'), 'Scalable Vector SVG Icon Accessible', `Status: ${svgIconRes.status}`);

    // 4. HTML Meta Tags Verification
    const indexRes = await fetch(`${BASE_URL}/`);
    const indexHtml = await indexRes.text();
    const hasManifestLink = indexHtml.includes('rel="manifest"') && indexHtml.includes('manifest.webmanifest');
    const hasThemeColor = indexHtml.includes('name="theme-color"') && indexHtml.includes('#4F46E5');
    const hasAppleTouch = indexHtml.includes('rel="apple-touch-icon"');

    assert(
      hasManifestLink && hasThemeColor && hasAppleTouch,
      'HTML Head Manifest & Mobile Browser Meta Tags',
      `Manifest Link: ${hasManifestLink}, Theme-Color: ${hasThemeColor}, Apple-Touch-Icon: ${hasAppleTouch}`
    );

    // 5. Service Worker Privacy & Non-Caching Rules Audit
    const bypassesApi = swText.includes("url.pathname.startsWith('/api')");
    const bypassesSocket = swText.includes("url.pathname.includes('socket.io')");
    const bypassesNonGet = swText.includes("req.method !== 'GET'");

    assert(
      bypassesApi && bypassesSocket && bypassesNonGet,
      'Service Worker Privacy Guard (No Caching of API / Socket / Private Data)',
      `Bypasses /api: ${bypassesApi}, Bypasses socket.io: ${bypassesSocket}, Bypasses POST/PUT/DELETE: ${bypassesNonGet}`
    );

  } catch (err) {
    console.error('PWA Verification Exception:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`PWA VERIFICATION SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) process.exit(1);
};

testPwa();
