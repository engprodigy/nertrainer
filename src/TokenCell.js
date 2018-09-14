'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types'
var createReactClass = require('create-react-class');
//import PropTypes from 'prop-types'

export default createReactClass({

  propTypes: {
    textContent: PropTypes.string
    
  },

  render() {
    let textContent = this.props.textContent;

    if (!textContent || !textContent.trim()) { return null; }

    return (
      <div className="rt-cell">
        <p className="rt-cell__content">{textContent.trim()}</p>
        <span className="rt-cell__delete"
          onClick={this._handleClick}>x</span>
      </div>
    );
  },

  _handleClick(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    let cell = ReactDOM.findDOMNode(this),
        textContent;

    textContent = cell.querySelector('.rt-cell__content').textContent;
    this.props.removeToken(textContent);
  }

});