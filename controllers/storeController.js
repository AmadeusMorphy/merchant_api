const supabase = require('../config/supabase');


const createStore = async (req, res) => {
  try {
    const { name, location, products, store_logo, store_bg, images, categories, reg_number } = req.body;
    const merchantId = req.user.userId;

    // Base store data
    const storeData = {
      merchant_id: merchantId,
      name,
      location,
      products,
      store_logo,
      store_bg,
      images,
      categories,
      reg_number,
      status: 'Active'
    };


    // Insert the store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert([storeData])
      .select()
      .single();

    if (storeError) throw storeError;

    // Fetch the merchant's current store
    const { data: merchantData, error: merchantFetchError } = await supabase
      .from('merchants')
      .select('stores')
      .eq('id', merchantId)
      .single();

    if (merchantFetchError) {
      console.error('Error fetching merchant data:', merchantFetchError);
      return res.status(500).json({ error: 'Error updating merchant data' });
    }

    // Prepare the updated stores array
    const updateStore = merchantData.stores || [];
    updateStore.push({ id: store.id });

    // Update the merchant's store
    const { error: merchantUpdateError } = await supabase
      .from('merchants')
      .update({ stores: updateStore })
      .eq('id', merchantId);

    if (merchantUpdateError) {
      console.error('Error updating merchant store:', merchantUpdateError);
      return res.status(500).json({ error: 'Error updating merchant data' });
    }

    res.status(201).json(store);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
};

const getStoreById = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    let query = supabase
      .from('stores')
      .select('*', { count: 'exact' })
      .eq('id', id)
      .range(offset, offset + limit - 1);

    const { data: stores, count, error } = await query;

    if (error) {
      console.error('Error fetching store profile:', error);
      return res.status(500).json({ error: 'Failed to fetch store' });
    }

    res.json({
      pagination: {
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        current: parseInt(page),
        limit: parseInt(limit)
      },
      stores: stores || []
    });
  } catch (error) {
    console.error('store profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStoreByMerchantId = async (req, res) => {
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

    // Query to get total count of stores for this merchant
    const { count: totalStores, error: countError } = await supabase
      .from('stores')
      .select('*', { count: 'exact' })
      .eq('merchant_id', merchant_id);

    if (countError) throw countError;

    // Query to get paginated stores
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('merchant_id', merchant_id)
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    // Calculate pagination metadata
    const pagination = {
      total: totalStores,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalStores / limitNum)
    };

    res.json({
      pagination,
      stores
    });
  } catch (error) {
    console.error('Error fetching merchant stores:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createStore,
  getStoreById,
  getStoreByMerchantId
};