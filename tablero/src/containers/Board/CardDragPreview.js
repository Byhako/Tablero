import React from 'react'
import PropTypes from 'prop-types'
import Card from './Cards/Card'

const CardDragPreview = (props) => {
  let styles = {
    transform: 'rotate(-7deg)',
    WebkitTransform: 'rotate(-7deg)'
  }

    console.log('props',props)

  styles.width = `${props.card.clientWidth || 243}px`
  styles.height = `${props.card.clientHeight || 243}px`

  return (
    <div style={styles}>
      <Card item={props.card.item} />
    </div>
  )
}

CardDragPreview.propTypes = { card: PropTypes.object }

export default CardDragPreview
