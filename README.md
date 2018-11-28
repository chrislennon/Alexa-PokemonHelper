# Alexa-PokemonHelper

A skill for Alexa for the look up of Pokemon and damage type information.

## Usage
`TODO: skill not currently published.`
To use this skill, add it to Alexa by searching for 'Pokemon Helper' in the skills markert or from this [link]()

## Supported Commands
Variations on command syntax (such as `tell me about` instead of `give me` & `not effective` instead of `weak`) are available within the model files.

- Pokemon Info: `Alexa, ask pokemon helper give me info about sandshrew`
```
sandshrew, ground type. sandshrew's species evolves at level 22 . Sandshrew has a very dry hide that is extremely tough. The Pokémon can roll into a ball that repels any attack. At night, it burrows into the desert sand to sleep.
```

- Pokemon weaknesses: `Alexa, ask pokemon helper what is charizard weak against`
```
charizard. fire, flying type. rock moves are ultra effective. water and electric moves are super effective. steel, fire, fairy and fighting moves are not very effective. ground moves do no damage.
```

- Pokemon strengths: `Alexa, ask pokemon helper what is bulbasaur strong against`
```
Attack power is decided by move type not Pokemon type. Please ask for strengths by type. What else can I help with?
```

- Type weaknesses: `Alexa, ask pokemon helper what is electric weak against`
```
electric type. ground moves are super effective. flying, steel and electric moves are not very effective.
```

- Type strengths: `Alexa, ask pokemon helper what is electric strong against`
```
electric type. Super effective against flying and water. Not very effective against grass, electric and dragon. Does no damage against ground.
```

## Development
This skill was built with the aid of the [ask-cli](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html). This will assist with easier management of:
 - The linking of the skill to lambda
 - The models of the skill
 - The lambda code which acts as the worker for getting information and formatting a response.

 ## Notes
 - You may need to change elements of the skills.json to avoid conflicting names.
 - You can always use `ask init` to have a fresh skill setup for you and then copy over the required source from this project.
