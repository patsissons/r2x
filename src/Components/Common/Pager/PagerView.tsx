'use strict';

import * as React from 'react';

import { Pagination, PaginationProps, DropdownButton, MenuItem } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../../React/BaseView';

import PagerViewModel from './PagerViewModel';

import './Pager.less';

export interface IPagerProps extends IBaseViewProps, PaginationProps {
  info?: boolean;
  limits?: number[];
}

export class PagerView extends BaseView<IPagerProps, PagerViewModel> {
  public static displayName = 'PagerView';

  updateOn() {
    return [
      this.state.pageCount.changed,
      this.state.selectedPage.changed
    ]
  }

  render() {
    let info: string;

    if (this.props.info && this.state.hasValidLimit()) {
      info = (this.state.itemCount() == null || this.state.itemCount() === 0) ? 'No Items to Show' :
        String.format('Showing Items {0} through {1} of {2}', this.state.offset() + 1, Math.min(this.state.itemCount(), this.state.offset() + this.state.limit()), this.state.itemCount());
    }

    let pager = (this.props.limits == null || this.state.itemCount() === 0 || this.state.limit() == null) ? null : (
      <Pagination items={this.state.pageCount()} activePage={this.state.selectedPage()} onSelect={this.bindEvent(x => x.selectPage, (e, x) => x[0].eventKey as number)} {...this.props} />
    );

    let limit = (this.props.limits == null || this.state.itemCount() === 0) ? null : (
      <DropdownButton id='pager-limit-selector' title={String.format('Items per Page ({0})', this.state.limit() || 'All')} onSelect={this.bindCallback(x => x.limit, (e, x) => x[0])}>
        {this.props.limits.map((x, i) => (
          <MenuItem key={i} eventKey={x}>{x || 'All'}</MenuItem>
        ))}
      </DropdownButton>
    );

    return (
      <div className='Pager'>
        <div className='Pager-info'>{info}</div>
        <div className='Pager-controls'>{pager}</div>
        <div className='Pager-limit'>{limit}</div>
      </div>
    );
  }
}

export default PagerView;
