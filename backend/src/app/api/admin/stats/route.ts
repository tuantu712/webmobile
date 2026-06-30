import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

function checkAdminAccess(req: NextRequest) {
  const authUser = getAuthUser(req);
  return authUser?.email === 'admin@fuzzy.com';
}

export async function GET(req: NextRequest) {
  try {
    if (!checkAdminAccess(req)) {
      return NextResponse.json({ error: 'Forbidden. Admin access required' }, { status: 403 });
    }

    // 1. Total Revenue (sum of completed orders, or all except cancelled)
    const revenueRow = db.prepare(`
      SELECT SUM(total) as revenue FROM orders
      WHERE status != 'Cancelled'
    `).get() as { revenue: number | null };
    const totalRevenue = revenueRow.revenue || 0;

    // 2. Total Orders
    const ordersRow = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
    const totalOrders = ordersRow.count;

    // 3. Total Users (non-admin)
    const usersRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE email != 'admin@fuzzy.com'").get() as { count: number };
    const totalUsers = usersRow.count;

    // 4. Total Products
    const productsRow = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    const totalProducts = productsRow.count;

    // 5. Low Stock Alert (stock <= 5)
    const lowStockRow = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock <= 5').get() as { count: number };
    const lowStockCount = lowStockRow.count;

    // 6. Recent Orders (top 5)
    const rawRecent = db.prepare(`
      SELECT o.*, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
      LIMIT 5
    `).all() as any[];

    const recentOrders = rawRecent.map(o => {
      let items = [];
      try { items = JSON.parse(o.items || '[]'); } catch (e) {}
      return {
        ...o,
        items
      };
    });

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        lowStockCount
      },
      recentOrders
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
