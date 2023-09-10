export type HtmlAttributes = Partial<{
  accept: string;
  accept_charset: string;
  accesskey: string;
  action: string;
  alt: string;
  async: string | boolean;
  autocomplete: string;
  autofocus: string;
  autoplay: string;
  charset: string;
  checked: string | boolean;
  cite: string;
  class: string;
  cols: string | number;
  colspan: string | number;
  content: string;
  contenteditable: string;
  controls: string;
  coords: string;
  data: string;
  datetime: string;
  default: string;
  defer: string;
  dir: string;
  dirname: string;
  disabled: string | boolean;
  download: string;
  draggable: string | boolean;
  enctype: string;
  for: string;
  form: string;
  formaction: string;
  headers: string;
  height: string | number;
  hidden: string | boolean;
  high: string;
  href: string;
  hreflang: string;
  http_equiv: string;
  id: string;
  ismap: string;
  kind: string;
  label: string;
  lang: string;
  list: string;
  loop: string;
  low: string;
  max: string | number;
  maxlength: string | number;
  media: string;
  method: string;
  min: string | number;
  multiple: string | boolean;
  muted: string;
  name: string;
  novalidate: string;
  open: string | boolean;
  optimum: string;
  pattern: string;
  placeholder: string;
  poster: string;
  preload: string | boolean;
  readonly: string;
  rel: string;
  required: string | boolean;
  reversed: string;
  rows: string | number;
  rowspan: string | number;
  sandbox: string;
  scope: string;
  selected: string | boolean;
  shape: string;
  size: string;
  sizes: string;
  span: string;
  spellcheck: string;
  src: string;
  srcdoc: string;
  srclang: string;
  srcset: string;
  start: string;
  step: string | number;
  style: string;
  tabindex: string | number;
  target: string;
  title: string;
  translate: string;
  type: string;
  usemap: string;
  value: string | number | boolean;
  width: string | number;
  wrap: string;
}>;

type DynamicAttributes = {
  [key: string]: any;
};

type Child = string | number | boolean;

const ROOT_TAGS = new Set(["html"]);

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
  "wbr",
]);

function parseAttrs(attrs: DynamicAttributes | Child | undefined) {
  const tokens: string[] = [];

  if (attrs && typeof attrs === "object") {
    for (const key in attrs) {
      const value = attrs[key];
      tokens.push(`${key}="${value}"`);
    }
  }

  return tokens.length > 0 ? ` ${tokens.join(" ")}` : "";
}

function parseChildren(
  attrs: DynamicAttributes | Child | undefined,
  children: Child[]
) {
  const tokens: Child[] = [];

  if (attrs && typeof attrs !== "object") {
    tokens.push(attrs);
  }

  tokens.push(...children);
  return tokens.join("");
}

export function h(name: string, attrs?: HtmlAttributes | DynamicAttributes | Child, ...children: Child[]) {
  const tokens: Child[] = [];

  if (ROOT_TAGS.has(name)) {
    tokens.push("<!DOCTYPE html>");
  }

  tokens.push("<", name, parseAttrs(attrs), ">");

  if (!SELF_CLOSING_TAGS.has(name)) {
    tokens.push(parseChildren(attrs, children), "</", name, ">");
  }

  return tokens.join("");
}

// root
export const html = h.bind(this, "html");

// self-closing
export const area = h.bind(this, "area");
export const base = h.bind(this, "base");
export const br = h.bind(this, "br");
export const col = h.bind(this, "col");
export const command = h.bind(this, "command");
export const embed = h.bind(this, "embed");
export const hr = h.bind(this, "hr");
export const img = h.bind(this, "img");
export const input = h.bind(this, "input");
export const keygen = h.bind(this, "keygen");
export const link = h.bind(this, "link");
export const meta = h.bind(this, "meta");
export const param = h.bind(this, "param");
export const source = h.bind(this, "source");
export const track = h.bind(this, "track");
export const wbr = h.bind(this, "wbr");

// normal
export const a = h.bind(this, "a");
export const abbr = h.bind(this, "abbr");
export const address = h.bind(this, "address");
export const aside = h.bind(this, "aside");
export const audio = h.bind(this, "audio");
export const b = h.bind(this, "b");
export const bdo = h.bind(this, "bdo");
export const blockquote = h.bind(this, "blockquote");
export const body = h.bind(this, "body");
export const button = h.bind(this, "button");
export const canvas = h.bind(this, "canvas");
export const caption = h.bind(this, "caption");
export const cite = h.bind(this, "cite");
export const code = h.bind(this, "code");
export const colgroup = h.bind(this, "colgroup");
export const datagrid = h.bind(this, "datagrid");
export const datalist = h.bind(this, "datalist");
export const dd = h.bind(this, "dd");
export const del = h.bind(this, "del");
export const details = h.bind(this, "details");
export const dfn = h.bind(this, "dfn");
export const dialog = h.bind(this, "dialog");
export const div = h.bind(this, "div");
export const dl = h.bind(this, "dl");
export const dt = h.bind(this, "dt");
export const em = h.bind(this, "em");
export const eventsource = h.bind(this, "eventsource");
export const fieldset = h.bind(this, "fieldset");
export const figcaption = h.bind(this, "figcaption");
export const figure = h.bind(this, "figure");
export const footer = h.bind(this, "footer");
export const form = h.bind(this, "form");
export const h1 = h.bind(this, "h1");
export const h2 = h.bind(this, "h2");
export const h3 = h.bind(this, "h3");
export const h4 = h.bind(this, "h4");
export const h5 = h.bind(this, "h5");
export const h6 = h.bind(this, "h6");
export const head = h.bind(this, "head");
export const header = h.bind(this, "header");
export const hgroup = h.bind(this, "hgroup");
export const i = h.bind(this, "i");
export const iframe = h.bind(this, "iframe");
export const ins = h.bind(this, "ins");
export const kbd = h.bind(this, "kbd");
export const label = h.bind(this, "label");
export const legend = h.bind(this, "legend");
export const li = h.bind(this, "li");
export const map = h.bind(this, "map");
export const mark = h.bind(this, "mark");
export const menu = h.bind(this, "menu");
export const meter = h.bind(this, "meter");
export const nav = h.bind(this, "nav");
export const noscript = h.bind(this, "noscript");
export const object = h.bind(this, "object");
export const ol = h.bind(this, "ol");
export const optgroup = h.bind(this, "optgroup");
export const option = h.bind(this, "option");
export const output = h.bind(this, "output");
export const p = h.bind(this, "p");
export const pre = h.bind(this, "pre");
export const progress = h.bind(this, "progress");
export const q = h.bind(this, "q");
export const rp = h.bind(this, "rp");
export const ruby = h.bind(this, "ruby");
export const s = h.bind(this, "s");
export const samp = h.bind(this, "samp");
export const script = h.bind(this, "script");
export const section = h.bind(this, "section");
export const select = h.bind(this, "select");
export const small = h.bind(this, "small");
export const span = h.bind(this, "span");
export const strong = h.bind(this, "strong");
export const style = h.bind(this, "style");
export const sub = h.bind(this, "sub");
export const sup = h.bind(this, "sup");
export const table = h.bind(this, "table");
export const tbody = h.bind(this, "tbody");
export const td = h.bind(this, "td");
export const textarea = h.bind(this, "textarea");
export const tfoot = h.bind(this, "tfoot");
export const th = h.bind(this, "th");
export const thead = h.bind(this, "thead");
export const time = h.bind(this, "time");
export const title = h.bind(this, "title");
export const tr = h.bind(this, "tr");
export const u = h.bind(this, "u");
export const ul = h.bind(this, "ul");