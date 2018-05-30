import React from 'react';
import ReactDOM from 'react-dom';
import Word from './Word';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Word value={{source: '**lemma**'}}/>, div);
  ReactDOM.unmountComponentAtNode(div);
});