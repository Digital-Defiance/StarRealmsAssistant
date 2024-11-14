import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ScrollableContainer from '@/components/ScrollableContainer';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import { List, AutoSizer, ListRowProps } from 'react-virtualized';

import 'highlight.js/styles/github-dark.css';
hljs.registerLanguage('json', json);

interface GameDebugProps {
  value: string;
}

interface GameDebugState {
  loading: boolean;
}

export default function Code({ children, language }: CodeProps) {
  const html = hljs.highlight(children, { language }).value;
  return (
    <pre
      className="px-4 py-4"
      style={{
        display: 'block',
        backgroundColor: 'black',
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      }}
    >
      <code
        className="block overflow-x-auto text-slate-100"
        style={{ whiteSpace: 'pre-wrap', margin: 0, padding: 0 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </pre>
  );
}

export type CodeProps = { children: string; language: string };

export class GameDebug extends Component<GameDebugProps, GameDebugState> {
  static propTypes = {
    value: PropTypes.string.isRequired,
  };

  renderRow = ({ index, key, style }: ListRowProps) => {
    const lines = this.props.value.split('\n');
    return (
      <div key={key} style={{ ...style, backgroundColor: 'black', padding: 0, margin: 0 }}>
        <Code language="json">{lines[index]}</Code>
      </div>
    );
  };

  render() {
    const lines = this.props.value.split('\n');
    return (
      <ScrollableContainer>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              rowCount={lines.length}
              rowHeight={20}
              rowRenderer={this.renderRow}
            />
          )}
        </AutoSizer>
      </ScrollableContainer>
    );
  }
}
