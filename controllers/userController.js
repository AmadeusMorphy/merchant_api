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


const getMerchants = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('user_type', 'merchant')
      .range(offset, offset + limit - 1);

    const { data: merchants, count, error } = await query;

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


module.exports = {
  getCurrentUser,
  getAllUsers,
  getMerchants,
  getAdmins
};

