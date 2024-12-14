const supabase = require('../config/supabase');

const getCurrentUser = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error) throw error;

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    console.log('Page:', page, 'Limit:', limit, 'Offset:', offset);

    const query = supabase
      .from('users')
      .select('id, email, full_name, user_type, status', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, count, error } = await query;

    if (error) throw error;

    console.log('Fetched users:', users); // Log fetched users

    res.json({
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        current: parseInt(page),
      },
      users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User profile not found' });
      }
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    res.json(data);
  } catch (error) {
    console.error('user profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCustomers = async (req, res) => {
  try {
    console.log('Authenticated User:', req.user);
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    console.log('Customer Query Params:', { page, limit, offset });

    const query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('user_type', 'customer')
      .range(offset, offset + limit - 1);

    const { data: customers, count, error } = await query;

    console.log('Customer Query Result:', {
      customers,
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
      customers,
    });
  } catch (error) {
    console.error('Full Error in getCustomers:', error);
    res.status(500).json({ error: error.message });
  }
};

const getMerchants = async (req, res) => {
  try {
    console.log('Authenticated User:', req.user);
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    console.log('Merchant Query Params:', { page, limit, offset });

    const query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('user_type', 'merchant')
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

const getAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('user_type', 'admin')
      .range(offset, offset + limit - 1);

    const { data: admins, count, error } = await query;

    if (error) throw error;

    res.json({
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        current: parseInt(page),
      },
      admins,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdminsOrMerchants = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Query for users who are either admin or merchant
    const query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .in('user_type', ['admin', 'merchant'])  // Check if the user type is admin or merchant
      .range(offset, offset + limit - 1);

    const { data: users, count, error } = await query;

    if (error) throw error;

    res.json({
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        current: parseInt(page),
      },
      users,  // Return both admins and merchants
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.query;
    const { full_name, email, user_type, status } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ full_name, email, user_type, status })
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ message: 'User updated successfully', user: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const patchUser = async (req, res) => {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'User patched successfully', user: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCurrentUser,
  getAllUsers,
  getUserById,
  getCustomers,
  getMerchants,
  getAdmins,
  updateUser,
  patchUser,
  deleteUser
};

