const permisions = (state = {}, action) => {
  switch (action.type) {
    case 'permisions':
      return action.payload
    default:
      return state
  }
}
export default permisions