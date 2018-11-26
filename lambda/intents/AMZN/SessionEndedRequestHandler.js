const SessionEndedRequest = {
  canHandle (handlerInput) {
    console.log('Inside SessionEndedRequestHandler')
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
  },
  handle (handlerInput) {
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`)
    return handlerInput.responseBuilder.getResponse()
  }
}

module.exports = {
  SessionEndedRequest
}
