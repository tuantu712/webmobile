import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
