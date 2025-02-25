import React, { Component } from "react";
import { css, cx } from "emotion";
import { createCustomClassNames } from "@hig/utils";

import TreeObjectNestedSubTreeItem from "./fileview/TreeObjectNestedSubTreeItem";
import TreeObjectSubTreeItem from "./fileview/TreeObjectSubTreeItem";
import TreeItem from "../TreeItem";
import TreeItemBehavior from "../behaviors/TreeItemBehavior";

import stylesheet from "./stylesheet";

const collapseStatus = {
  BEFORE_COLLAPSE: "before_collapse",
  COLLAPSING: "collapsing",
  COLLAPSED: "collapsed",
  BEFORE_EXPAND: "before_expand",
  EXPANDING: "expanding",
  EXPANDED: "expanded"
};

export default class SubTreeViewCombined extends Component {
  constructor(props) {
    super(props);

    this.setSubTreeWrapperRef = element => {
      this.subTreeWrapper = element;
    };

    this.state = {
      status: collapseStatus.COLLAPSED,
      mount: false
    };
  }

  componentDidMount() {
    if (!this.props.collapsed && this.subTreeWrapper) {
      this.afterExpanded();
    }
  }

  componentDidUpdate(previousProps) {
    const { collapsed: previousCollapsed } = previousProps;
    const { collapsed: currentCollapsed } = this.props;

    if (!this.subTreeWrapper) {
      return;
    }
    if (currentCollapsed && !previousCollapsed) {
      this.collapse();
    }
    if (!currentCollapsed && previousCollapsed) {
      this.expand();
    }
  }

  onTransitionEnd = ({ target, propertyName }) => {
    if (target === this.subTreeWrapper && propertyName === "height") {
      if (this.props.collapsed) {
        this.afterCollapsed();
        this.setState({ mount: false });
      } else {
        this.afterExpanded();
      }
    }
  };

  getContentHeight = () => `${this.subTreeWrapper.scrollHeight}px`;

  getTransitionStyles = status => {
    const defaultCollapsedStyles = {
      height: "0",
      overflow: "hidden",
      visibility: "hidden"
    };

    if (status === collapseStatus.EXPANDING) {
      return {
        ...defaultCollapsedStyles,
        height: this.getContentHeight(),
        visibility: "visible",
        overflow: "hidden"
      };
    }
    if (status === collapseStatus.EXPANDED) {
      return {
        ...defaultCollapsedStyles,
        height: "auto",
        visibility: "visible",
        overflow: "visible"
      };
    }
    if (status === collapseStatus.BEFORE_COLLAPSE) {
      return {
        ...defaultCollapsedStyles,
        height: this.getContentHeight(),
        visibility: "visible",
        overflow: "visible"
      };
    }
    if (status === collapseStatus.COLLAPSING) {
      return {
        ...defaultCollapsedStyles,
        height: "0",
        visibility: "visible",
        overflow: "hidden"
      };
    }

    return defaultCollapsedStyles;
  };

  collapse = () => {
    this.setState({ status: collapseStatus.BEFORE_COLLAPSE });
    window.requestAnimationFrame(() => {
      setTimeout(() =>
        this.setState({ status: collapseStatus.COLLAPSED, mount: false })
      );
    });
  };

  expand = () => {
    this.setState({
      status: collapseStatus.EXPANDING,
      mount: true
    });
  };

  afterCollapsed = () => this.setState({ status: collapseStatus.COLLAPSED });
  afterExpanded = () => this.setState({ status: collapseStatus.EXPANDED });

  renderSubTreeViewObject = () => {
    const {
      treeItem: {
        children,
        meta: { className },
        payload
      },
      collapsed,
      density,
      id,
      themeData,
      onFocus,
      getKeyboardOpenId,
      setKeyboardOpenId,
      level
    } = this.props;
    const styles = stylesheet(this.props, themeData);

    const { status } = this.state;
    const transitionStyles = this.getTransitionStyles(status);
    const higTreeItemSubTreeViewWrapperClassName = createCustomClassNames(
      className,
      `hig-tree-item-sub-tree-view-wrapper`
    );
    const higTreeItemSubTreeViewClassName = createCustomClassNames(
      className,
      `hig-tree-item-sub-tree-view`
    );

    return (
      <div
        className={cx([
          css(styles.higTreeItemSubTreeViewWrapper),
          css(transitionStyles),
          higTreeItemSubTreeViewWrapperClassName
        ])}
        onTransitionEnd={this.onTransitionEnd}
        ref={this.setSubTreeWrapperRef}
      >
        {(!collapsed || this.state.mount) && (
          <ul
            className={cx([
              css(styles.higTreeItemSubTreeView),
              higTreeItemSubTreeViewClassName
            ])}
            role="group"
          >
            {children
              ? children.map(
                  (child, index) =>
                    child.children ? (
                      <TreeItemBehavior
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${id}-${index}`}
                        {...child}
                        {...payload}
                      >
                        {({
                          getIsCollapsed,
                          handleClick,
                          handleOperatorClick,
                          setIsCollapsed
                        }) => (
                          <TreeObjectNestedSubTreeItem
                            treeItem={{ ...child, payload }}
                            themeData={themeData}
                            density={density}
                            onClick={handleClick}
                            onFocus={onFocus}
                            onOperatorClick={handleOperatorClick}
                            collapsed={getIsCollapsed()}
                            getIsCollapsed={getIsCollapsed}
                            getKeyboardOpenId={getKeyboardOpenId}
                            keyboardOpenId={getKeyboardOpenId()}
                            setIsCollapsed={setIsCollapsed}
                            setKeyboardOpenId={setKeyboardOpenId}
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${id}-${index}`}
                            level={level + 1}
                          />
                        )}
                      </TreeItemBehavior>
                    ) : (
                      <TreeItemBehavior
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${id}-${index}`}
                        {...child}
                        {...payload}
                      >
                        {({ getIsCollapsed, handleClick, setIsCollapsed }) => (
                          <TreeObjectSubTreeItem
                            treeItem={{ ...child, payload }}
                            themeData={themeData}
                            onClick={handleClick}
                            onFocus={onFocus}
                            collapsed={getIsCollapsed()}
                            getIsCollapsed={getIsCollapsed}
                            getKeyboardOpenId={getKeyboardOpenId}
                            keyboardOpenId={getKeyboardOpenId()}
                            setIsCollapsed={setIsCollapsed}
                            setKeyboardOpenId={setKeyboardOpenId}
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${id}-${index}`}
                            level={level + 1}
                          />
                        )}
                      </TreeItemBehavior>
                    )
                )
              : null}
          </ul>
        )}
      </div>
    );
  };

  renderSubTreeViewPresenter = () => {
    const {
      children,
      collapsed,
      density,
      getActiveTreeItemId,
      getActiveTreeItemIndex,
      getCurrentItemClicked,
      getKeyboardOpenId,
      getTreeItemArray,
      guidelines,
      id,
      indicator,
      level,
      setActiveTreeItemId,
      setActiveTreeItemIndex,
      setKeyboardOpenId,
      themeData,
      ...otherProps
    } = this.props;
    const { className } = otherProps;
    const styles = stylesheet(this.props, themeData);
    const clonedChildren = Array.isArray(children)
      ? children.map(child =>
          React.cloneElement(child, {
            getActiveTreeItemId,
            getActiveTreeItemIndex,
            getCurrentItemClicked,
            getKeyboardOpenId,
            getTreeItemArray,
            guidelines,
            indicator,
            keyboardOpenId: getKeyboardOpenId(),
            level: level + 1,
            setActiveTreeItemId,
            setActiveTreeItemIndex,
            setKeyboardOpenId
          })
        )
      : React.cloneElement(children, {
          getActiveTreeItemId,
          getActiveTreeItemIndex,
          getCurrentItemClicked,
          getKeyboardOpenId,
          getTreeItemArray,
          guidelines,
          indicator,
          keyboardOpenId: getKeyboardOpenId(),
          level: level + 1,
          setActiveTreeItemId,
          setActiveTreeItemIndex,
          setKeyboardOpenId
        });
    const { status } = this.state;
    const transitionStyles = this.getTransitionStyles(status);
    const higTreeItemSubTreeViewWrapperClassName = createCustomClassNames(
      className,
      `hig-tree-item-sub-tree-view-wrapper`
    );
    const higTreeItemSubTreeViewClassName = createCustomClassNames(
      className,
      `hig-tree-item-sub-tree-view`
    );

    return (
      <div
        className={cx([
          css(styles.higTreeItemSubTreeViewWrapper),
          css(transitionStyles),
          higTreeItemSubTreeViewWrapperClassName
        ])}
        onTransitionEnd={this.onTransitionEnd}
        ref={this.setSubTreeWrapperRef}
      >
        {(!collapsed || this.state.mount) &&
          Array.isArray(clonedChildren) && (
            <ul
              className={cx([
                css(styles.higTreeItemSubTreeView),
                higTreeItemSubTreeViewClassName
              ])}
              role="group"
            >
              {clonedChildren.map((child, index) => (
                <TreeItem
                  {...child.props}
                  themeData={themeData}
                  density={density}
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${id}-${index}`}
                />
              ))}
            </ul>
          )}
        {(!collapsed || this.state.mount) &&
          !Array.isArray(clonedChildren) && (
            <ul
              className={cx([
                css(styles.higTreeItemSubTreeView),
                higTreeItemSubTreeViewClassName
              ])}
              role="group"
            >
              {clonedChildren}
            </ul>
          )}
      </div>
    );
  };

  render() {
    return this.props.isObject
      ? this.renderSubTreeViewObject()
      : this.renderSubTreeViewPresenter();
  }
}
