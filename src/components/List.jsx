import { forwardRef } from "react";

const List = forwardRef(function (props, listRef) {
  return <div className="list" ref={listRef}></div>;
});

export default List;
