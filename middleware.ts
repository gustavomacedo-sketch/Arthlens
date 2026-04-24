import { geolocation } from '@vercel/functions';

const COUNTRY_TO_PATH: Record<string, string> = {
  AE: '/ae/',
  AU: '/au/',
  BE: '/be/',
  BR: '/br/',
  CA: '/ca/',
  CH: '/ch/',
  DE: '/de/',
  DK: '/dk/',
  FR: '/fr/',
  GB: '/uk/',
  IE: '/ie/',
  IL: '/il/',
  JP: '/jp/',
  KR: '/kr/',
  MX: '/mx/',
  NL: '/nl/',
  NO: '/no/',
  NZ: '/nz/',
  SA: '/sa/',
  SE: '/se/',
  SG: '/sg/',
  US: '/us/',
};

const ALLOWED_PATHS = new Set(Object.values(COUNTRY_TO_PATH));
const DEFAULT_PATH = '/us/';
const COOKIE_NAME = 'arthlens_country';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function middleware(request: Request): Response {
  const url = new URL(request.url);

  const savedPath = readCookie(request.headers.get('cookie'), COOKIE_NAME);
  const hasValidPref = savedPath !== null && ALLOWED_PATHS.has(savedPath);

  let target: string;
  if (hasValidPref) {
    target = savedPath as string;
  } else {
    const { country } = geolocation(request);
    const key = (country ?? 'US').toUpperCase();
    target = COUNTRY_TO_PATH[key] ?? DEFAULT_PATH;
  }

  const location = new URL(target, url.origin).toString();
  const headers = new Headers({ Location: location });

  if (!hasValidPref) {
    headers.append(
      'Set-Cookie',
      `${COOKIE_NAME}=${encodeURIComponent(target)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`,
    );
  }

  return new Response(null, { status: 307, headers });
}

export const config = {
  matcher: '/',
  runtime: 'edge',
};
