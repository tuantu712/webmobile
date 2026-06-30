import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = db.prepare(`
      SELECT p.*, c.slug as category_slug, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(productId) as any;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let images = [];
    let sizes = [];
    let colors = [];
    
    try {
      images = JSON.parse(product.images || '[]');
    } catch (e) {
      images = [product.image];
    }

    try {
      sizes = JSON.parse(product.sizes || '[]');
    } catch (e) {
      sizes = [];
    }

    try {
      colors = JSON.parse(product.colors || '[]');
    } catch (e) {
      colors = [];
    }

    const formattedProduct = {
      ...product,
      images: images.length > 0 ? images : [product.image],
      sizes,
      colors
    };

    return NextResponse.json({ product: formattedProduct });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
