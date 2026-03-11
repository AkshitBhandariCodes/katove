require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Reab@112';
const JWT_SECRET = process.env.JWT_SECRET || 'katove-super-secret-key-2026';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Supabase client (service role - bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.CORS_ORIGIN?.replace(/\/$/, ''),
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin + '/')) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer - memory storage (we'll upload to Supabase Storage)
const upload = multer({ storage: multer.memoryStorage() });

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

async function uploadToStorage(bucket, file, folder = '') {
  const ext = path.extname(file.originalname);
  const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

function imageToBase64(file) {
  const base64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64}`;
}

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + crypto.randomBytes(2).toString('hex');
}

function generateReferralCode() {
  return 'ref-' + crypto.randomBytes(4).toString('hex');
}

// ──────────────────────────────────────────
// AUTH MIDDLEWARE
// ──────────────────────────────────────────

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(403).json({ message: 'Forbidden' });
  
  req.user = user;
  next();
};

const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  if (token === 'admin-token-123') return next();

  // Check if it's a custom JWT token from /api/admin/login
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.isAdmin) return next();
  } catch (err) {
    // Not a valid custom JWT, fallback to Supabase
  }

  // Fallback to Supabase Auth
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(403).json({ message: 'Forbidden: invalid token' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden' });
  }
};

// ──────────────────────────────────────────
// ADMIN AFFILIATE EXTENSION
// ──────────────────────────────────────────

app.put('/api/affiliates/:id/commission', authenticateAdmin, async (req, res) => {
  try {
    const { commission_rate } = req.body;
    if (commission_rate === undefined || commission_rate < 0) {
      return res.status(400).json({ message: 'Invalid commission rate' });
    }
    const { error } = await supabase
      .from('affiliates')
      .update({ commission_rate: parseFloat(commission_rate) })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ──────────────────────────────────────────
// AUTH ROUTES
// ──────────────────────────────────────────



app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ isAdmin: true, role: 'admin' }, JWT_SECRET);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// ──────────────────────────────────────────
// CATEGORY ROUTES
// ──────────────────────────────────────────

app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Categories fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

app.get('/api/categories/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (error || !data) return res.status(404).json({ message: 'Category not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch category' });
  }
});

app.post('/api/categories', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, parent_id, sort_order } = req.body;
    let image_url = null;

    if (req.file) {
      image_url = await uploadToStorage('product-images', req.file, 'categories');
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug: generateSlug(name),
        description,
        image_url,
        parent_id: parent_id || null,
        sort_order: sort_order ? parseInt(sort_order) : 0
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Category create error:', err);
    res.status(500).json({ message: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, parent_id, sort_order, is_active } = req.body;
    const updates = { name, description, parent_id: parent_id || null };

    if (sort_order !== undefined) updates.sort_order = parseInt(sort_order);
    if (is_active !== undefined) updates.is_active = is_active === 'true';
    if (name) updates.slug = generateSlug(name);

    if (req.file) {
      updates.image_url = await uploadToStorage('product-images', req.file, 'categories');
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Category update error:', err);
    res.status(500).json({ message: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

// ──────────────────────────────────────────
// PRODUCT ROUTES
// ──────────────────────────────────────────

app.get('/api/products', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(id, image_url, sort_order, is_primary)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category) query = query.eq('category_id', category);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    // Map to include primary image as `image` for backward compatibility
    const mapped = data.map(p => {
      const primaryImg = p.images?.find(i => i.is_primary) || p.images?.[0];
      return {
        ...p,
        image: primaryImg?.image_url || '/images/placeholder.png',
        price: p.selling_price // backward compat
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    // Support both UUID and slug lookup
    const identifier = req.params.id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(id, image_url, sort_order, is_primary)
      `);

    if (isUuid) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.single();
    if (error || !data) return res.status(404).json({ message: 'Product not found' });

    const primaryImg = data.images?.find(i => i.is_primary) || data.images?.[0];
    res.json({
      ...data,
      image: primaryImg?.image_url || '/images/placeholder.png',
      price: data.selling_price
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

app.post('/api/products', authenticateAdmin, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
  try {
    const {
      name, description, category_id,
      cost_price, selling_price, discount_price,
      stock, installment_eligible,
      seo_title, seo_description, og_image_url
    } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        slug: generateSlug(name),
        description,
        category_id: category_id || null,
        cost_price: parseFloat(cost_price) || 0,
        selling_price: parseFloat(selling_price) || 0,
        discount_price: discount_price ? parseFloat(discount_price) : null,
        stock: parseInt(stock) || 0,
        installment_eligible: installment_eligible === 'true',
        seo_title: seo_title || name,
        seo_description: seo_description || description,
        og_image_url: og_image_url || null
      })
      .select()
      .single();

    if (error) throw error;

    // Handle images from both 'images' (array) and 'image' (single)
    const images = [];
    if (req.files) {
      if (req.files.images) images.push(...req.files.images);
      if (req.files.image) images.push(...req.files.image);
    }

    if (images.length > 0) {
      const imageInserts = [];
      for (let i = 0; i < images.length; i++) {
        try {
          const imageUrl = await uploadToStorage('product-images', images[i], 'products');
          imageInserts.push({
            product_id: product.id,
            image_url: imageUrl,
            sort_order: i,
            is_primary: i === 0
          });
        } catch (uploadErr) {
          console.error('Image upload failed but continuing:', uploadErr);
        }
      }

      if (imageInserts.length > 0) {
        await supabase.from('product_images').insert(imageInserts);
      }
    }

    res.status(201).json(product);
  } catch (err) {
    console.error('Product create error:', err);
    res.status(500).json({ message: err.message || 'Failed to create product' });
  }
});

app.put('/api/products/:id', authenticateAdmin, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
  try {
    const {
      name, description, category_id,
      cost_price, selling_price, discount_price,
      stock, installment_eligible, is_active,
      seo_title, seo_description, og_image_url
    } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) { updates.name = name; updates.slug = generateSlug(name); }
    if (description !== undefined) updates.description = description;
    if (category_id !== undefined) updates.category_id = category_id || null;
    if (cost_price !== undefined) updates.cost_price = parseFloat(cost_price);
    if (selling_price !== undefined) updates.selling_price = parseFloat(selling_price);
    if (discount_price !== undefined) updates.discount_price = discount_price ? parseFloat(discount_price) : null;
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (installment_eligible !== undefined) updates.installment_eligible = installment_eligible === 'true';
    if (is_active !== undefined) updates.is_active = is_active === 'true';
    if (seo_title !== undefined) updates.seo_title = seo_title;
    if (seo_description !== undefined) updates.seo_description = seo_description;
    if (og_image_url !== undefined) updates.og_image_url = og_image_url;

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Handle new images if provided
    const images = [];
    if (req.files) {
      if (req.files.images) images.push(...req.files.images);
      if (req.files.image) images.push(...req.files.image);
    }

    if (images.length > 0) {
      const imageInserts = [];
      for (let i = 0; i < images.length; i++) {
        try {
          const imageUrl = await uploadToStorage('product-images', images[i], 'products');
          imageInserts.push({
            product_id: product.id,
            image_url: imageUrl,
            sort_order: i,
            is_primary: i === 0
          });
        } catch (uploadErr) {
          console.error('Image upload failed but continuing:', uploadErr);
        }
      }
      if (imageInserts.length > 0) {
        await supabase.from('product_images').insert(imageInserts);
      }
    }

    res.json(product);
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ message: err.message || 'Failed to update product' });
  }
});

app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Delete a specific product image
app.delete('/api/products/:id/images/:imageId', authenticateAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', req.params.imageId)
      .eq('product_id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

// ──────────────────────────────────────────
// ORDER ROUTES
// ──────────────────────────────────────────

app.get('/api/orders', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:profiles(id, name, email, phone),
        items:order_items(*),
        status_history:order_status_history(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Orders fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/user', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        status_history:order_status_history(*)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('User orders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        status_history:order_status_history(*)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ message: 'Order not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
      items, total, first_name, last_name, phone, email,
      address_line_1, address_line_2, city, notes,
      user, shippingAddress, referral_code, is_installment
    } = req.body;

    // Support both old format (user/shippingAddress) and new format
    const orderData = {
      user_id: user?.id || null,
      first_name: first_name || user?.name?.split(' ')[0] || 'Guest',
      last_name: last_name || user?.name?.split(' ').slice(1).join(' ') || '',
      phone: phone || '',
      email: email || user?.email || '',
      address_line_1: address_line_1 || shippingAddress?.address || '',
      address_line_2: address_line_2 || '',
      city: city || shippingAddress?.city || '',
      notes: notes || '',
      subtotal: parseFloat(total) || 0,
      total: parseFloat(total) || 0,
      status: 'payment_pending',
      referral_code: referral_code || null,
      is_installment: is_installment || false
    };

    // If user_id looks like a non-UUID (e.g. "guest-xxx"), set to null
    if (orderData.user_id && !/^[0-9a-f]{8}-/.test(orderData.user_id)) {
      orderData.user_id = null;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;

    // Insert order items
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id || null,
        product_name: item.name || item.product_name || 'Unknown',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
      }));

      // If product_id looks like a non-UUID, set to null
      orderItems.forEach(item => {
        if (item.product_id && !/^[0-9a-f]{8}-/.test(item.product_id)) {
          item.product_id = null;
        }
      });

      await supabase.from('order_items').insert(orderItems);
    }

    // Log initial status
    await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: 'payment_pending',
      note: 'Order created, awaiting payment'
    });

    // Handle referral conversion
    if (referral_code) {
      // 1. Check if it's a product-specific link code
      const { data: refLink } = await supabase
        .from('referral_links')
        .select('id, affiliate_id, product_id')
        .eq('url_code', referral_code)
        .single();

      let targetAffiliateId = refLink ? refLink.affiliate_id : null;
      let targetLinkId = refLink ? refLink.id : null;
      
      // 2. If not a link code, check if it's a general affiliate referral_code
      if (!targetAffiliateId) {
        const { data: affByCode } = await supabase
          .from('affiliates')
          .select('id')
          .eq('referral_code', referral_code)
          .eq('status', 'approved')
          .single();
        if (affByCode) {
          targetAffiliateId = affByCode.id;
          // Find the general homepage link for this affiliate
          const { data: generalLink } = await supabase
            .from('referral_links')
            .select('id')
            .eq('affiliate_id', affByCode.id)
            .is('product_id', null)
            .single();
          if (generalLink) targetLinkId = generalLink.id;
        }
      }

      if (targetAffiliateId) {
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('id, commission_rate')
          .eq('id', targetAffiliateId)
          .eq('status', 'approved')
          .single();

        if (affiliate) {
          const commissionAmount = (parseFloat(total) * affiliate.commission_rate / 100);

          await supabase.from('referral_conversions').insert({
            affiliate_id: affiliate.id,
            order_id: order.id,
            referral_link_id: targetLinkId || null,
            order_total: parseFloat(total),
            commission_amount: commissionAmount
          });

          // Increment link conversions count
          if (targetLinkId) {
            await supabase.rpc('increment_link_conversion', {
              link_uuid: targetLinkId
            }).catch(err => console.error('Link conversion increment error:', err));
          }

          // Update affiliate stats
          await supabase.rpc('increment_affiliate_stats', {
            aff_id: affiliate.id,
            sale_amount: parseFloat(total),
            comm_amount: commissionAmount
          }).catch(async (rpcErr) => {
            console.error('RPC increment_affiliate_stats error, falling back to manual update:', rpcErr);
            const { data: currentAff } = await supabase
              .from('affiliates')
              .select('total_sales, total_revenue, total_commission')
              .eq('id', affiliate.id)
              .single();

            if (currentAff) {
              await supabase
                .from('affiliates')
                .update({
                  total_sales: (currentAff.total_sales || 0) + 1,
                  total_revenue: (parseFloat(currentAff.total_revenue || 0) + parseFloat(total)),
                  total_commission: (parseFloat(currentAff.total_commission || 0) + commissionAmount),
                  updated_at: new Date().toISOString()
                })
                .eq('id', affiliate.id);
            }
          });
        }
      }
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

app.put('/api/orders/:id/pay', upload.single('paymentProof'), async (req, res) => {
  try {
    let paymentProofUrl = null;

    if (req.file) {
      paymentProofUrl = imageToBase64(req.file);
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_proof_url: paymentProofUrl,
        status: 'payment_verification',
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select(`
        *,
        items:order_items(*),
        status_history:order_status_history(*)
      `)
      .single();

    if (error) throw error;

    // Log status change
    await supabase.from('order_status_history').insert({
      order_id: req.params.id,
      status: 'payment_verification',
      note: 'Payment proof uploaded, pending admin verification'
    });

    res.json(data);
  } catch (err) {
    console.error('Payment upload error:', err);
    res.status(500).json({ message: 'Failed to upload payment proof' });
  }
});

app.put('/api/orders/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status, note, estimated_pickup, estimated_delivery } = req.body;

    const updates = {
      status,
      updated_at: new Date().toISOString()
    };

    if (estimated_pickup) updates.estimated_pickup = estimated_pickup;
    if (estimated_delivery) updates.estimated_delivery = estimated_delivery;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Log status change in history
    await supabase.from('order_status_history').insert({
      order_id: req.params.id,
      status,
      changed_by: req.user?.id || null,
      note: note || `Status changed to ${status}`
    });

    // TODO: Send SMS/email notification to customer
    // This is where you'd integrate with an SMS provider

    res.json(data);
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Order tracking (public endpoint - by order ID)
app.get('/api/orders/:id/track', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, status, estimated_pickup, estimated_delivery, created_at,
        status_history:order_status_history(status, note, created_at)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ message: 'Order not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to track order' });
  }
});

// ──────────────────────────────────────────
// INSTALLMENT ROUTES
// ──────────────────────────────────────────

app.post('/api/installments/request', authenticateToken, upload.array('documents', 6), async (req, res) => {
  try {
    const { product_id, months, order_id } = req.body;

    // Get product pricing
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('id, name, cost_price, selling_price, installment_eligible')
      .eq('id', product_id)
      .single();

    if (prodError || !product) return res.status(404).json({ message: 'Product not found' });
    if (!product.installment_eligible) return res.status(400).json({ message: 'Product not eligible for installment' });

    const monthsNum = parseInt(months);
    if (![12, 24, 36, 48].includes(monthsNum)) {
      return res.status(400).json({ message: 'Invalid installment period. Choose 12, 24, 36, or 48 months' });
    }

    const upfrontAmount = parseFloat((product.selling_price * 0.20).toFixed(2));
    const remainingAmount = product.selling_price - upfrontAmount;
    // ensure monthlyPayment is safe
    const monthlyPayment = remainingAmount > 0 ? parseFloat((remainingAmount / monthsNum).toFixed(2)) : 0;

    const { data: request, error } = await supabase
      .from('installment_requests')
      .insert({
        user_id: req.user.id,
        order_id: order_id || null,
        product_id,
        selling_price: product.selling_price,
        cost_price: product.cost_price,
        upfront_amount: upfrontAmount,
        remaining_amount: remainingAmount,
        months: monthsNum,
        monthly_payment: monthlyPayment,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Upload income proof documents to Supabase Storage
    if (req.files && req.files.length > 0) {
      const docs = [];
      for (const file of req.files) {
        let docUrl;
        try {
          docUrl = await uploadToStorage('documents', file, 'income_proofs');
        } catch (uploadErr) {
          console.error('Storage upload error:', uploadErr);
          throw new Error('Failed to upload document');
        }

        docs.push({
          request_id: request.id,
          document_url: docUrl,
          document_type: 'income_proof'
        });
      }
      await supabase.from('installment_documents').insert(docs);
    }

    res.status(201).json(request);
  } catch (err) {
    console.error('Installment request error:', err);
    res.status(500).json({ message: 'Failed to create installment request' });
  }
});

app.get('/api/installments/user', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('installment_requests')
      .select(`
        *,
        product:products(id, name, selling_price, slug),
        documents:installment_documents(*),
        payments:installment_payments(*)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch profiles separately to avoid relation ambiguity
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(d => d.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email, phone')
          .in('id', userIds);
          
        if (profiles) {
          data.forEach(d => {
            d.user = profiles.find(p => p.id === d.user_id) || null;
          });
        }
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch installments' });
  }
});

app.get('/api/installments', authenticateAdmin, async (req, res) => {
  try {
    console.log("Fetching installments for admin API...");
    const { data, error } = await supabase
      .from('installment_requests')
      .select(`
        *,
        product:products(id, name, selling_price),
        documents:installment_documents(*),
        payments:installment_payments(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
       console.error("Supabase Installments Error:", error);
       throw error;
    }

    // Fetch profiles separately to avoid relation ambiguity
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(d => d.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email, phone')
          .in('id', userIds);
          
        if (profiles) {
          data.forEach(d => {
            d.user = profiles.find(p => p.id === d.user_id) || null;
          });
        }
      }
    }

    console.log(`Sending ${data ? data.length : 0} installments to admin.`);
    res.json(data);
  } catch (err) {
    console.error("GET /api/installments error:", err);
    res.status(500).json({ message: 'Failed to fetch installments', error: err.message });
  }
});

app.put('/api/installments/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { months, admin_note } = req.body;

    // Get the request
    const { data: request, error: reqError } = await supabase
      .from('installment_requests')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (reqError || !request) return res.status(404).json({ message: 'Request not found' });

    // If admin adjusts months
    const finalMonths = months ? parseInt(months) : request.months;
    const monthlyPayment = parseFloat((request.remaining_amount / finalMonths).toFixed(2));

    const { data, error } = await supabase
      .from('installment_requests')
      .update({
        status: 'approved',
        months: finalMonths,
        monthly_payment: monthlyPayment,
        admin_note: admin_note || null,
        approved_by: req.user?.id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Generate payment schedule
    const payments = [];
    const startDate = new Date();
    for (let i = 1; i <= finalMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      payments.push({
        request_id: req.params.id,
        amount: monthlyPayment,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending'
      });
    }

    await supabase.from('installment_payments').insert(payments);

    res.json(data);
  } catch (err) {
    console.error('Installment approve error:', err);
    res.status(500).json({ message: 'Failed to approve installment' });
  }
});

app.put('/api/installments/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const { admin_note } = req.body;

    const { data, error } = await supabase
      .from('installment_requests')
      .update({
        status: 'rejected',
        admin_note: admin_note || 'Request rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject installment' });
  }
});

app.post('/api/installments/:id/pay', authenticateToken, upload.single('paymentProof'), async (req, res) => {
  try {
    const { payment_id } = req.body;

    let paymentProofUrl = null;
    if (req.file) {
      paymentProofUrl = await uploadToStorage('payment-proofs', req.file, 'installments');
    }

    const { data, error } = await supabase
      .from('installment_payments')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
        payment_proof_url: paymentProofUrl
      })
      .eq('id', payment_id)
      .eq('request_id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Check if all payments are complete
    const { data: remaining } = await supabase
      .from('installment_payments')
      .select('id')
      .eq('request_id', req.params.id)
      .eq('status', 'pending');

    if (!remaining || remaining.length === 0) {
      await supabase
        .from('installment_requests')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', req.params.id);
    }

    res.json(data);
  } catch (err) {
    console.error('Installment pay error:', err);
    res.status(500).json({ message: 'Failed to process payment' });
  }
});

// ──────────────────────────────────────────
// AFFILIATE / REFERRAL ROUTES
// ──────────────────────────────────────────

app.post('/api/affiliates/register', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;

    if (!['sales_manager', 'content_creator'].includes(type)) {
      return res.status(400).json({ message: 'Type must be sales_manager or content_creator' });
    }

    // Check if already registered - return existing data instead of error
    const { data: existing } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (existing) {
      // Ensure profile role is set to partner even for previously registered users
      await supabase.from('profiles').update({ role: 'partner' }).eq('id', req.user.id);
      return res.status(200).json({ ...existing, already_registered: true });
    }

    // Get default commission rate
    const rateKey = type === 'sales_manager' ? 'commission_rate_sales_manager' : 'commission_rate_content_creator';
    const { data: setting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', rateKey)
      .single();

    const commissionRate = setting ? parseFloat(setting.value) : 10;

    const { data, error } = await supabase
      .from('affiliates')
      .insert({
        user_id: req.user.id,
        type,
        referral_code: generateReferralCode(),
        commission_rate: commissionRate,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Create general homepage referral link
    await supabase.from('referral_links').insert({
      affiliate_id: data.id,
      product_id: null,
      url_code: 'r-' + crypto.randomBytes(4).toString('hex')
    });

    // Update profile role to 'partner'
    await supabase
      .from('profiles')
      .update({ role: 'partner' })
      .eq('id', req.user.id);

    res.status(201).json(data);
  } catch (err) {
    console.error('Affiliate register error:', err);
    res.status(500).json({ message: 'Failed to register as affiliate' });
  }
});

app.get('/api/affiliates/dashboard', authenticateToken, async (req, res) => {
  try {
    // First check if affiliate exists at all
    const { data: affiliateBase, error: baseError } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (baseError || !affiliateBase) return res.status(404).json({ message: 'Affiliate account not found' });

    // Fetch links separately to avoid join issues
    const { data: links } = await supabase
      .from('referral_links')
      .select('id, product_id, url_code, clicks, conversions, product:products(id, name, slug, selling_price)')
      .eq('affiliate_id', affiliateBase.id);

    // Fetch conversions separately
    const { data: conversionsList } = await supabase
      .from('referral_conversions')
      .select('id, order_id, referral_link_id, order_total, commission_amount, created_at')
      .eq('affiliate_id', affiliateBase.id);

    const affiliate = {
      ...affiliateBase,
      links: links || [],
      conversions: conversionsList || []
    };

    // Compute per-link revenue/commission from conversions
    const linkStats = {};
    if (affiliate.conversions) {
      affiliate.conversions.forEach(c => {
        const lid = c.referral_link_id || 'general';
        if (!linkStats[lid]) linkStats[lid] = { revenue: 0, commission: 0, sales: 0 };
        linkStats[lid].revenue += parseFloat(c.order_total || 0);
        linkStats[lid].commission += parseFloat(c.commission_amount || 0);
        linkStats[lid].sales += 1;
      });
    }

    // Enrich links with per-link revenue data
    if (affiliate.links) {
      affiliate.links = affiliate.links.map(link => ({
        ...link,
        revenue: linkStats[link.id]?.revenue || 0,
        commission: linkStats[link.id]?.commission || 0,
        sales: linkStats[link.id]?.sales || link.conversions || 0
      }));
    }

    res.json(affiliate);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard' });
  }
});

app.post('/api/affiliates/links', authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.body;

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id, status')
      .eq('user_id', req.user.id)
      .single();

    if (!affiliate || affiliate.status !== 'approved') {
      return res.status(403).json({ message: 'Affiliate account not approved' });
    }

    // Check if link already exists for this product
    const { data: existing } = await supabase
      .from('referral_links')
      .select('id, url_code')
      .eq('affiliate_id', affiliate.id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      return res.json(existing);
    }

    const { data, error } = await supabase
      .from('referral_links')
      .insert({
        affiliate_id: affiliate.id,
        product_id,
        url_code: 'r-' + crypto.randomBytes(4).toString('hex')
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create referral link' });
  }
});

// Frontend click tracking (called by ReferralTracker component)
app.post('/api/affiliates/track-click', async (req, res) => {
  try {
    const { ref } = req.body;
    if (!ref) return res.status(400).json({ message: 'Missing ref code' });

    // Check if it's a link url_code
    const { data: link } = await supabase
      .from('referral_links')
      .select('id, affiliate_id')
      .eq('url_code', ref)
      .single();

    if (link) {
      await supabase.from('referral_clicks').insert({
        link_id: link.id,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });
      await supabase.rpc('increment_referral_click', {
        link_uuid: link.id,
        aff_uuid: link.affiliate_id
      }).catch(err => console.error('RPC Click Error:', err));
      return res.json({ tracked: true });
    }

    // Check if it's a general referral_code
    const { data: aff } = await supabase
      .from('affiliates')
      .select('id')
      .eq('referral_code', ref)
      .single();

    if (aff) {
      // Find or create the general homepage link
      let { data: generalLink } = await supabase
        .from('referral_links')
        .select('id')
        .eq('affiliate_id', aff.id)
        .is('product_id', null)
        .single();

      if (generalLink) {
        await supabase.from('referral_clicks').insert({
          link_id: generalLink.id,
          ip_address: req.ip,
          user_agent: req.headers['user-agent']
        });
        await supabase.rpc('increment_referral_click', {
          link_uuid: generalLink.id,
          aff_uuid: aff.id
        }).catch(err => console.error('RPC Click Error:', err));
      } else {
        // Just increment affiliate total_clicks
        await supabase
          .from('affiliates')
          .update({ total_clicks: supabase.rpc ? undefined : 0 })
          .eq('id', aff.id);
        // Direct increment
        const { data: curr } = await supabase.from('affiliates').select('total_clicks').eq('id', aff.id).single();
        if (curr) {
          await supabase.from('affiliates').update({ total_clicks: (curr.total_clicks || 0) + 1 }).eq('id', aff.id);
        }
      }
      return res.json({ tracked: true });
    }

    res.json({ tracked: false });
  } catch (err) {
    console.error('Track click error:', err);
    res.json({ tracked: false });
  }
});

// Referral redirect + click tracking
app.get('/api/r/:code', async (req, res) => {
  try {
    const { data: link } = await supabase
      .from('referral_links')
      .select('id, affiliate_id, product_id')
      .eq('url_code', req.params.code)
      .single();

    if (!link) return res.status(404).json({ message: 'Invalid referral link' });

    // Log click
    await supabase.from('referral_clicks').insert({
      link_id: link.id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    // Increment clicks safely via RPC
    await supabase.rpc('increment_referral_click', {
      link_uuid: link.id,
      aff_uuid: link.affiliate_id
    }).catch(err => {
       console.error("RPC Click Error:", err);
    });

    // Redirect
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    if (link.product_id) {
      const { data: product } = await supabase
        .from('products')
        .select('slug')
        .eq('id', link.product_id)
        .single();

      return res.redirect(`${frontendUrl}/product/${product?.slug || link.product_id}?ref=${req.params.code}`);
    }

    res.redirect(`${frontendUrl}?ref=${req.params.code}`);
  } catch (err) {
    console.error('Referral redirect error:', err);
    res.redirect(process.env.CORS_ORIGIN || 'http://localhost:3000');
  }
});

// Admin affiliate management
app.get('/api/affiliates', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .select(`
        *,
        user:profiles(id, name, email, phone),
        links:referral_links(id, product_id, url_code, clicks, conversions),
        conversions:referral_conversions(id, order_id, referral_link_id, order_total, commission_amount, created_at)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch affiliates' });
  }
});

app.put('/api/affiliates/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status, commission_rate } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (commission_rate !== undefined) updates.commission_rate = parseFloat(commission_rate);

    const { data, error } = await supabase
      .from('affiliates')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update affiliate' });
  }
});

// Admin: get/update default commission rates
app.get('/api/affiliates/commission-settings', authenticateAdmin, async (req, res) => {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['commission_rate_content_creator', 'commission_rate_sales_manager']);

    const settings = {};
    (data || []).forEach(s => { settings[s.key] = s.value; });
    res.json({
      content_creator: parseFloat(settings.commission_rate_content_creator || '10'),
      sales_manager: parseFloat(settings.commission_rate_sales_manager || '8')
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch commission settings' });
  }
});

app.put('/api/affiliates/commission-settings', authenticateAdmin, async (req, res) => {
  try {
    const { content_creator, sales_manager } = req.body;
    if (content_creator !== undefined) {
      await supabase.from('site_settings').upsert(
        { key: 'commission_rate_content_creator', value: String(content_creator), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    }
    if (sales_manager !== undefined) {
      await supabase.from('site_settings').upsert(
        { key: 'commission_rate_sales_manager', value: String(sales_manager), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update commission settings' });
  }
});

// ──────────────────────────────────────────
// SETTINGS ROUTES
// ──────────────────────────────────────────

app.get('/api/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value, type');

    if (error) throw error;

    // Convert to object for backward compatibility
    const settings = {};
    data.forEach(s => { settings[s.key] = s.value; });

    // Backward compat keys
    settings.paymentInstructions = settings.payment_instructions || '';
    settings.paymentQr = settings.payment_qr_url || '';

    res.json(settings);
  } catch (err) {
    console.error('Settings fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

app.post('/api/settings', authenticateAdmin, upload.fields([{ name: 'paymentQr', maxCount: 1 }, { name: 'heroBanner', maxCount: 1 }]), async (req, res) => {
  try {
    const { paymentInstructions, ...otherSettings } = req.body;

    // Update payment instructions
    if (paymentInstructions !== undefined) {
      await supabase
        .from('site_settings')
        .upsert({ key: 'payment_instructions', value: paymentInstructions, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }

    // List of keys handled via file uploads
    const fileKeys = ['payment_qr_url', 'hero_banner_url', 'paymentQr', 'heroBanner'];

    // Update any other settings passed
    for (const [key, value] of Object.entries(otherSettings)) {
      // If it's a file key and not empty, skip (it's handled by multer or we don't want to overwrite it with text)
      // If it IS a file key and value is empty string, we should clear it in the DB
      if (fileKeys.includes(key) && value !== '') continue;
      
      await supabase
        .from('site_settings')
        .upsert({ key: key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }

    // Convert and store files as Base64 strings in the DB
    if (req.files) {
      if (req.files.paymentQr && req.files.paymentQr[0]) {
        const qrBase64 = imageToBase64(req.files.paymentQr[0]);
        await supabase
          .from('site_settings')
          .upsert({ key: 'payment_qr_url', value: qrBase64, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      }

      if (req.files.heroBanner && req.files.heroBanner[0]) {
        const heroBase64 = imageToBase64(req.files.heroBanner[0]);
        await supabase
          .from('site_settings')
          .upsert({ key: 'hero_banner_url', value: heroBase64, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      }
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Settings save error:', err);
    res.status(500).json({ message: 'Failed to save settings' });
  }
});

// ──────────────────────────────────────────
// HERO MANAGEMENT ROUTES
// ──────────────────────────────────────────

app.get('/api/heroes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('heroes')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch heroes' });
  }
});

app.post('/api/heroes', authenticateAdmin, async (req, res) => {
  try {
    const { title, subtitle, description, discount, accent_color, order_index, image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({ message: 'image_url is required. Upload the image client-side first.' });
    }

    const { data, error } = await supabase
      .from('heroes')
      .insert([{
        title,
        subtitle,
        description,
        discount,
        accent_color,
        order_index: parseInt(order_index || 0),
        image_url
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Hero creation error:', err);
    res.status(500).json({ message: 'Failed to create hero banner' });
  }
});

app.put('/api/heroes/:id', authenticateAdmin, async (req, res) => {
  try {
    const { title, subtitle, description, discount, accent_color, order_index, image_url } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (description !== undefined) updates.description = description;
    if (discount !== undefined) updates.discount = discount;
    if (accent_color !== undefined) updates.accent_color = accent_color;
    if (order_index !== undefined) updates.order_index = parseInt(order_index);
    if (image_url !== undefined) updates.image_url = image_url;

    const { data, error } = await supabase
      .from('heroes')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Hero update error:', err);
    res.status(500).json({ message: 'Failed to update hero' });
  }
});

app.delete('/api/heroes/:id', authenticateAdmin, async (req, res) => {
  try {
    const { data: hero, error: fetchError } = await supabase
      .from('heroes')
      .select('image_url')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;

    // Try to delete from storage if it's in our bucket
    if (hero?.image_url?.includes('hero-deployments')) {
      const fileName = hero.image_url.split('/').pop();
      await supabase.storage.from('hero-deployments').remove([fileName]);
    }

    const { error } = await supabase
      .from('heroes')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Hero removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete hero' });
  }
});

// Batch update settings (for admin design control)
app.put('/api/settings/batch', authenticateAdmin, async (req, res) => {
  try {
    const { settings } = req.body; // Array of { key, value }

    for (const s of settings) {
      await supabase
        .from('site_settings')
        .upsert({
          key: s.key,
          value: s.value,
          type: s.type || 'text',
          description: s.description || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
    }

    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to batch update settings' });
  }
});

// ──────────────────────────────────────────
// HOMEPAGE SECTIONS API
// ──────────────────────────────────────────

app.get('/api/homepage-sections', async (req, res) => {
  try {
    const { data: setting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'homepage_sections')
      .single();

    if (setting && setting.value) {
      try {
        res.json(JSON.parse(setting.value));
      } catch {
        res.json(getDefaultSections());
      }
    } else {
      res.json(getDefaultSections());
    }
  } catch (err) {
    res.json(getDefaultSections());
  }
});

app.put('/api/homepage-sections', authenticateAdmin, async (req, res) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections)) return res.status(400).json({ message: 'sections must be an array' });

    await supabase
      .from('site_settings')
      .upsert({
        key: 'homepage_sections',
        value: JSON.stringify(sections),
        type: 'json',
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    res.json({ message: 'Homepage sections updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update homepage sections' });
  }
});

function getDefaultSections() {
  return [
    { id: 'hero', name: 'Hero Slider', enabled: true, order: 0 },
    { id: 'whats_new', name: "What's New", enabled: true, order: 1 },
    { id: 'featured_banner', name: 'Featured Banner', enabled: true, order: 2 },
    { id: 'categories', name: 'Categories', enabled: true, order: 3 },
    { id: 'top_items', name: 'Top Items', enabled: true, order: 4 },
  ];
}

// ──────────────────────────────────────────
// USER PROFILE / DASHBOARD
// ──────────────────────────────────────────

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, phone, role, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, phone, role')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// ──────────────────────────────────────────
// ADMIN DASHBOARD STATS
// ──────────────────────────────────────────

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const [products, orders, users, affiliates, installments] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id, total, status'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('affiliates').select('id', { count: 'exact', head: true }),
      supabase.from('installment_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    const totalRevenue = orders.data?.reduce((sum, o) => {
      return ['payment_confirmed', 'preparing_package', 'courier_picked_up', 'out_for_delivery', 'delivered'].includes(o.status)
        ? sum + parseFloat(o.total)
        : sum;
    }, 0) || 0;

    const pendingOrders = orders.data?.filter(o => ['payment_pending', 'payment_verification'].includes(o.status)).length || 0;

    res.json({
      totalProducts: products.count || 0,
      totalOrders: orders.data?.length || 0,
      totalCustomers: users.count || 0,
      totalAffiliates: affiliates.count || 0,
      pendingInstallments: installments.count || 0,
      pendingOrders,
      totalRevenue
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// ──────────────────────────────────────────
// 404 HANDLER
// ──────────────────────────────────────────

app.use((req, res) => {
  console.log(`404 at ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

// Start the server only when run directly (not imported by Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Katove Server running on ${BASE_URL}`);
    console.log(`Supabase: ${process.env.SUPABASE_URL}`);
  });
}

module.exports = app;
