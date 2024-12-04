const supabase = require('../config/supabase');

// controllers/productController.js
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, mainImage, prodColors, stock, specifications, countryOfOrigin, ...customFields } = req.body;
    const merchantId = req.user.userId;

    // Base product data
    const productData = {
      merchant_id: merchantId,
      title,
      description,
      price,
      category,
      mainImage,
      prodColors,
      stock,
      specifications,
      countryOfOrigin
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
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (productError) throw productError;

    // Fetch the merchant's current products
    const { data: merchantData, error: merchantFetchError } = await supabase
      .from('merchants')
      .select('products')
      .eq('id', merchantId)
      .single();

    if (merchantFetchError) {
      console.error('Error fetching merchant data:', merchantFetchError);
      return res.status(500).json({ error: 'Error updating merchant data' });
    }

    // Prepare the updated products array
    const updatedProducts = merchantData.products || [];
    updatedProducts.push({ id: product.id });

    // Update the merchant's products
    const { error: merchantUpdateError } = await supabase
      .from('merchants')
      .update({ products: updatedProducts })
      .eq('id', merchantId);

    if (merchantUpdateError) {
      console.error('Error updating merchant products:', merchantUpdateError);
      return res.status(500).json({ error: 'Error updating merchant data' });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, minPrice, maxPrice, merchant, countryOfOrigin } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*, merchants:users!merchant_id(full_name)', { count: 'exact' });

    if (merchant) query = query.eq('merchant_id', merchant);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);
    if (minPrice) query = query.gte('price', minPrice);
    if (maxPrice) query = query.lte('price', maxPrice);
    if (countryOfOrigin) query = query.lte('countryOfOrigin', countryOfOrigin);

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


const getProductsByMerchant = async (req, res) => {
  try {
    const { 
      merchant_id, 
      page = 1, 
      limit = 20 
    } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (!merchant_id) {
      return res.status(400).json({ error: 'Merchant ID is required' });
    }

    // Calculate offset
    const offset = (pageNum - 1) * limitNum;

    // Query to get total count of products for this merchant
    const { count: totalProducts, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('merchant_id', merchant_id);

    if (countError) throw countError;

    // Query to get paginated products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('merchant_id', merchant_id)
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    // Calculate pagination metadata
    const pagination = {
      total: totalProducts,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalProducts / limitNum)
    };

    res.json({ 
      pagination,
      products 
    });
  } catch (error) {
    console.error('Error fetching merchant products:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductsByMerchant
};