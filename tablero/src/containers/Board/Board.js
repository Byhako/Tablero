import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import actions from '../../actions/index'

import CardsContainer from './Cards/CardsContainer'
import CustomDragLayer from './CustomDragLayer'


@DragDropContext(HTML5Backend)
class Board extends Component {
  static propTypes = {
    lists: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = { isScrolling: false }
  }

  componentWillMount() {
    this.props.dispatch(actions.getLists(8))
  }

  startScrolling = (direction) => {
    switch (direction) {
      case 'toLeft':
        this.setState({ isScrolling: true }, this.scrollLeft())
        break;
      case 'toRight':
        this.setState({ isScrolling: true }, this.scrollRight())
        break
      default:
        break
    }
  }

  scrollRight = () => {
    this.scrollInterval = setInterval(scroll, 10)

    function scroll() {
      document.getElementsByTagName('main')[0].scrollLeft += 10
    }
  }

  scrollLeft = () => {
    this.scrollInterval = setInterval(scroll, 10)

    function scroll() {
      document.getElementsByTagName('main')[0].scrollLeft -= 10
    }
  }
  
  stopScrolling = () => {
    this.setState({ isScrolling: false }, clearInterval(this.scrollInterval))
  }

  moveCard = (lastX, lastY, nextX, nextY) => {
    this.props.dispatch(actions.moveCard(lastX, lastY, nextX, nextY))
  }

  moveList = (listId, nextX) => {
    const { lastX } = this.findList(listId)
    this.props.dispatch(actions.moveList(lastX, nextX))
  }

  findList = (id) => {
    const { lists } = this.props;
    const list = lists.filter(l => l.id === id)[0]

    return {
      list,
      lastX: lists.indexOf(list)
    }
  }

  render() {
    const { lists } = this.props
    console.log('lists',lists[0])
    return (
      <main>
      <div style={{ height: '100%' }}>
        <CustomDragLayer/>
        {lists.map((item, i) =>
          <CardsContainer
            key={item.id}
            id={item.id}
            item={item}
            moveCard={this.moveCard}
            moveList={this.moveList}
            startScrolling={this.startScrolling}
            stopScrolling={this.stopScrolling}
            isScrolling={this.state.isScrolling}
            x={i}
          />
        )}
      </div>
      </main>
    )
  }
}

function mapStateToProps(state) {
  return {
    lists: state.lists
  }
}

export default connect(mapStateToProps)(Board)