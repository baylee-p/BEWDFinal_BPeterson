const State = require('../models/States');
const statesData = require('../models/statesData.json');

const getAllStates = async (req, res) => {
  try {
    let states = [...statesData];

    const mongoStates = await State.find();

    states = states.map(state => {
      const mongoState = mongoStates.find(m => m.stateCode === state.code);
      if (mongoState && mongoState.funfacts.length > 0) {
        state = { ...state, funfacts: mongoState.funfacts }; // ✅ safer clone
      }
      return state;
    });

    if (req.query.contig === 'true') {
      states = states.filter(state => state.code !== 'AK' && state.code !== 'HI');
    } else if (req.query.contig === 'false') {
      states = states.filter(state => state.code === 'AK' || state.code === 'HI');
    }

    res.json(states);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

const getState = async (req, res) => {
  try {
    const stateCode = req.code; // From middleware

    const stateData = statesData.find(state => state.code === stateCode);

    if (!stateData) {
      return res.status(404).json({ error: 'State not found' });
    }

    const mongoState = await State.findOne({ stateCode: stateCode });

    // Clone object safely
    const response = { ...stateData };

    if (mongoState && mongoState.funfacts.length > 0) {
      response.funfacts = mongoState.funfacts;
    }

    res.json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

const getRandomFunFact = async (req, res) => {
    try {
      const stateCode = req.code;  // From middleware
  
      const mongoState = await State.findOne({ stateCode });
  
      if (!mongoState || !mongoState.funfacts || mongoState.funfacts.length === 0) {
        const stateData = statesData.find(state => state.code === stateCode);
  
        if (!stateData) {
          return res.status(404).json({ error: 'State not found in JSON data' });
        }
  
        return res.json({ message: `No Fun Facts found for ${stateData.state}` });
      }
  
      const randomIndex = Math.floor(Math.random() * mongoState.funfacts.length);
      const randomFact = mongoState.funfacts[randomIndex];
  
      res.json({ funfact: randomFact });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server Error' });
    }
  };  

  const addFunFacts = async (req, res) => {
    try {
      const stateCode = req.code;
  
      // Validate request body
      if (!req.body || !req.body.funfacts) {
        return res.status(400).json({ message: 'State fun facts value required' });
      }
  
      const { funfacts } = req.body;
  
      if (!Array.isArray(funfacts) || funfacts.length === 0) {
        return res.status(400).json({ message: 'Fun facts must be a non-empty array.' });
      }
  
      // Confirm state exists in JSON data
      const stateData = statesData.find(state => state.code === stateCode);
  
      if (!stateData) {
        return res.status(404).json({ message: 'State not found in JSON data' });
      }
  
      // Find state in MongoDB
      let stateDoc = await State.findOne({ stateCode });
  
      if (!stateDoc) {
        // Create new document if not exists
        stateDoc = new State({ stateCode, funfacts });
      } else {
        // Append new funfacts to existing array
        stateDoc.funfacts = [...stateDoc.funfacts, ...funfacts];
      }
  
      await stateDoc.save();
  
      res.status(201).json(stateDoc);
  
    } catch (err) {
      console.error('Error in addFunFacts:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  };
  
  const updateFunFact = async (req, res) => {
    try {
      const stateCode = req.code;
      const { index, funfact } = req.body;
  
      // Validate input
      if (index === undefined || funfact === undefined) {
        return res.status(400).json({ message: 'State fun fact index and value required' });
      }
  
      if (typeof index !== 'number' || index < 1) {
        return res.status(400).json({ message: 'Index must be a number starting from 1' });
      }
  
      // Confirm state exists in JSON data
      const stateData = statesData.find(state => state.code === stateCode);
  
      if (!stateData) {
        return res.status(404).json({ message: 'State not found in JSON data' });
      }
  
      // Find state in MongoDB
      const stateDoc = await State.findOne({ stateCode });
  
      if (!stateDoc || !stateDoc.funfacts || stateDoc.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
      }
  
      const zeroBasedIndex = index - 1;
  
      if (zeroBasedIndex >= stateDoc.funfacts.length) {
        return res.status(400).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
      }
  
      // Update funfact
      stateDoc.funfacts[zeroBasedIndex] = funfact;
      await stateDoc.save();
  
      res.json(stateDoc);
  
    } catch (err) {
      console.error('Error in updateFunFact:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  };
  
  const deleteFunFact = async (req, res) => {
    try {
      const stateCode = req.code;
      const { index } = req.body;
  
      // Validate input
      if (index === undefined) {
        return res.status(400).json({ message: 'State fun fact index value required' });
      }
  
      if (typeof index !== 'number' || index < 1) {
        return res.status(400).json({ message: 'Index must be a number starting from 1' });
      }
  
      // Confirm state exists in JSON data
      const stateData = statesData.find(state => state.code === stateCode);
  
      if (!stateData) {
        return res.status(404).json({ message: 'State not found in JSON data' });
      }
  
      // Find state in MongoDB
      const stateDoc = await State.findOne({ stateCode });
  
      if (!stateDoc || !stateDoc.funfacts || stateDoc.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
      }
  
      const zeroBasedIndex = index - 1;
  
      if (zeroBasedIndex >= stateDoc.funfacts.length) {
        return res.status(400).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
      }
  
      // Remove the funfact at the given index
      stateDoc.funfacts.splice(zeroBasedIndex, 1);
      await stateDoc.save();
  
      res.json(stateDoc);
  
    } catch (err) {
      console.error('Error in deleteFunFact:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  };
  

  module.exports = {
    getAllStates,
    getState,
    getRandomFunFact,
    addFunFacts,
    updateFunFact,
    deleteFunFact
  };
  
