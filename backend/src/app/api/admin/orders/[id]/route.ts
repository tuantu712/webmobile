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
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const { status } = await req.json();
    const validStatuses = ['Pending', 'Preparing', 'Shipping', 'Completed', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Get current order status
    const currentOrder = db.prepare('SELECT status, items FROM orders WHERE id = ?').get(orderId) as any;
    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = currentOrder.status;

    // Run in database transaction
    const transaction = db.transaction(() => {
      // Update status
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);

      // Stock management upon cancellation
      if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
        // Restore stock
        let items = [];
        try { items = JSON.parse(currentOrder.items || '[]'); } catch (e) { items = []; }

        for (const item of items) {
          db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(
            item.quantity,
            item.productId
          );
        }
      } else if (oldStatus === 'Cancelled' && status !== 'Cancelled') {
        // Deduct stock again (if moving away from cancelled)
        let items = [];
        try { items = JSON.parse(currentOrder.items || '[]'); } catch (e) { items = []; }

        for (const item of items) {
          const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(item.productId) as any;
          if (product && product.stock >= item.quantity) {
            db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(
              item.quantity,
              item.productId
            );
          } else {
            throw new Error(`Cannot restore order. Insufficient stock for product: ${item.name}`);
          }
        }
      }
    });

    transaction();

    return NextResponse.json({ message: 'Order status updated successfully' });

  } catch (error: any) {
    console.error('Order status update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 400 });
  }
}
