import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const order = db.prepare(`
      SELECT * FROM orders
      WHERE id = ? AND user_id = ?
    `).get(orderId, authUser.id) as any;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let items = [];
    let address = {};
    
    try {
      items = JSON.parse(order.items || '[]');
    } catch (e) {
      items = [];
    }

    try {
      address = JSON.parse(order.address || '{}');
    } catch (e) {
      address = {};
    }

    return NextResponse.json({
      order: {
        ...order,
        items,
        address
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
