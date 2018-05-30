import React from 'react';
import ReactDOM from 'react-dom';
import WordSearch from './WordSearch';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<WordSearch />, div);
  ReactDOM.unmountComponentAtNode(div);
});