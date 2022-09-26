import Vue from 'vue'
import debounce from 'lodash/debounce'

export const requiredValidator = value => !value && 'Field is required'
export const minLengthValidator = length => value => value && value.length < length && `Required at least ${length} characters`
const isValidEmail = email => /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email)
export const emailValidator = value => value && !isValidEmail(value) && 'Invalid email address'
export const isValidUrl = url => /^(ftp|http|https):\/\/[^ "]+$/.test(url)
export const urlValidator = value => !isValidUrl(value) && 'Invalid URL address'

export function createValidator (rules, debounceTime = 500) {
  const validator = {
    error: null,
    validating: false,
    checked: false
  }
  Vue.observable(validator)

  async function validate (value) {
    for (const rule of rules) {
      const err = rule(value)
      if (err && typeof err === 'string') {
        return err
      }
      if (err && err instanceof Promise) {
        const errValue = await err
        if (errValue && typeof errValue === 'string') {
          return errValue
        }
      }
    }
    return ''
  }
  validator.validate = async value => {
    validator.validating = true
    const err = await validate(value)
    validator.error = err
    validator.checked = true
    validator.validating = false
  }
  validator.debouncedValidate = debounce(validator.validate, debounceTime)

  /*
  const debouncedValidate = debounce(async value => {
    validator.validating = true
    const err = await validate(value)
    validator.error = err
    validator.checked = true
    validator.validating = false
  }, debounceTime)


  validator.validate = function (value) {
    // validator.validating = true
    // validator.error = ''
    debouncedValidate(value)
  }
  */
  return validator
}
