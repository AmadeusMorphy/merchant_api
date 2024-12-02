const supabase = require('../config/supabase');


const insertData = async (req, res) => {
    try {
        const { title, description, category, images, files, ...customFields } = req.body;
        const user_id = req.user.userId;
    
        // Base product data
        const dataData = {
          user_id: user_id,
          title,
          description,
          category,
          images,
          files
        };

    
        // Insert the data
        const { data: data, error } = await supabase
          .from('data')
          .insert([dataData])
          .select()
          .single();
    
        if (error) throw error;
    
        res.status(201).json(data);
      } catch (error) {
        console.error('Error creating data:', error);
        res.status(500).json({ error: error.message });
      }
      
}

const getData = async (req, res) => {
    try {
      const { page = 1, limit = 20, category, search, user } = req.query;
      const offset = (page - 1) * limit;
  
      let query = supabase
        .from('data')
        .select('*', { count: 'exact' });
      if (category) query = query.eq('category', category);
      if (search) query = query.ilike('title', `%${search}%`);
  
      query = query.range(offset, offset + limit - 1);
  
      const { data: data, count, error } = await query;
  
      if (error) throw error;
  
      res.json({
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          current: parseInt(page),
          limit: parseInt(limit)
        },
        data
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  module.exports = {
    insertData,
    getData
  };