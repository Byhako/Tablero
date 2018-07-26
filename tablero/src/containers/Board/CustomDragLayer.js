import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DragLayer } from 'react-dnd'

import CardDragPreview from './CardDragPreview'
import snapToGrid from './snapToGrid'

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100000
}

// funcion que calcula nueva posicion a medida que 
// movemos tarjeta con mouse
function getItemStyles(props) {
  const { initialOffset, currentOffset } = props
  if (!initialOffset || !currentOffset) {
    return { display: 'none' }
  }

  let { x, y } = currentOffset
  let ix = initialOffset.x
  let iy = initialOffset.y

  x -= ix
  y -= iy

  let array = snapToGrid(x, y)
  [x,y] = array
  x += ix
  y += iy

  const transform = `translate(${x}px, ${y}px)`
  return {
    WebkitTransform: transform,
    transform
  }
}

@DragLayer((monitor) => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging()
}))
class CustomDragLayer extends Component {

  renderItem(type, item) {
    switch (type) {
      case 'card':
        return ( <CardDragPreview card={item} /> )
      default:
        return null
    }
  }

  render() {
    const { item, itemType, isDragging } = this.props
    console.log('item',item)
    if (!isDragging) { return null }

    return (
      <div style={layerStyles}>
        <div style={getItemStyles(this.props)}>
          {this.renderItem(itemType, item)}  {/* CardDragPreview */}
        </div>
      </div>
    );
  }
}

CustomDragLayer.propTypes = {
  item: PropTypes.object,
  itemType: PropTypes.string,
  initialOffset: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  currentOffset: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  })
}

export default CustomDragLayer