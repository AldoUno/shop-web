import { getCookie } from "cookies-next"



const usuario = (state = {}, action) => {
  switch (action.type) {
    case 'add':
      return action.payload
    default:
      return state
  }
}
export default usuario