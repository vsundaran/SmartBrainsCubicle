const jwt = require('jsonwebtoken');

const authAdmin = (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin', email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      token,
      message: 'Admin login successful'
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
};

module.exports = { authAdmin };
