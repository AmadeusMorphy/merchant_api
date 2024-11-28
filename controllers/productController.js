const supabase = require('../config/supabase');

// controllers/productController.js
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, images, stock, specifications, ...customFields } = req.body;
    const merchantId = req.user.userId;

    // Base product data
    const productData = {
      merchant_id: merchantId,
      title,
      description,
      price,
      category,
      images: JSON.stringify(images), // Store images as a JSON string
      stock,
      specifications
    };

    // Get the current table columns
    const { data: columnData, error: columnsError } = await supabase
      .rpc('get_products_columns');

    if (columnsError) {
      console.error('Error fetching columns:', columnsError);
      return res.status(500).json({ error: 'Error fetching table columns' });
    }

    // Function to add a new column
    const addColumn = async (columnName, columnType) => {
      const { error: alterError } = await supabase.rpc('add_column_to_products', {
        column_name: columnName,
        column_type: columnType
      });

      if (alterError) {
        console.error(`Error adding column ${columnName}:`, alterError);
        return false;
      }
      return true;
    };

    // Check and add any new columns dynamically
    for (const [key, value] of Object.entries(customFields)) {
      if (!columnData.includes(key)) {
        let columnType = typeof value === 'number' ? 'numeric' : 'text';
        const columnAdded = await addColumn(key, columnType);
        if (columnAdded) {
          productData[key] = value;
        }
      } else {
        productData[key] = value;
      }
    }

    // Insert the product
    const { data: product, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
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
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        current: parseInt(page),
        limit: parseInt(limit)
      },
      products
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