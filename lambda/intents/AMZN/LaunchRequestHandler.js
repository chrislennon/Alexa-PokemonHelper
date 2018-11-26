const utils = require('../../helpers/utils')
let welcomePokemon = ['Zapdos', 'Pikachu', 'Bulbasaur']

const LaunchRequestHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
  },
  handle (handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes()
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()

    const item = requestAttributes.t(utils.getRandomItem(welcomePokemon))

    const speakOutput = requestAttributes.t('WELCOME_MESSAGE', requestAttributes.t('SKILL_NAME'), item)
    const repromptOutput = requestAttributes.t('WELCOME_REPROMPT')

    handlerInput.attributesManager.setSessionAttributes(sessionAttributes)

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse()
  }
}

module.exports = {
  LaunchRequestHandler
}
