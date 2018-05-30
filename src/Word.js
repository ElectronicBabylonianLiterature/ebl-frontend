import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';

class Word extends Component {
    get word () {
      return this.props.value;
    }

    render() {
      return (
        <ReactMarkdown source={this.word.source} />
      );
    }
};

export default Word;
