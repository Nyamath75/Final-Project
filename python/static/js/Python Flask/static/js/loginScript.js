document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  console.log(username);
  // Send login request to the server
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/login', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
          if (xhr.status === 200) {
              // Redirect to home page if login is successful
              window.location.href = '/home';
          } else {
              alert('Invalid username or password. Please try again.');
          }
      }
  };
  var data = JSON.stringify({username: username, password: password});
  xhr.send(data);
});