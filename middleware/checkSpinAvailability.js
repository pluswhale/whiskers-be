const checkSpinAvailability = (req, res, next) => {
  const user = req.user;
  
  if (user.bonusSpins <= 0 && user.spinsAvailable <= 0) {
    return res.status(400).json({ error: 'No spins available' });
  }

  next();
};

module.exports = checkSpinAvailability;