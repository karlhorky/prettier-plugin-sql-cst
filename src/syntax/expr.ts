import { AllExprNodes, Keyword, Node } from "sql-parser-cst";
import { CstToDocMap } from "../CstToDocMap";
import { join, line, softline, hardline, indent, group } from "../print_utils";
import {
  isCreateTableStmt,
  isKeyword,
  isValuesClause,
  isEmpty,
  isArraySubscript,
} from "../node_utils";
import { isString, last } from "../utils";

export const exprMap: Partial<CstToDocMap<AllExprNodes>> = {
  list_expr: (print, node, path) => {
    const parent = path.getParentNode() as Node;
    const children = print("items").map((it) => group(it));
    const lineType = isValuesClause(parent) ? hardline : line;
    // When last item is type:empty, we're dealing with a trailing comma.
    // Don't add a space (or newline) after it.
    // We still want to print it though, as it might have comments attached.
    if (isEmpty(last(node.items))) {
      return [
        join([",", lineType], children.slice(0, -1)),
        ",",
        last(children),
      ];
    } else {
      return join([",", lineType], children);
    }
  },
  paren_expr: (print, node, path) => {
    const parent = path.getParentNode() as Node;
    const lineStyle = isCreateTableStmt(parent) ? hardline : softline;
    return group(["(", indent([lineStyle, print("expr")]), lineStyle, ")"]);
  },
  binary_expr: (print, node) => {
    if (isKeyword(node.operator) && isBooleanOp(node.operator)) {
      return join(line, [print("left"), print.spaced(["operator", "right"])]);
    }
    return print.spaced(["left", "operator", "right"]);
  },
  prefix_op_expr: (print, node) =>
    (isString(node.operator) ? print : print.spaced)(["operator", "expr"]),
  postfix_op_expr: (print) => print.spaced(["expr", "operator"]),
  between_expr: (print) =>
    print.spaced(["left", "betweenKw", "begin", "andKw", "end"]),
  case_expr: (print) => [
    print.spaced(["caseKw", "expr"]),
    indent([hardline, join(hardline, print("clauses"))]),
    hardline,
    print("endKw"),
  ],
  case_when: (print) =>
    print.spaced(["whenKw", "condition", "thenKw", "result"]),
  case_else: (print) => print.spaced(["elseKw", "result"]),
  member_expr: (print, node) =>
    isArraySubscript(node.property)
      ? print(["object", "property"])
      : [print("object"), ".", print("property")],
  bigquery_quoted_member_expr: (print) => ["`", print("expr"), "`"],
  array_subscript: (print) =>
    group(["[", indent([softline, print("expr")]), softline, "]"]),
  array_subscript_specifier: (print) => print(["specifierKw", "args"]),
  func_call: (print) => {
    const fnCall = print(["name", "args"]);
    const extras = print(["filter", "over"]);
    if (extras.length > 1) {
      return group([fnCall, indent([line, join(line, extras)])]);
    } else {
      return group(join(" ", [fnCall, ...extras]));
    }
  },
  func_args: (print) => print.spaced(["distinctKw", "args"]),
  filter_arg: (print) => print.spaced(["filterKw", "where"]),
  over_arg: (print) => print.spaced(["overKw", "window"]),
  cast_expr: (print) => print(["castKw", "args"]),
  cast_arg: (print) => print.spaced(["expr", "asKw", "dataType"]),
  raise_expr: (print) => print(["raiseKw", "args"]),
  interval_expr: (print) => print.spaced(["intervalKw", "expr", "unit"]),
  interval_unit_range: (print) =>
    print.spaced(["fromUnitKw", "toKw", "toUnitKw"]),
  array_expr: (print) =>
    group(["[", indent([softline, print("expr")]), softline, "]"]),
  struct_expr: (print) =>
    group(["(", indent([softline, print("expr")]), softline, ")"]),
  typed_expr: (print) => print(["dataType", "expr"]),
  number_literal: (print) => print("text"),
  boolean_literal: (print) => print("valueKw"),
  string_literal: (print) => print("text"),
  null_literal: (print) => print("nullKw"),
  numeric_literal: (print) => print.spaced(["numericKw", "string"]),
  bignumeric_literal: (print) => print.spaced(["bignumericKw", "string"]),
  date_literal: (print) => print.spaced(["dateKw", "string"]),
  time_literal: (print) => print.spaced(["timeKw", "string"]),
  datetime_literal: (print) => print.spaced(["datetimeKw", "string"]),
  timestamp_literal: (print) => print.spaced(["timestampKw", "string"]),
  json_literal: (print) => print.spaced(["jsonKw", "string"]),
  identifier: (print) => print("text"),
  variable: (print) => print("text"),
};

const isBooleanOp = ({ name }: Keyword) => name === "AND" || name === "OR";
