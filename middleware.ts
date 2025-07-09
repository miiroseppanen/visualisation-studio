import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public files and API routes
  if (
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Detect language from Accept-Language header or cookie
  const acceptLang = req.headers.get('accept-language');
  const lang = acceptLang?.split(',')[0].split('-')[0] || 'en';

  // Set a cookie for the detected language
  const res = NextResponse.next();
  res.cookies.set('NEXT_LOCALE', lang, { path: '/' });
  return res;
} 