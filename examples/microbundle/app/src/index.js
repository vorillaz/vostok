export default async function makeDom(tag, props, children) {
  const el = document.createElement(tag);
  el.append(...(await children));
  return Object.assign(el, props);
}
