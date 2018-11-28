
function getRandomItem (arrayOfItems) {
  let i = 0
  i = Math.floor(Math.random() * arrayOfItems.length)
  return (arrayOfItems[i])
};

function getKeyByValue (object, value) {
  let keyArr = Object.keys(object).map(key => {
    if (object[key] === value) {
      return key
    }
  })
  keyArr = keyArr.filter(el => el != null)
  return keyArr
}

function slotValue (slot, useId) {
  let value = slot.value
  let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null
  if (resolution && resolution.status.code === 'ER_SUCCESS_MATCH') {
    let resolutionValue = resolution.values[0].value
    console.log(`seen slot lookup match ${resolution.values[0].value} == ${resolutionValue.name} == ${slot.value}`)
    value = resolutionValue.id && useId ? resolutionValue.id : resolutionValue.name
    console.log('using ' + value)
  } else {
    value = false
  }
  return value
}

function dynamicSort (property) {
  var sortOrder = 1
  if (property[0] === '-') {
    sortOrder = -1
    property = property.substr(1)
  }
  return function (a, b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0
    return result * sortOrder
  }
}

function getTypeString (types) {
  let sortedTypes = types.sort(dynamicSort('slot'))
  let typeStr = ''
  let i = 1
  for (const slot of sortedTypes) {
    typeStr += slot.type.name
    if (i < sortedTypes.length) typeStr += ', '
    i++
  }
  return typeStr
}

function getEvolveString (chain, pokemonName) {
  console.log(chain)
  let evolveStr = ''
  let evolve1 = chain.evolves_to[0]
  if (evolve1) {
    let evolveLvl1 = evolve1.evolution_details[0].min_level
    console.log('evolve1', evolve1)
    let evolveLvl2
    let evolve2 = evolve1.evolves_to[0]
    if (evolve2) {
      evolveLvl2 = evolve2.evolution_details[0].min_level
      console.log('evolve2', evolve2)
    }
    if (evolve1) evolveStr += `${pokemonName}'s species evolves at level ${evolveLvl1} `
    if (evolve2) evolveStr += `and level ${evolveLvl2} `
    if (evolve1 || evolve2) evolveStr += '. <break time="500ms"/> '
  }
  return evolveStr
}

module.exports = {
  getRandomItem,
  getKeyByValue,
  slotValue,
  getTypeString,
  getEvolveString
}
