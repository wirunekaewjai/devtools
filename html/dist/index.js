"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.form = exports.footer = exports.figure = exports.figcaption = exports.fieldset = exports.eventsource = exports.em = exports.dt = exports.dl = exports.div = exports.dialog = exports.dfn = exports.details = exports.del = exports.dd = exports.datalist = exports.datagrid = exports.colgroup = exports.code = exports.cite = exports.caption = exports.canvas = exports.button = exports.body = exports.blockquote = exports.bdo = exports.b = exports.audio = exports.aside = exports.address = exports.abbr = exports.a = exports.wbr = exports.track = exports.source = exports.param = exports.meta = exports.link = exports.keygen = exports.input = exports.img = exports.hr = exports.embed = exports.command = exports.col = exports.br = exports.base = exports.area = exports.html = exports.h = void 0;
exports.th = exports.tfoot = exports.textarea = exports.td = exports.tbody = exports.table = exports.sup = exports.sub = exports.style = exports.strong = exports.span = exports.small = exports.select = exports.section = exports.script = exports.samp = exports.s = exports.ruby = exports.rp = exports.q = exports.progress = exports.pre = exports.p = exports.output = exports.option = exports.optgroup = exports.ol = exports.object = exports.noscript = exports.nav = exports.meter = exports.menu = exports.mark = exports.map = exports.li = exports.legend = exports.label = exports.kbd = exports.ins = exports.iframe = exports.i = exports.hgroup = exports.header = exports.head = exports.h6 = exports.h5 = exports.h4 = exports.h3 = exports.h2 = exports.h1 = void 0;
exports.ul = exports.u = exports.tr = exports.title = exports.time = exports.thead = void 0;
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
function parseAttrs(attrs) {
    const tokens = [];
    if (attrs && typeof attrs === "object") {
        for (const key in attrs) {
            const value = attrs[key];
            tokens.push(`${key}="${value}"`);
        }
    }
    return tokens.length > 0 ? ` ${tokens.join(" ")}` : "";
}
function parseChildren(attrs, children) {
    const tokens = [];
    if (attrs && typeof attrs !== "object") {
        tokens.push(attrs);
    }
    tokens.push(...children);
    return tokens.join("");
}
function h(name, attrs, ...children) {
    const tokens = [];
    if (ROOT_TAGS.has(name)) {
        tokens.push("<!DOCTYPE html>");
    }
    tokens.push("<", name, parseAttrs(attrs), ">");
    if (!SELF_CLOSING_TAGS.has(name)) {
        tokens.push(parseChildren(attrs, children), "</", name, ">");
    }
    return tokens.join("");
}
exports.h = h;
// root
exports.html = h.bind(this, "html");
// self-closing
exports.area = h.bind(this, "area");
exports.base = h.bind(this, "base");
exports.br = h.bind(this, "br");
exports.col = h.bind(this, "col");
exports.command = h.bind(this, "command");
exports.embed = h.bind(this, "embed");
exports.hr = h.bind(this, "hr");
exports.img = h.bind(this, "img");
exports.input = h.bind(this, "input");
exports.keygen = h.bind(this, "keygen");
exports.link = h.bind(this, "link");
exports.meta = h.bind(this, "meta");
exports.param = h.bind(this, "param");
exports.source = h.bind(this, "source");
exports.track = h.bind(this, "track");
exports.wbr = h.bind(this, "wbr");
// normal
exports.a = h.bind(this, "a");
exports.abbr = h.bind(this, "abbr");
exports.address = h.bind(this, "address");
exports.aside = h.bind(this, "aside");
exports.audio = h.bind(this, "audio");
exports.b = h.bind(this, "b");
exports.bdo = h.bind(this, "bdo");
exports.blockquote = h.bind(this, "blockquote");
exports.body = h.bind(this, "body");
exports.button = h.bind(this, "button");
exports.canvas = h.bind(this, "canvas");
exports.caption = h.bind(this, "caption");
exports.cite = h.bind(this, "cite");
exports.code = h.bind(this, "code");
exports.colgroup = h.bind(this, "colgroup");
exports.datagrid = h.bind(this, "datagrid");
exports.datalist = h.bind(this, "datalist");
exports.dd = h.bind(this, "dd");
exports.del = h.bind(this, "del");
exports.details = h.bind(this, "details");
exports.dfn = h.bind(this, "dfn");
exports.dialog = h.bind(this, "dialog");
exports.div = h.bind(this, "div");
exports.dl = h.bind(this, "dl");
exports.dt = h.bind(this, "dt");
exports.em = h.bind(this, "em");
exports.eventsource = h.bind(this, "eventsource");
exports.fieldset = h.bind(this, "fieldset");
exports.figcaption = h.bind(this, "figcaption");
exports.figure = h.bind(this, "figure");
exports.footer = h.bind(this, "footer");
exports.form = h.bind(this, "form");
exports.h1 = h.bind(this, "h1");
exports.h2 = h.bind(this, "h2");
exports.h3 = h.bind(this, "h3");
exports.h4 = h.bind(this, "h4");
exports.h5 = h.bind(this, "h5");
exports.h6 = h.bind(this, "h6");
exports.head = h.bind(this, "head");
exports.header = h.bind(this, "header");
exports.hgroup = h.bind(this, "hgroup");
exports.i = h.bind(this, "i");
exports.iframe = h.bind(this, "iframe");
exports.ins = h.bind(this, "ins");
exports.kbd = h.bind(this, "kbd");
exports.label = h.bind(this, "label");
exports.legend = h.bind(this, "legend");
exports.li = h.bind(this, "li");
exports.map = h.bind(this, "map");
exports.mark = h.bind(this, "mark");
exports.menu = h.bind(this, "menu");
exports.meter = h.bind(this, "meter");
exports.nav = h.bind(this, "nav");
exports.noscript = h.bind(this, "noscript");
exports.object = h.bind(this, "object");
exports.ol = h.bind(this, "ol");
exports.optgroup = h.bind(this, "optgroup");
exports.option = h.bind(this, "option");
exports.output = h.bind(this, "output");
exports.p = h.bind(this, "p");
exports.pre = h.bind(this, "pre");
exports.progress = h.bind(this, "progress");
exports.q = h.bind(this, "q");
exports.rp = h.bind(this, "rp");
exports.ruby = h.bind(this, "ruby");
exports.s = h.bind(this, "s");
exports.samp = h.bind(this, "samp");
exports.script = h.bind(this, "script");
exports.section = h.bind(this, "section");
exports.select = h.bind(this, "select");
exports.small = h.bind(this, "small");
exports.span = h.bind(this, "span");
exports.strong = h.bind(this, "strong");
exports.style = h.bind(this, "style");
exports.sub = h.bind(this, "sub");
exports.sup = h.bind(this, "sup");
exports.table = h.bind(this, "table");
exports.tbody = h.bind(this, "tbody");
exports.td = h.bind(this, "td");
exports.textarea = h.bind(this, "textarea");
exports.tfoot = h.bind(this, "tfoot");
exports.th = h.bind(this, "th");
exports.thead = h.bind(this, "thead");
exports.time = h.bind(this, "time");
exports.title = h.bind(this, "title");
exports.tr = h.bind(this, "tr");
exports.u = h.bind(this, "u");
exports.ul = h.bind(this, "ul");
