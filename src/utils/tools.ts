export const obj2Query: (obj: Record<string, any>) => string = obj => {
  let string = '';
  if (!obj || typeof obj !== 'object') return string;
  for (let k of Object.keys(obj)) {
    string += `${k}=${obj[k]}&`;
  }
  return '?' + string;
}
