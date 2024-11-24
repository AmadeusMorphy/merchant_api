const supabase = require('../config/supabase');

const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, images, stock, specifications } = req.body;
    const merchantId = req.user.userId;

    const { data: product, error } = await supabase
      .from('products')
      .insert([
        {
          merchant_id: merchantId,
          title,
          description,
          price,
          category,
          images,
          stock,
          specifications
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, minPrice, maxPrice, merchant } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*, merchants:users!merchant_id(full_name)', { count: 'exact' });

    if (merchant) query = query.eq('merchant_id', merchant);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);
    if (minPrice) query = query.gte('price', minPrice);
    if (maxPrice) query = query.lte('price', maxPrice);

    query = query.range(offset, offset + limit - 1);

    const { data: products, count, error } = await query;

    if (error) throw error;

    res.json({
      products,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        current: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdmins = async (req, res) => {
  try {
    const { data: merchants, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_type', 'admin');

    if (error) throw error;

    res.json(merchants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductsByMerchant = async (req, res) => {
  try {
    const { merchant_id } = req.query; // Retrieve merchant_id from query params

    if (!merchant_id) {
      return res.status(400).json({ error: 'Merchant ID is required' });
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*') // Include specific fields or relations as needed
      .eq('merchant_id', merchant_id); // Filter by merchant_id

    if (error) throw error;

    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductsByMerchant
};