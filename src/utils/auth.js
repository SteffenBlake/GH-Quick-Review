const PAT_KEY = 'github_pat';

export const getToken = () => {
  return localStorage.getItem(PAT_KEY);
};

export const setToken = (token) => {
  localStorage.setItem(PAT_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(PAT_KEY);
};

export const isAuthenticated = () => {
  return !!getToken();
};
