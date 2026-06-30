import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

interface Address {
  id: string;
  title: string;
  receiver: string;
  phone: string;
  detail: string;
  city: string;
  isDefault: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = db.prepare('SELECT addresses FROM users WHERE id = ?').get(authUser.id) as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const addresses = JSON.parse(user.addresses || '[]');
    return NextResponse.json({ addresses });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, receiver, phone, detail, city, isDefault } = await req.json();

    if (!title || !receiver || !phone || !detail || !city) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const user = db.prepare('SELECT addresses FROM users WHERE id = ?').get(authUser.id) as any;
    let addresses: Address[] = JSON.parse(user.addresses || '[]');

    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      title,
      receiver,
      phone,
      detail,
      city,
      isDefault: isDefault || addresses.length === 0
    };

    if (newAddress.isDefault) {
      addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }

    addresses.push(newAddress);

    db.prepare('UPDATE users SET addresses = ? WHERE id = ?').run(
      JSON.stringify(addresses),
      authUser.id
    );

    return NextResponse.json({
      message: 'Address added successfully',
      addresses
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

    const { id, title, receiver, phone, detail, city, isDefault } = await req.json();

    if (!id || !title || !receiver || !phone || !detail || !city) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const user = db.prepare('SELECT addresses FROM users WHERE id = ?').get(authUser.id) as any;
    let addresses: Address[] = JSON.parse(user.addresses || '[]');

    const index = addresses.findIndex(addr => addr.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    if (isDefault) {
      addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }

    addresses[index] = {
      id,
      title,
      receiver,
      phone,
      detail,
      city,
      isDefault: isDefault || (addresses[index].isDefault && !addresses.some(a => a.id !== id && a.isDefault))
    };

    db.prepare('UPDATE users SET addresses = ? WHERE id = ?').run(
      JSON.stringify(addresses),
      authUser.id
    );

    return NextResponse.json({
      message: 'Address updated successfully',
      addresses
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const user = db.prepare('SELECT addresses FROM users WHERE id = ?').get(authUser.id) as any;
    let addresses: Address[] = JSON.parse(user.addresses || '[]');

    const index = addresses.findIndex(addr => addr.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const wasDefault = addresses[index].isDefault;
    addresses.splice(index, 1);

    if (wasDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    db.prepare('UPDATE users SET addresses = ? WHERE id = ?').run(
      JSON.stringify(addresses),
      authUser.id
    );

    return NextResponse.json({
      message: 'Address deleted successfully',
      addresses
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
