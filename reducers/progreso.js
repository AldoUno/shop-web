const progreso = (state = '0px', action) => {
    switch (action.type) {
        case 'show':
            return '6px'
        case 'hide':
            return '0px'
        default:
            return state
    }
}
export default progreso