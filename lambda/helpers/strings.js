let welcomePokemon = ['Zapdos', 'Pikachu', 'Bulbasaur']

const languageStrings = {
  en: {
    translation: {
      RECIPES: welcomePokemon,
      SKILL_NAME: 'Pokemon Helper',
      WELCOME_MESSAGE: 'Welcome to %s. You can ask a question like, what number is %s? ... Now, what can I help you with?',
      WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
      DISPLAY_CARD_TITLE: '%s  - Entry for %s.',
      HELP_MESSAGE: 'You can ask questions such as, what number is %s, or, you can say exit...Now, what can I help you with?',
      HELP_REPROMPT: 'You can say things like, what number is %s, or you can say exit...Now, what can I help you with?',
      STOP_MESSAGE: 'Goodbye!',
      NOT_FOUND: 'Sorry, I didn\'t understand that Pokemon or type. ',
      NO_POKEMON_STRENGTHS: 'Attack power is decided by move type not Pokemon type. Please ask for strengths by type. ',
      DATA_ERROR: 'An error occurred while looking up %s',
      RECIPE_REPEAT_MESSAGE: 'Try saying repeat.',
      RECIPE_NOT_FOUND_MESSAGE: 'I\'m sorry, I currently do not know ',
      RECIPE_NOT_FOUND_WITH_ITEM_NAME: 'the Pokemon %s. ',
      RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME: 'that Pokemon. ',
      NOT_FOUND_REPROMPT: 'What else can I help with?',
      WEAK_DOUBLE_SUPER: '%s moves are ultra effective. ',
      WEAK_SUPER: '%s moves are super effective. ',
      WEAK_HALF: '%s moves are not very effective. ',
      WEAK_NO: '%s moves do no damage. ',
      STRONG_DOUBLE_SUPER: 'Ultra effective against %s. ',
      STRONG_SUPER: 'Super effective against %s. ',
      STRONG_HALF: 'Not very effective against %s. ',
      STRONG_NO: 'Does no damage against %s. '
    }
  },
  'en-US': {
    translation: {
      RECIPES: welcomePokemon,
      SKILL_NAME: 'Pokemon Helper'
    }
  },
  'en-GB': {
    translation: {
      RECIPES: welcomePokemon,
      SKILL_NAME: 'Pokemon Helper'
    }
  }
}

module.exports = {
  languageStrings
}
