const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// controllers/authController.js
const register = async (req, res) => {
  try {
    const { email, password, fullName, userType, pfpImg, bgImg, status } = req.body;

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
          status: status || 'Active',
          pfp_img: pfpImg,
          bg_img: bgImg
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

    const { data: userDetails, error: userDetailsError } = await supabase
      .from('users')
      .select('status')
      .eq('id', authUser.user.id)
      .single();

    res.status(201).json({
      userId: authUser.user.id,
      token,
      user: {
        email: authUser.user.email,
        fullName: fullName,
        userType: userType,
        status: userDetails.status,
        pfpImg: pfpImg,
        bgImg: bgImg
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

    // Authenticate user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userId = authData.user.id;

    // Remove any existing active tokens for this user
    const { error: removeError } = await supabase
      .from('active_tokens')
      .delete()
      .eq('user_id', userId);

    if (removeError) {
      console.error('Failed to remove existing tokens:', removeError);
    }

    // Generate a new JWT
    const token = jwt.sign(
      {
        userId,
        email: authData.user.email,
        status: authData.user.user_metadata.status,
        role: authData.user.user_metadata.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Token expiry: 1 month

    // Insert the new token into the `active_tokens` table
    const { error: insertError } = await supabase
      .from('active_tokens')
      .insert([{ user_id: userId, token, expires_at: expiresAt }]);

    if (insertError) {
      console.error('Failed to store new active token:', insertError);
      return res.status(500).json({ error: 'Failed to store new active token' });
    }

    const { data: userDetails, error: userDetailsError } = await supabase
      .from('users')
      .select('status, user_type, full_name')
      .eq('id', userId)
      .single();

    // Return the new token
    res.json({
      token,
      user: {
        id: userId,
        email: authData.user.email,
        fullName: authData.user.user_metadata.full_name,
        userType: authData.user.user_metadata.user_type,
        status: userDetails.status
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};


const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Decode token to get user ID and expiration time
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Remove the token from active_tokens table first
    const { data: activeTokenData, error: activeTokenError } = await supabase
      .from('active_tokens')
      .delete()
      .eq('user_id', decoded.userId)
      .eq('token', token)
      .select();

    if (activeTokenError) {
      console.error('Error removing active token:', activeTokenError);
      return res.status(500).json({ error: 'Failed to remove active token', details: activeTokenError.message });
    }

    // Verify the token was actually removed from active tokens
    console.log('Active token removal result:', activeTokenData);

    // Add token to blacklist with its expiration time
    const { error: blacklistError } = await supabase
      .from('blacklisted_tokens')
      .insert([{
        token,
        expires_at: new Date(decoded.exp * 1000),
        user_id: decoded.userId
      }]);

    if (blacklistError) {
      console.error('Error blacklisting token:', blacklistError);
      return res.status(500).json({ error: 'Error during logout', details: blacklistError.message });
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);

    // Handle specific JWT verification errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.status(500).json({ error: 'Failed to log out', details: error.message });
  }
};


module.exports = { register, login, logout };


