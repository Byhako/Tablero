import faker from 'faker'

export default { getLists, moveList, moveCard, toggleDragging}

function getLists(quantity) {
  return function (dispatch) {
    dispatch({ type: 'GET_LISTS_START', quantity })
    setTimeout(() => {
      const lists = []
      let count = 0
      for (let i = 0; i < quantity; i++) {
        const cards = []
        const randomQuantity = Math.floor(Math.random() * (9 - 1 + 1)) + 1
        for (let ic = 0; ic < randomQuantity; ic++) {
          cards.push({
            id: count,
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            title: faker.name.jobTitle()
          });
          count = count + 1
        }
        lists.push({
          id: i,
          name: faker.commerce.productName(),
          cards
        })
      }
      dispatch({ type: 'GET_LISTS', lists, isFetching: true })
    }, 1000) // fake delay
    dispatch({ type: 'GET_LISTS_START', isFetching: false })
  }
}

function moveList(lastX, nextX) {
  return function (dispatch) {
    dispatch({ type: 'MOVE_LIST', lastX, nextX })
  }
}

function moveCard(lastX, lastY, nextX, nextY) {
  return function (dispatch) {
    dispatch({ type: 'MOVE_CARD', lastX, lastY, nextX, nextY })
  }
}

function toggleDragging(isDragging) {
  return function (dispatch) {
    dispatch({ type: 'TOGGLE_DRAGGING', isDragging });
  }
}
