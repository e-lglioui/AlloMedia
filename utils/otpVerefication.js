const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.verifyEmail = async (req, res) => {
  const { token } = req.query; // Récupère le token depuis la requête

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    // Vérifie le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId); // Recherche l'utilisateur par ID

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Vérifie si l'utilisateur a déjà vérifié son e-mail
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Met à jour l'utilisateur pour indiquer que l'e-mail est vérifié
    user.isVerified = true;
    await user.save();

    // Répond avec un message de succès
    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};
