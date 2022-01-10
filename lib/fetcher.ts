import axios from 'axios';

export const fetcher = (...urls) => {
  const f = u => axios.get(u).then(res => res.data);

  if (urls.length > 1) {
    return Promise.all(urls.map(f));
  }
  return f(urls);
};
