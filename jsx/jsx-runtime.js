const ROOT_TAGS = new Set([
  "html"
]);

const SELF_CLOSING_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);

/** @typedef {string | number | boolean | null | undefined} Child */

/**
 * @param {Child | Child[]} children
 * @returns {string}
 */
function renderChildren(children) {
  if (Array.isArray(children)) {
    return children.map(renderChildren).join("");
  } else if (typeof children === "string" || typeof children === "number" || typeof children === "boolean") {
    return children.toString();
  }

  return "";
}

/**
 * @param {{ [x: string]: any; }} attrs
 */
function renderAttrs(attrs) {
  /** @type {string[]} */
  const entries = [];

  for (const key in attrs) {
    const value = attrs[key];

    if (typeof value === "undefined" || value === null) {
      continue;
    }

    entries.push(`${key}="${value}"`);
  }

  if (entries.length > 0) {
    return " " + entries.join(" ");
  }

  return "";
}

/**
 * @param {Function | string | undefined} type 
 * @param {Record<string, any>} props
 * @returns {string}
 */
function render(type, props) {
  console.log(type, props);
  if (typeof type === "function") {
    return type(props ?? {});
  }

  const { children, ...attrs } = props;

  if (typeof type === "string") {
    /** @type {string[]} */
    const texts = [];

    if (ROOT_TAGS.has(type)) {
      texts.push("<!DOCTYPE html>");
    }

    texts.push("<", type, renderAttrs(attrs), ">");

    if (!SELF_CLOSING_TAGS.has(type)) {
      texts.push(renderChildren(children), "</", type, ">");
    }
    
    return texts.join("");
  }

  return renderChildren(children);
}

Object.defineProperty(exports, "__esModule", { value: true });

module.exports.jsx = render;
module.exports.jsxs = render;
module.exports.jsxDEV = render;
module.exports.default = Object.assign({}, module.exports);