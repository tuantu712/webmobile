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

    const rawOrders = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
    `).all() as any[];

    const orders = rawOrders.map(o => {
      let items = [];
      let address = {};
      
      try { items = JSON.parse(o.items || '[]'); } catch (e) { items = []; }
      try { address = JSON.parse(o.address || '{}'); } catch (e) { address = {}; }

      return {
        ...o,
        items,
        address
      };
    });

    return NextResponse.json({ orders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
