import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DropTarget, DragSource } from 'react-dnd';

import Cards from './Cards'

const listSource = {
  beginDrag(props) {
    return { id: props.id, x: props.x }
  },
  endDrag(props) { props.stopScrolling() }
}

const listTarget = {
  canDrop() {
    return false
  },
  hover(props, monitor) {
    if (!props.isScrolling) {
      if (window.innerWidth - monitor.getClientOffset().x < 200) {
        props.startScrolling('toRight')
      } else if (monitor.getClientOffset().x < 200) {
        props.startScrolling('toLeft')
      }
    } else {
      if (window.innerWidth - monitor.getClientOffset().x > 200 &&
          monitor.getClientOffset().x > 200
      ) {
        props.stopScrolling()
      }
    }
    const { id: listId } = monitor.getItem()
    const { id: nextX } = props
    if (listId !== nextX) {
      props.moveList(listId, props.x)
    }
  }
}

@DropTarget('list', listTarget, connectDragSource => ({
  connectDropTarget: connectDragSource.dropTarget(),
}))
@DragSource('list', listSource, (connectDragSource, monitor) => ({
  connectDragSource: connectDragSource.dragSource(),
  isDragging: monitor.isDragging()
}))

class CardsContainer extends Component {
  render() {
    const { connectDropTarget, connectDragSource, item, x, moveCard, isDragging } = this.props
    const opacity = isDragging ? 0.3 : 1  // cuando movemos columnas

    return connectDragSource(connectDropTarget(
      <div className="desk" style={{ opacity }}>
        <div className="desk-head">
          <div className="desk-name">{item.name}</div>
        </div>
        <Cards
          moveCard={moveCard}
          x={x}
          cards={item.cards}
          startScrolling={this.props.startScrolling}
          stopScrolling={this.props.stopScrolling}
          isScrolling={this.props.isScrolling}
        />
      </div>
    ))
  }
}

CardsContainer.propTypes = {
  connectDropTarget: PropTypes.func,
  connectDragSource: PropTypes.func,
  item: PropTypes.object,
  x: PropTypes.number,
  moveCard: PropTypes.func.isRequired,
  moveList: PropTypes.func.isRequired,
  isDragging: PropTypes.bool,
  startScrolling: PropTypes.func,
  stopScrolling: PropTypes.func,
  isScrolling: PropTypes.bool
}

export default CardsContainer