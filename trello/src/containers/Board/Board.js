import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import * as ListsActions from '../../actions/lists';

import CardsContainer from './Cards/CardsContainer';
import CustomDragLayer from './CustomDragLayer';

function mapStateToProps(state) {
  return {
    lists: state.lists.lists
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ListsActions, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps)
@DragDropContext(HTML5Backend)
export default class Board extends Component {
  static propTypes = {
    getLists: PropTypes.func.isRequired,
    moveCard: PropTypes.func.isRequired,
    moveList: PropTypes.func.isRequired,
    lists: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);
    this.moveCard = this.moveCard.bind(this);
    this.moveList = this.moveList.bind(this);
    this.findList = this.findList.bind(this);
    this.scrollRight = this.scrollRight.bind(this);
    this.scrollLeft = this.scrollLeft.bind(this);
    this.stopScrolling = this.stopScrolling.bind(this);
    this.startScrolling = this.startScrolling.bind(this);
    this.state = { isScrolling: false };
  }

  componentWillMount() {
    // funcion desde actions
    this.props.getLists(5);
  }


  startScrolling(direction) {
    console.log('startScrolling', direction)
    // if (!this.state.isScrolling) {
    switch (direction) {
      case 'toLeft':
        this.setState({ isScrolling: true }, this.scrollLeft());
        break;
      case 'toRight':
        this.setState({ isScrolling: true }, this.scrollRight());
        break;
      default:
        break;
    }
    // }
  }

  scrollRight() {
    this.scrollInterval = setInterval(scroll, 10);

    function scroll() {
      document.getElementsByTagName('main')[0].scrollLeft += 10;
    }
  }

  scrollLeft() {
    this.scrollInterval = setInterval(scroll, 10);

    function scroll() {
      document.getElementsByTagName('main')[0].scrollLeft -= 10;
    }
  }
  
  stopScrolling() {
    console.log('stopScrolling')
    this.setState({ isScrolling: false }, clearInterval(this.scrollInterval));
  }

    // funcion desde actions
  moveCard(lastX, lastY, nextX, nextY) {
    console.log('moveCard')
    this.props.moveCard(lastX, lastY, nextX, nextY);
  }

    // funcion desde actions
    moveList(listId, nextX) {
    const { lastX } = this.findList(listId);
    console.log('moveList', lastX)

    this.props.moveList(lastX, nextX);
  }

  findList(id) {
    const { lists } = this.props;
    const list = lists.filter(l => l.id === id)[0];

    return {
      list,
      lastX: lists.indexOf(list)
    };
  }

  render() {
    const { lists } = this.props;
    return (
      <div style={{ height: '100%' }}>
        <CustomDragLayer snapToGrid={false} />
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
    );
  }
}
