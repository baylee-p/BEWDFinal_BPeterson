const express = require('express');
const router = express.Router();

const statesController = require('../controllers/statesController');
const verifyState = require('../middleware/verifyState');

router.get('/test', (req, res) => {
  res.json({ message: 'Test route working!' });
});

router.get('/', statesController.getAllStates);

router.get('/:state', verifyState, statesController.getState);

router.get('/:state/funfact', verifyState, statesController.getRandomFunFact);

router.post('/:state/funfact', verifyState, statesController.addFunFacts);

router.patch('/:state/funfact', verifyState, statesController.updateFunFact);

router.delete('/:state/funfact', verifyState, statesController.deleteFunFact);

module.exports = router;
