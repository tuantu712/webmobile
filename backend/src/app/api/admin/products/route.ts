import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// Helper to check admin access
function checkAdminAccess(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser || authUser.email !== 'admin@fuzzy.com') {
    return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  try {
    if (!checkAdminAccess(req)) {
      return NextResponse.json({ error: 'Forbidden. Admin access required' }, { status: 403 });
    }

    const rawProducts = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `).all() as any[];

    const products = rawProducts.map(p => {
      let images = [];
      let sizes = [];
      let colors = [];
      try { images = JSON.parse(p.images || '[]'); } catch (e) { images = [p.image]; }
      try { sizes = JSON.parse(p.sizes || '[]'); } catch (e) { sizes = []; }
      try { colors = JSON.parse(p.colors || '[]'); } catch (e) { colors = []; }

      return {
        ...p,
        images,
        sizes,
        colors
      };
    });

    return NextResponse.json({ products });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!checkAdminAccess(req)) {
      return NextResponse.json({ error: 'Forbidden. Admin access required' }, { status: 403 });
    }

    const { name, description, price, prev_price, image, images, sizes, colors, category_id, stock } = await req.json();

    if (!name || !price || !image || !category_id) {
      return NextResponse.json({ error: 'Name, price, main image, and category are required' }, { status: 400 });
    }

    const insertResult = db.prepare(`
      INSERT INTO products (name, description, price, prev_price, image, images, sizes, colors, category_id, stock, rating, save_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, ?)
    `).run(
      name,
      description || '',
      price,
      prev_price || null,
      image,
      JSON.stringify(images || [image]),
      JSON.stringify(sizes || []),
      JSON.stringify(colors || []),
      category_id,
      stock !== undefined ? stock : 10,
      prev_price && prev_price > price ? prev_price - price : 0
    );

    return NextResponse.json({
      message: 'Product created successfully',
      productId: insertResult.lastInsertRowid
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
