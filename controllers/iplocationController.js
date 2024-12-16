const axios = require('axios');

// IP Location Controller
const getIPLocation = async (req, res) => {
  try {
    // First, fetch the current IP address
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const ip = ipResponse.data.ip;

    // Then, fetch location details for that IP
    const locationResponse = await axios.get(`http://ip-api.com/json/${ip}`);
    
    // Combine the results
    const result = {
      ip: ip,
      location: locationResponse.data
    };

    const detailLocationResponse = await axios.get(`http://ipwho.is/${ip}`);

    const finalRes = {
        ip: ip,
        location: locationResponse.data,
        detailedLocation: detailLocationResponse.data,
      };

      
    res.json(finalRes);
  } catch (error) {
    console.error('Error fetching IP location:', error);
    res.status(500).json({ 
      error: 'Failed to fetch IP location', 
      details: error.message 
    });
  }
};

module.exports = {
  getIPLocation
};