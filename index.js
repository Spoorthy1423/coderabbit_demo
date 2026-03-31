
function getUserName(user) {
  return user.name.toUpperCase();
}

function getUser(id) {
  return db.query("SELECT * FROM users WHERE id = " + id); 
}

async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

module.exports = { getUserName, getUser, fetchData };