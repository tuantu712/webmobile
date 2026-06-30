import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    let addresses = [];
    try {
      addresses = JSON.parse(user.addresses || '[]');
    } catch (e) {
      addresses = [];
    }

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone || '',
        birthday: user.birthday || '',
        avatar: user.avatar || 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/icons/profile.png',
        addresses
      }
    });

  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
