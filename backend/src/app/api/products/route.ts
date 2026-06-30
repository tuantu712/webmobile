import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const categorySlug = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const sort = url.searchParams.get('sort');
    const color = url.searchParams.get('color');
    
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    let query = `
      SELECT p.*, c.slug as category_slug, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filter by Category
    if (categorySlug) {
      query += ` AND c.slug = ?`;
      params.push(categorySlug);
    }

    // Filter by Search Query
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filter by Color
    if (color) {
      query += ` AND p.colors LIKE ?`;
      params.push(`%${color}%`);
    }

    // Get Total Count before pagination
    let countQuery = `SELECT COUNT(*) as total FROM (${query})`;
    const countRow = db.prepare(countQuery).get(...params) as { total: number };
    const total = countRow.total;

    // Sorting
    if (sort === 'price_asc') {
      query += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_desc') {
      query += ` ORDER BY p.price DESC`;
    } else if (sort === 'rating_desc') {
      query += ` ORDER BY p.rating DESC`;
    } else if (sort === 'newest') {
      query += ` ORDER BY p.created_at DESC`;
    } else {
      query += ` ORDER BY p.id ASC`;
    }

    // Pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rawProducts = db.prepare(query).all(...params) as any[];
    
    // Parse JSON fields
    const products = rawProducts.map(p => {
      let images = [];
      let sizes = [];
      let colors = [];
      
      try {
        images = JSON.parse(p.images || '[]');
      } catch (e) {
        images = [p.image];
      }

      try {
        sizes = JSON.parse(p.sizes || '[]');
      } catch (e) {
        sizes = [];
      }

      try {
        colors = JSON.parse(p.colors || '[]');
      } catch (e) {
        colors = [];
      }

      return {
        ...p,
        images,
        sizes,
        colors
      };
    });

    const hasMore = offset + products.length < total;

    return NextResponse.json({
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore
      }
    });

  } catch (error: any) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
