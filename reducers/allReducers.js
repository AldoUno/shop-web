import { combineReducers } from 'redux'
import usuario from './usuario'
import progreso from './progreso'
const allReducers = combineReducers({ usuario, progreso, })
export default allReducers
