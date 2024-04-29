document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  const selectedUserType = document.querySelector('input[name="user_type"]:checked');
  console.log(selectedUserType.value);
  console.log(username);
  // Send login request to the server
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/login', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
          if (xhr.status === 200) {
             // Parse the JSON response
             var responseData = JSON.parse(xhr.responseText);
            
             console.log(xhr.responseText);
             
              if(responseData.message==='admin')
              {
                window.location.href = '/home';
              }
              else
              {
                window.location.href = '/user';
              }  
          } else {
              alert('Invalid username or password. Please try again.');
          }
      }
  };
  var data = JSON.stringify({username: username, password: password, user_type: selectedUserType.value});
  xhr.send(data);
});