export default Reducer

function Reducer (state, action) {
  const reducer = ({
    GET_LISTS_START,
    GET_LISTS,
    MOVE_CARD,
    MOVE_LIST,
    TOGGLE_DRAGGING
  })[action.type]

  return (reducer && reducer(state, action)) || state
}

function GET_LISTS_START (state, action) {
  return {...state, isFetching: true}
}

function GET_LISTS (state, action) {
  return {...state, isFetching: false, lists: action.lists}
}

function MOVE_CARD (state, action) {
  const newLists = [...state.lists]
  const { lastX, lastY, nextX, nextY } = action
  if (lastX === nextX) {
    newLists[lastX].cards.splice(nextY, 0, newLists[lastX].cards.splice(lastY, 1)[0])
  } else {
    // move element to new place
    newLists[nextX].cards.splice(nextY, 0, newLists[lastX].cards[lastY])
    // delete element from old place
    newLists[lastX].cards.splice(lastY, 1)
  }
  return {...state, lists: newLists}
}

function  MOVE_LIST (state, action) {
  const newLists = [...state.lists]
  const { lastX, nextX } = action
  const t = newLists.splice(lastX, 1)[0]

  newLists.splice(nextX, 0, t)
  return {...state, lists: newLists}
}

function TOGGLE_DRAGGING (state, action) {
  return {...state, isDragging: action.isDragging}
}