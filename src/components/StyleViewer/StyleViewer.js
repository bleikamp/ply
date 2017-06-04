// @flow
import React from 'react';
import SplitPane from 'react-split-pane';
import ElementStyles from './ElementStyles';
import ComputedStylesPane from './ComputedStylesPane';
import './StyleViewer.css';

type Props = {
  styles: { [NodeId]: NodeStyles },
  selected: { [NodeId]: Node },
};

class StyleViewer extends React.Component {
  props: Props;

  /**
   * Reduce an array of <ComputedStylesPane /> components into a
   * tree of <SplitPane /> components.
   */
  renderSplits(selectedStyles: React.Element<any>[]) {
    /**
     * To make all the panes evenly sized, compute
     * the size of the top pane in the current frame
     * as (100% / (TOTAL_NODES - NODES_PROCESSED).
     */
    const numStyles = selectedStyles.length;
    const reducer = (memo: SplitPane, current: ElementStyles, i: number) => {
      const props = {
        split: 'horizontal',
        minSize: 50,
        defaultSize: `${100 / (numStyles - i)}%`,
      };
      return (
        <SplitPane {...props}>
          {current}
          {memo}
        </SplitPane>
      );
    };
    return selectedStyles.reduceRight(reducer);
  }

  renderStylesForNode = (nodeId: NodeId): React.Element<any> => {
    const styles = this.props.styles[nodeId];
    const elementStylesProps = {
      nodeId,
      styles,
    };

    if (styles) {
      const props = {
        computedStylesView: {
          name: 'Computed Styles',
          parentComputedStyle: styles.parentComputedStyle,
          computedStyle: styles.computedStyle,
        },
      };

      return (
        <ElementStyles {...elementStylesProps}>
          <ComputedStylesPane {...props.computedStylesView} />
        </ElementStyles>
      );
    }

    // Styles haven't landed yet for this particular node.
    return <span>Loading styles...</span>;
  };

  render() {
    const { selected } = this.props;
    let content;
    const noneSelected: boolean = Object.keys(selected).length === 0;

    if (noneSelected) {
      content = (
        <span className="StyleViewer__none-selected">
          No styles selected.
        </span>
      );
    } else {
      // Construct a nested series of SplitPanes,
      // in the order elements were selected.
      if (this.props.styles) {
        const selectedNodeIds = Object.keys(selected).map(s => parseInt(s, 10));
        const selectedStyles: React.Element<any>[] = selectedNodeIds.map(
          this.renderStylesForNode
        );
        content = this.renderSplits(selectedStyles);
      } else {
        // There are selected nodes, but no styles yet.
        content = 'No styles loaded yet';
      }
    }

    return (
      <div className="StyleViewer">
        {content}
      </div>
    );
  }
}

export default StyleViewer;
