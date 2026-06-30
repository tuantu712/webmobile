import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

function checkAdminAccess(req: NextRequest) {
  const authUser = getAuthUser(req);
  return authUser?.email === 'admin@fuzzy.com';
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminAccess(req)) {
      return NextResponse.json({ error: 'Forbidden. Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { name, description, price, prev_price, image, images, sizes, colors, category_id, stock } = await req.json();

    if (!name || !price || !image || !category_id) {
      return NextResponse.json({ error: 'Name, price, image and category are required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE products
      SET name = ?, description = ?, price = ?, prev_price = ?, image = ?, images = ?, sizes = ?, colors = ?, category_id = ?, stock = ?, save_amount = ?
      WHERE id = ?
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
      prev_price && prev_price > price ? prev_price - price : 0,
      productId
    );

    return NextResponse.json({ message: 'Product updated successfully' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminAccess(req)) {
      return NextResponse.json({ error: 'Forbidden. Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(productId);

    return NextResponse.json({ message: 'Product deleted successfully' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
