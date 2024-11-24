const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const register = async (req, res) => {
  try {
    const { email, password, fullName, userType } = req.body;

    // Validate user type
    const validUserTypes = ['customer', 'merchant', 'admin'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Create user using Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName, user_type: userType },
      email_confirm: true
    });

    if (authError) {
      console.error('Supabase Auth error:', authError);
      throw authError;
    }

    // Insert additional user data into the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authUser.user.id,
          email: authUser.user.email,
          full_name: fullName,
          user_type: userType,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (userError) {
      console.error('Supabase user data insertion error:', userError);
      throw userError;
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: authUser.user.id, 
        email: authUser.user.email,
        role: userType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      userId: authUser.user.id,
      token,
      user: {
        email: authUser.user.email,
        fullName: fullName,
        userType: userType
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`Attempting login for email: ${email}`);

    // Authenticate user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Supabase Auth error:', authError);
      return res.status(401).json({ error: 'Invalid credentials', details: authError.message });
    }

    console.log('Supabase Auth successful, user ID:', authData.user.id);

    // Get user data from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return res.status(500).json({ error: 'Error fetching user data', details: userError.message });
    }

    if (!userData) {
      console.error('No user data found for ID:', authData.user.id);
      return res.status(404).json({ error: 'User not found in database' });
    }

    console.log('User data retrieved successfully');

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: userData.id, 
        email: userData.email,
        role: userData.user_type 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        userType: userData.user_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = { register, login };


