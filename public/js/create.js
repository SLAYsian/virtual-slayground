document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('character-form');
  const genreSelect = document.getElementById('genre-select');
  const classSelect = document.getElementById('class-select');

  let characterName = null;
  let characterClass = null;
  let scenarios = null;
  let currentCharacter = null;

  const genreOptions = {
    Fantasy: [
      { value: 'wizard', label: 'Wizard' },
      { value: 'rogue', label: 'Rogue' },
      { value: 'warrior', label: 'Warrior' },
    ],
    'Sci-Fi': [
      { value: 'soldier', label: 'Soldier' },
      { value: 'engineer', label: 'Engineer' },
      { value: 'scientist', label: 'Scientist' },
    ],
  };

  const populateClassOptions = () => {
    const selectedGenre = genreSelect.value;

    classSelect.innerHTML = '';

    genreOptions[selectedGenre].forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      classSelect.appendChild(optionElement);
    });
  };

  genreSelect.addEventListener('change', () => {
    populateClassOptions();
  });

  populateClassOptions();

  genreSelect.addEventListener('change', () => {
    const selectedGenre = genreSelect.value;

    classSelect.innerHTML = '';

    genreOptions[selectedGenre].forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      classSelect.appendChild(optionElement);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const genre = genreSelect.value;
    characterName = document.getElementById('character-name').value;
    characterClass = classSelect.value;

    fetch('/api/game/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        genre,
        name: characterName,
        class: characterClass,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        renderStartingScenarios(data);
      })
      .then((updatedCharacter) => {
        console.log('Character updated:', updatedCharacter);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  const fetchCharacterClass = async (classId) => {
    try {
      const response = await fetch(`/api/class/${classId}`);
      if (!response.ok) {
        throw new Error(
          `Error fetching character class data: ${response.statusText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error retrieving character class: ${error}`);
      return null;
    }
  };

  const updateCharacterAttributes = async (character) => {
    const characterClass = await fetchCharacterClass(character.classId);
    
    const attributes = {
      strength: (characterClass.strength || 0) + (character.strength || 0),
      agility: (characterClass.agility || 0) + (character.agility || 0),
      constitution: (characterClass.constitution || 0) + (character.constitution || 0),
      wisdom: (characterClass.wisdom || 0) + (character.wisdom || 0),
      intelligence: (characterClass.intelligence || 0) + (character.intelligence || 0),
      charisma: (characterClass.charisma || 0) + (character.charisma || 0),
    };
        
    const response = await fetch(`/api/character/update/${character.characterId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attributes),
    });
  
    if (!response.ok) {
      throw new Error('Failed to update character');
    }
  
    const updatedCharacter = await response.json();
    return updatedCharacter;
  };

  const renderStartingScenarios = (scenarioData) => {
    scenarios = scenarioData.scenarios;
    currentCharacter = scenarioData.character;
    currentClass = scenarioData.class;

    const scenarioSection = document.createElement('section');
    scenarioSection.id = 'scenario-section';

    const heading = document.createElement('h2');
    heading.textContent = 'Starting Scenarios';

    const scenarioList = document.createElement('form');
    scenarioList.id = 'scenario-form';
    scenarioList.action = './game';

    scenarios.forEach((scenario, index) => {
      const listItem = document.createElement('div');

      const radioButton = document.createElement('input');
      radioButton.type = 'radio';
      radioButton.name = 'scenario';
      radioButton.value = scenario.id;
      radioButton.id = `scenario${index}`;

      const label = document.createElement('label');
      label.htmlFor = `scenario${index}`;

      const scenarioName = document.createElement('h3');
      scenarioName.textContent = scenario.name;

      const scenarioDescription = document.createElement('p');
      scenarioDescription.textContent = scenario.description;

      label.appendChild(scenarioName);
      label.appendChild(scenarioDescription);
      listItem.appendChild(radioButton);
      listItem.appendChild(label);
      scenarioList.appendChild(listItem);
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Submit';
    
    submitButton.addEventListener('click', handleGameLaunch);
    
    scenarioList.appendChild(submitButton);
    
    scenarioSection.appendChild(heading);
    scenarioSection.appendChild(scenarioList);
    
    const formParent = form.parentElement;
    formParent.appendChild(scenarioSection);
    form.style.display = 'none';
  
  };

  const handleGameLaunch = async (e) => {
    // if (e) {
    //   e.preventDefault();
    // }
  
    const selectedScenarioRadio = document.querySelector(
      'input[name="scenario"]:checked'
    );
  
    if (!selectedScenarioRadio) {
      console.log('No scenario selected');
      return;
    }
  
    const selectedScenarioId = selectedScenarioRadio.value;
    const selectedScenario = scenarios.find(
      (scenario) => scenario.id == selectedScenarioId
    );
  
    if (!selectedScenario) {
      console.log('Selected scenario not found');
      return;
    }
  
    const character = {
      name: currentCharacter.name,
      classId: currentCharacter.class_id,
      className: currentClass,
      characterId: currentCharacter.id,
      attributes: {}
    };

    let characterId = currentCharacter.id;
    let questId = selectedScenario.id;
    
    localStorage.setItem('characterId', characterId.toString());
    localStorage.setItem('questId', questId.toString());

    fetch('/api/character/addquest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ characterId, questId }),
    })
    .then(response => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
    
    try {
      character.attributes = await updateCharacterAttributes(character);
    } catch (error) {
      console.log('Error updating class:', error);
      return;
    }
  };
});
