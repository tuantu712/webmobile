import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = db.prepare(`
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(authUser.id) as any[];

    const formattedOrders = orders.map(o => {
      let items = [];
      let address = {};
      
      try {
        items = JSON.parse(o.items || '[]');
      } catch (e) {
        items = [];
      }

      try {
        address = JSON.parse(o.address || '{}');
      } catch (e) {
        address = {};
      }

      return {
        ...o,
        items,
        address
      };
    });

    return NextResponse.json({ orders: formattedOrders });

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

    const { address, paymentMethod, total, items } = await req.json();

    if (!address || !paymentMethod || !total || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Address, payment method, total and items are required' },
        { status: 400 }
      );
    }

    // Database transaction to ensure atomicity
    const transaction = db.transaction(() => {
      // 1. Validate and subtract stock
      for (const item of items) {
        const product = db.prepare('SELECT stock, name FROM products WHERE id = ?').get(item.productId) as any;
        if (!product) {
          throw new Error(`Product not found: ${item.name}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }
        
        // Subtract stock
        db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(
          item.quantity,
          item.productId
        );
      }

      // 2. Generate unique order code
      const code = `FZ-${Math.floor(100000 + Math.random() * 900000)}`;

      // 3. Create the order
      const insertResult = db.prepare(`
        INSERT INTO orders (code, user_id, address, payment_method, total, items, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Pending')
      `).run(
        code,
        authUser.id,
        JSON.stringify(address),
        paymentMethod,
        total,
        JSON.stringify(items)
      );

      return {
        id: insertResult.lastInsertRowid,
        code
      };
    });

    const result = transaction();

    return NextResponse.json({
      message: 'Order placed successfully',
      order: {
        id: result.id,
        code: result.code,
        status: 'Pending',
        total,
        paymentMethod,
        items,
        address
      }
    });

  } catch (error: any) {
    console.error('Order placement error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to place order' },
      { status: 400 }
    );
  }
}
