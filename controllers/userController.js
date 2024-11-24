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
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, user_type, status')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMerchants = async (req, res) => {
    try {
      const { data: merchants, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'merchant');
  
      if (error) throw error;
  
      res.json(merchants);
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

module.exports = {
  getCurrentUser,
  getAllUsers,
  getMerchants,
  getAdmins
};

