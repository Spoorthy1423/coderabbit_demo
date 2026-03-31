// Bug 1: null check ledu
function getUserName(user) {
  return user.name.toUpperCase(); // user null aithe crash avutundi
}

// Bug 2: SQL injection risk
function getUser(id) {
  return db.query("SELECT * FROM users WHERE id = " + id); 
}

// Bug 3: Promise error handling ledu
async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

module.exports = { getUserName, getUser, fetchData };// test change
