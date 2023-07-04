const { Configuration, OpenAIApi } = require('openai');
const router = require('express').Router();
const { Character, Quest, Outcome, CharacterClass, User, CharacterQuest } = require('../../models');
const withAuth = require('../../utils/auth');
const { update } = require('../../models/Character');


router.get('/', async (req, res) => {
  try {
    const characters = await Character.findAll();
    res.status(200).json(characters);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const character = await Character.findByPk(req.params.id, {
      include: [{
        model: Quest,
        through: CharacterQuest
      }, {
        model: CharacterClass,
        as: 'character_class',
        attributes: ['name'] 
      }]
    });
    res.status(200).json(character);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/addquest', async (req, res) => {
  try {
    // Get the characterId and questId from the request body
    const { characterId, questId } = req.body;

    // Find the Character and Quest instances
    const character = await Character.findByPk(characterId);
    const quest = await Quest.findByPk(questId);

    // Check if the character and quest exist
    if (!character || !quest) {
      return res.status(404).json({ message: 'Character or Quest not found' });
    }

    // Associate the quest with the character
    await character.addQuest(quest);

    res.status(200).json({ message: 'Association created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


router.post('/update/:id', async (req, res) => {
  try {
    console.log("Server Side Logs")
    console.log(req);
    const characterId = req.params.id;
    const character = await Character.findByPk(characterId);
    console.log(character);
    if (!character) {
      res.status(404).json({ message: 'No character found with this id!' });
      return;
    }

    const { strength, agility, constitution, wisdom, intelligence, charisma } = req.body;

    character.strength = strength;
    character.agility = agility;
    character.constitution = constitution;
    character.wisdom = wisdom;
    character.intelligence = intelligence;
    character.charisma = charisma;

    await character.save();

    res.status(200).json(character);
  } catch (err) {
    console.error(err); 
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const characterId = req.params.id;

    const character = await Character.findByPk(characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    await character.destroy();

    res.status(200).json({ message: 'Character deleted successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
});

  module.exports = router; 
