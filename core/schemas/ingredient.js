/**
 * Ingredient Schema Definition
 * Syntax info: http://json-schema.org/examples.html
 */
module.exports = {
  title: 'Ingredient',
  type: 'object',
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      minLength: 36,
      maxLength: 36
    },
    name: {
      type: 'string',
      maxLength: 50,
      minLength: 1,
      required: true
    },
    cost: {
      type: 'number',
      required: true
    },
    stock: {
      type: 'integer',
      required: true
    }
  }
}