import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

let dbPath = path.resolve(process.cwd(), 'database.sqlite');

// Vercel Serverless environment workaround:
// The root filesystem is read-only, so we copy the DB to /tmp if running on Vercel.
if (process.env.VERCEL === '1') {
  const tmpPath = path.join('/tmp', 'database.sqlite');
  try {
    if (!fs.existsSync(tmpPath)) {
      console.log(`Copying database from ${dbPath} to ${tmpPath}`);
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, tmpPath);
      } else {
        console.warn(`Source database not found at ${dbPath}, a new empty database will be created at ${tmpPath}`);
      }
    }
    dbPath = tmpPath;
  } catch (err) {
    console.error('Failed to copy database to /tmp:', err);
  }
}

const db = new Database(dbPath);

// Enable WAL mode for performance and concurrency
db.pragma('journal_mode = WAL');

// Create schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    birthday TEXT,
    avatar TEXT,
    addresses TEXT, -- JSON array of addresses
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL -- icon identifier or image URL
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    prev_price REAL,
    image TEXT NOT NULL,
    images TEXT, -- JSON array of image URLs
    sizes TEXT, -- JSON array of sizes
    colors TEXT, -- JSON array of colors
    category_id INTEGER,
    stock INTEGER DEFAULT 10,
    rating REAL DEFAULT 4.5,
    save_amount REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    address TEXT NOT NULL, -- JSON object
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Preparing', 'Shipping', 'Completed', 'Cancelled'
    total REAL NOT NULL,
    items TEXT NOT NULL, -- JSON array of order items
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Check if seeding is needed
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

if (userCount.count === 0) {
  console.log('Seeding database...');
  
  // Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (email, password, name, phone, birthday, avatar, addresses)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const hashedPassword = bcrypt.hashSync('123456', 10);
  
  // Create an admin
  insertUser.run(
    'admin@fuzzy.com',
    hashedPassword,
    'Fuzzy Admin',
    '0987654321',
    '1990-01-01',
    'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/icons/profile.png',
    JSON.stringify([
      {
        id: 'addr-1',
        title: 'Home',
        receiver: 'Fuzzy Admin',
        phone: '0987654321',
        detail: '123 Admin Street, District 1',
        city: 'Ho Chi Minh City',
        isDefault: true
      }
    ])
  );

  // Create a demo customer
  insertUser.run(
    'user@fuzzy.com',
    hashedPassword,
    'Agasya',
    '0123456789',
    '1995-05-15',
    'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/icons/profile.png',
    JSON.stringify([
      {
        id: 'addr-2',
        title: 'Home',
        receiver: 'Agasya',
        phone: '0123456789',
        detail: '456 User Lane, Ward 2',
        city: 'Hanoi',
        isDefault: true
      },
      {
        id: 'addr-3',
        title: 'Office',
        receiver: 'Agasya Corp',
        phone: '0988887777',
        detail: '789 Corporate tower, District 3',
        city: 'Ho Chi Minh City',
        isDefault: false
      }
    ])
  );

  // Seed Categories
  const insertCategory = db.prepare(`
    INSERT INTO categories (slug, name, icon)
    VALUES (?, ?, ?)
  `);

  insertCategory.run('sofa', 'Sofa', 'sofa');
  insertCategory.run('chair', 'Chair', 'chair');
  insertCategory.run('table', 'Table', 'table');
  insertCategory.run('cabinets', 'Cabinets', 'cabinets');
  insertCategory.run('cupboard', 'Cupboard', 'cupboard');
  insertCategory.run('lamp', 'Lamp', 'lamp');

  // Seed Products
  const categoriesList = db.prepare('SELECT id, slug FROM categories').all() as { id: number, slug: string }[];
  const catMap = new Map(categoriesList.map(c => [c.slug, c.id]));

  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, prev_price, image, images, sizes, colors, category_id, stock, rating, save_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const mockProducts = [
    {
      name: 'Buddy Chair',
      description: 'Modern saddle arms with extra padding for maximum comfort and style. Features standard metal legs and durable fabric upholstery.',
      price: 14,
      prev_price: 20,
      image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/1.png',
      images: ['https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/1.png', 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/2.png'],
      sizes: ['Standard', 'Large'],
      colors: ['Gray', 'Blue', 'Black'],
      category: 'chair',
      stock: 12,
      rating: 4.5,
      save_amount: 6
    },
    {
      name: 'Wingback Chair',
      description: 'Classic wingback design updated with clean modern saddle arms. Perfect for a cozy reading nook or home office.',
      price: 18,
      prev_price: 25,
      image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/2.png',
      images: ['https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/2.png', 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/3.png'],
      sizes: ['Standard'],
      colors: ['Yellow', 'Gray', 'Black'],
      category: 'chair',
      stock: 8,
      rating: 4.3,
      save_amount: 7
    },
    {
      name: 'Classic Arm Chair',
      description: 'A stylish addition to any living space, this arm chair merges mid-century modern aesthetic with everyday function.',
      price: 25,
      prev_price: 35,
      image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/3.png',
      images: ['https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/3.png'],
      sizes: ['Standard'],
      colors: ['Blue', 'Gray', 'Black'],
      category: 'chair',
      stock: 5,
      rating: 4.7,
      save_amount: 10
    },
    {
      name: 'Mid Century Sofa',
      description: 'Elegant mid-century sofa with tufted cushions and tapered wooden legs. Built for lasting durability and supreme comfort.',
      price: 999,
      prev_price: 1200,
      image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/4.png',
      images: ['https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/4.png', 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/1.png'],
      sizes: ['3-Seater', 'L-Shape'],
      colors: ['Blue', 'Gray', 'Green'],
      category: 'sofa',
      stock: 4,
      rating: 4.8,
      save_amount: 201
    },
    {
      name: 'Beige Lounge Chair',
      description: 'Premium lounge chair upholstered in a soft beige linen blend. Ideal for relaxing afternoons with a book.',
      price: 37,
      prev_price: 50,
      image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/5.png',
      images: ['https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/5.png'],
      sizes: ['Standard'],
      colors: ['Yellow', 'Gray'],
      category: 'chair',
      stock: 15,
      rating: 4.4,
      save_amount: 13
    },
    {
      name: 'Study Table Lamp',
      description: 'Minimalist bedroom and study table lamp. Features adjustable brightness settings and high energy efficiency.',
      price: 37,
      prev_price: 45,
      image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/6.png',
      images: ['https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/6.png', 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/13.png'],
      sizes: ['Small', 'Medium'],
      colors: ['Black', 'White', 'Yellow'],
      category: 'lamp',
      stock: 20,
      rating: 4.9,
      save_amount: 8
    },
    {
      name: 'Solid Wood Side Table',
      description: 'Handcrafted solid wood console side table. Perfect for displaying decor or keeping essentials close by.',
      price: 48,
      prev_price: 65,
      image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/7.png',
      images: ['https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/7.png'],
      sizes: ['Standard'],
      colors: ['Brown', 'Gray'],
      category: 'table',
      stock: 10,
      rating: 4.6,
      save_amount: 17
    },
    {
      name: 'Executive Lounge Chair',
      description: 'Upholstered leather lounge chair with premium metal framing, providing both a professional look and comfort.',
      price: 75,
      prev_price: 99,
      image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/8.png',
      images: ['https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/8.png'],
      sizes: ['Standard'],
      colors: ['Black', 'Brown'],
      category: 'chair',
      stock: 6,
      rating: 4.5,
      save_amount: 24
    },
    {
      name: 'Modern Swing Chair',
      description: 'Indoor/outdoor modern steel frame swing chair with a weather-resistant cushion. The perfect relaxation spot.',
      price: 150,
      prev_price: 200,
      image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/9.png',
      images: ['https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/9.png'],
      sizes: ['Standard'],
      colors: ['Gray', 'Black'],
      category: 'chair',
      stock: 3,
      rating: 4.8,
      save_amount: 50
    },
    {
      name: 'Bubble Swing Chair',
      description: 'Futuristic acrylic bubble hanging swing chair. Adds a unique luxury centerpiece to any room.',
      price: 120,
      prev_price: 180,
      image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/10.png',
      images: ['https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/10.png'],
      sizes: ['Standard'],
      colors: ['Clear'],
      category: 'chair',
      stock: 5,
      rating: 4.6,
      save_amount: 60
    },
    {
      name: 'Classic Lamp',
      description: 'Elegant hanging metal light shade. Offers a warm ambiance to dining rooms or bedrooms.',
      price: 29,
      prev_price: 40,
      image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/13.png',
      images: ['https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/13.png'],
      sizes: ['Standard'],
      colors: ['Black', 'Gold'],
      category: 'lamp',
      stock: 30,
      rating: 4.2,
      save_amount: 11
    }
  ];

  for (const p of mockProducts) {
    const catId = catMap.get(p.category) || null;
    insertProduct.run(
      p.name,
      p.description,
      p.price,
      p.prev_price,
      p.image,
      JSON.stringify(p.images),
      JSON.stringify(p.sizes),
      JSON.stringify(p.colors),
      catId,
      p.stock,
      p.rating,
      p.save_amount
    );
  }
  console.log('Database seeded successfully!');
}

export default db;
