import { JSXChildren } from "./types";

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

function renderChildren(children: JSXChildren): string {
  if (Array.isArray(children)) {
    return children.map(renderChildren).join("");
  } else if (typeof children === "string" || typeof children === "number" || typeof children === "boolean") {
    return children.toString();
  }

  return "";
}

function renderAttrs(attrs: Record<string, any>) {
  const entries: string[] = [];

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

export function render(type: Function | string | undefined, props: Record<string, any>) {
  if (typeof type === "function") {
    return type(props ?? {});
  }

  const { children, ...attrs } = props;

  if (typeof type === "string") {
    const texts: string[] = [];

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