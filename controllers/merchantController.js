const supabase = require('../config/supabase');

// Create a new merchant profile
const createMerchantProfile = async (req, res) => {
  try {
    const {
      email,
      full_name,
      country,
      pfp_img,
      bg_img,
      products,
      stores,
      commercial_number
    } = req.body;

    // Ensure the user is authenticated and has merchant role
    const userId = req.user.userId;
    const userType = req.user.role;

    if (userType !== 'merchant') {
      return res.status(403).json({ error: 'Only merchants can create a profile' });
    }

    // Check if merchant profile already exists
    const { data: existingMerchant, error: existingError } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing merchant:', existingError);
      return res.status(500).json({ error: 'Error checking merchant profile' });
    }

    if (existingMerchant) {
      return res.status(400).json({ error: 'Merchant profile already exists' });
    }

    // Insert new merchant profile
    const { data, error } = await supabase
      .from('merchants')
      .insert({
        id: userId,
        email,
        full_name,
        user_type: userType,
        status: 'Pending',
        created_at: new Date().toISOString(),
        pfp_img,
        bg_img,
        commercial_number,
        products: products || [],
        stores: stores || [],
        country,
        theme: 'light'
      })
      .select()
      .single();

    if (error) {
      console.error('Merchant profile creation error:', error);
      return res.status(500).json({ error: 'Failed to create merchant profile', details: error.message });
    }

    res.status(201).json({
      message: 'Merchant profile created successfully',
      merchant: data
    });
  } catch (error) {
    console.error('Merchant profile creation error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get merchant profile
const getMerchantProfile = async (req, res) => {
  try {
    const { id } = req.query;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!id) {
      return res.status(400).json({ error: 'Merchant ID is required' });
    }

    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // When merchant is not found, return a structured response similar to getAllMerchants
        return res.json({
          pagination: {
            total: 0,
            pages: 0,
            current: parseInt(page),
          },
          merchants: [],
        });
      }
      console.error('Error fetching merchant profile:', error);
      return res.status(500).json({ error: 'Failed to fetch merchant profile' });
    }

    // If merchant is found, return it in a similar structure
    res.json({
      pagination: {
        total: 1,
        pages: 1,
        current: parseInt(page),
      },
      merchants: [data],
    });
  } catch (error) {
    console.error('Merchant profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllMerchants = async (req, res) => {
  try {
    console.log('Authenticated User:', req.user);
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    console.log('Merchant Query Params:', { page, limit, offset });

    const query = supabase
      .from('merchants')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1);

    const { data: merchants, count, error } = await query;

    console.log('Merchant Query Result:', {
      merchants,
      count,
      error
    });

    if (error) throw error;

    res.json({
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        current: parseInt(page),
      },
      merchants,
    });
  } catch (error) {
    console.error('Full Error in getMerchants:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update merchant profile
const updateMerchantProfile = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Merchant ID is required' });
    }

    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.email;
    delete updateData.user_type;

    const { data, error } = await supabase
      .from('merchants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Merchant profile update error:', error);
      return res.status(500).json({ error: 'Failed to update merchant profile', details: error.message });
    }

    res.json({
      message: 'Merchant profile updated successfully',
      merchant: data
    });
  } catch (error) {
    console.error('Merchant profile update error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Delete merchant profile
const deleteMerchantProfile = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Merchant ID is required' });
    }

    const { error } = await supabase
      .from('merchants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Merchant profile deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete merchant profile', details: error.message });
    }

    res.json({ message: 'Merchant profile deleted successfully' });
  } catch (error) {
    console.error('Merchant profile deletion error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = {
  createMerchantProfile,
  getMerchantProfile,
  getAllMerchants,
  updateMerchantProfile,
  deleteMerchantProfile
};
