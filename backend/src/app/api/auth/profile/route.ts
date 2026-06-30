import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(authUser.id) as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let addresses = [];
    try {
      addresses = JSON.parse(user.addresses || '[]');
    } catch (e) {
      addresses = [];
    }

    return NextResponse.json({
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, birthday, avatar } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE users
      SET name = ?, phone = ?, birthday = ?, avatar = ?
      WHERE id = ?
    `).run(
      name,
      phone || '',
      birthday || '',
      avatar || 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/icons/profile.png',
      authUser.id
    );

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(authUser.id) as any;
    
    let addresses = [];
    try {
      addresses = JSON.parse(updatedUser.addresses || '[]');
    } catch (e) {
      addresses = [];
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone || '',
        birthday: updatedUser.birthday || '',
        avatar: updatedUser.avatar || 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/icons/profile.png',
        addresses
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
