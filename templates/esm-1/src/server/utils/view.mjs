import { readFileSync } from 'fs';
import { posix } from 'path';

const VIEW_DIR = "src/views";

/**
 * @param {string} template
 * @param {Record<string, string>} props
 */
function assignProps(template, props) {
  return template.replace(/\{\{(\w+)\}\}/g,
    /**
     * @param {string} key 
     * @returns {string}
     */
    (_, key) => {
      return props[key];
    }
  );
}

/**
 * @param {string} name
 * @param {Record<string, string>} [props]
 */
export function render(name, props) {
  const templatePath = posix.join(VIEW_DIR, `${name}.html`);
  const template = readFileSync(templatePath, "utf8");

  return props ? assignProps(template, props) : template;
}

/**
 * @param {string} name
 * @param {Record<string, string>[]} propsArray
 */
export function renderArray(name, propsArray) {
  const templatePath = posix.join(VIEW_DIR, `${name}.html`);
  const template = readFileSync(templatePath, "utf8");

  return propsArray.map((props) => {
    return assignProps(template, props);
  }).join("");
}