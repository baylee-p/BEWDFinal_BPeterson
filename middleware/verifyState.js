const statesData = require('../models/statesData.json');

const stateCodes = statesData.map(state => state.code);

const verifyState = (req, res, next) => {
  const stateCode = req.params.state.toUpperCase();

  if (!stateCodes.includes(stateCode)) {
    return res.status(404).json({ error: 'Invalid state abbreviation parameter' });
  }

  req.code = stateCode; // ✅ attach to req
  next();
};

module.exports = verifyState;
