module.exports = () => {
  const emailRegex = /^[a-zA-Z_.]+@[0-9a-zA-Z]+\.[a-zA-Z]+$/
  const passwordRegexs = [ /[0-9]+/, /[a-z]+/, /[A-Z]+/, /[^0-9a-zA-Z\s]+/ ]

  function fieldNotBeBlank (fieldString) {
    return fieldString.trim().length > 0
  }

  function fieldBeOfForm (fieldRegex) {
    return (fieldString) => fieldRegex.test(fieldString)
  }

  function fieldContains (...fieldRegexs) {
    return (fieldString) => {
      let pass = true
      for (let fieldRegex of fieldRegexs) {
        if (!fieldRegex.test(fieldString)) {
          pass = false
          break
        }
      }
      return pass
    }
  }

  return {
    emailRegex,
    passwordRegexs,
    fieldNotBeBlank,
    fieldBeOfForm,
    fieldContains
  }
}
module.exports['@singleton'] = true
