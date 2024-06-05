const  authenticateAdmin = (req, res, next)  =>{
  const secretPhrase = req.headers['x-secret-phrase'];

  if (secretPhrase === process.env.ADMIN_SECRET_PHRASE) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Invalid secret phrase' });
  }
}

module.exports = authenticateAdmin;