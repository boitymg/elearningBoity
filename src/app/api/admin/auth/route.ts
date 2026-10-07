import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function getValidToken(): string {
  const adminSecret = process.env.ADMIN_ACCESS_PASSWORD || 'azertyuiopA/17082020';
  return crypto
    .createHash('sha256')
    .update(adminSecret.trim() + '_boity_studio_admin_auth_salt_2026')
    .digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body || {};

    const expectedPassword = process.env.ADMIN_ACCESS_PASSWORD || 'azertyuiopA/17082020';

    if (password && typeof password === 'string' && password.trim() === expectedPassword.trim()) {
      const token = getValidToken();
      const response = NextResponse.json({ success: true, message: 'Accès autorisé' });

      // Cookie de session valide pour 7 jours
      response.cookies.set('boity_admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Mot de passe administrateur incorrect' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification du mot de passe' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('boity_admin_session')?.value;
    const validToken = getValidToken();

    if (cookieToken && cookieToken === validToken) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Session admin verrouillée' });
  response.cookies.set('boity_admin_session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
