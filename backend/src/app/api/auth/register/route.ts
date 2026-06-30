import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password and name are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password strength check
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const defaultAddresses = JSON.stringify([]);
    const defaultAvatar = 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/icons/profile.png';
    
    const insertResult = db.prepare(`
      INSERT INTO users (email, password, name, phone, avatar, addresses)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(email, hashedPassword, name, phone || '', defaultAvatar, defaultAddresses);

    const userId = insertResult.lastInsertRowid as number;

    const token = signToken({
      id: userId,
      email,
      name
    });

    return NextResponse.json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email,
        name,
        phone: phone || '',
        avatar: defaultAvatar,
        addresses: []
      }
    });

  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
