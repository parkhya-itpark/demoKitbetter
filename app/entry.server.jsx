import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} remixContext
 * @param {AppLoadContext} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
  context,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    defaultSrc: [
      'https://kitbetter-56a37c90c6786740f72a.o2.myshopify.dev/',
      'http://localhost:3000',
      'https://cdn.shopify.com/',
      'https://cca3f6-bf.myshopify.com/', // Add any additional domains if needed
      'https://airedale-electric-eft.ngrok-free.app',
      'https://swiperjs.com/',
      'https://react-responsive-carousel.js.org/',
      "'self'", // Always include 'self' if you want to allow resources from the same origin
      // `'nonce-${nonce}'` // Using the nonce for inline scripts and styles
    ],
    fontSrc: [
      'https://kitbetter-56a37c90c6786740f72a.o2.myshopify.dev/',
      'http://localhost:3000',
      'https://cdn.shopify.com/',
      'https://cca3f6-bf.myshopify.com/',
      'https://airedale-electric-eft.ngrok-free.app',
      'https://swiperjs.com/',
      'https://react-responsive-carousel.js.org/',
      'data:', // Allows fonts to be loaded from data URIs
    ],
    mediaSrc: [
      'https://kitbetter-56a37c90c6786740f72a.o2.myshopify.dev/',
      'http://localhost:3000',
      'https://cdn.shopify.com/',
      'https://cca3f6-bf.myshopify.com/',
      'https://airedale-electric-eft.ngrok-free.app',
      'https://react-responsive-carousel.js.org/',
      'https://swiperjs.com/',
    ],
    imgSrc: [
      'https://kitbetter-56a37c90c6786740f72a.o2.myshopify.dev/',
      'http://localhost:3000',
      'https://cdn.shopify.com/',
      'https://cca3f6-bf.myshopify.com/',
      'https://airedale-electric-eft.ngrok-free.app',
      'https://react-responsive-carousel.js.org/',
      'https://swiperjs.com/',
    ],
    connectSrc: [
      'https://kitbetter-56a37c90c6786740f72a.o2.myshopify.dev/',
      'https://example.com', // Add any additional domains if needed
      'https://cca3f6-bf.myshopify.com/',
      'https://airedale-electric-eft.ngrok-free.app',
      'https://swiperjs.com/',
      'https://react-responsive-carousel.js.org/',
      'https://checkout.hydrogen.shop', // Added URL for checkout connection
      'https://monorail-edge.shopifysvc.com',
      'https://react-responsive-carousel.js.org/',
      'http://localhost:*',
      'ws://localhost:*',
      'ws://127.0.0.1:*',
      'ws://*.tryhydrogen.dev:*',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
/** @typedef {import('@shopify/remix-oxygen').EntryContext} EntryContext */
