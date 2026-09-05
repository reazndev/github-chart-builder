export function getClientId() {
  let id = localStorage.getItem('gh_chart_client_id');
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    localStorage.setItem('gh_chart_client_id', id);
  }
  return id;
}
