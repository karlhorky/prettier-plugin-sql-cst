import { Node } from "sql-parser-cst";
import { CstToDocMap } from "../CstToDocMap";
import { join, line, softline, indent, group } from "../print_utils";

export const exprMap: Partial<CstToDocMap<Node>> = {
  list_expr: (print) => join([",", line], print("items")),
  paren_expr: (print, path) => {
    const parent = path.getParentNode() as Node;
    if (parent?.type === "func_call") {
      return ["(", indent([softline, print("expr")]), softline, ")"];
    } else {
      return ["(", print("expr"), ")"];
    }
  },
  binary_expr: (print) => join(" ", print(["left", "operator", "right"])),
  member_expr: (print) => [print("object"), ".", print("property")],
  func_call: (print) => group(print(["name", "args"])),
  func_args: (print) => print("args"),
  number_literal: (print) => print("text"),
  boolean_literal: (print) => print("text"),
  identifier: (print) => print("text"),
};
