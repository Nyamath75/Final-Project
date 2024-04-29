// function isLoggedIn() {
//   return session && session.username;
// }

// function handleNavigation(event) {
//   if (!isLoggedIn()) {
//       event.preventDefault();
//       window.location.href = '/';
//   }
// }


// window.addEventListener('beforeunload', handleNavigation);
// window.addEventListener('unload', handleNavigation);
// window.addEventListener('popstate', handleNavigation);
// window.addEventListener('hashchange', handleNavigation);
// window.addEventListener('click', function(event) {
//   if (event.target.tagName === 'A') {
//       handleNavigation(event);
//   }
// });



// document.getElementById('login-form').addEventListener('submit', function(event) {
//   event.preventDefault();
//   var username = document.getElementById('username').value;
//   var password = document.getElementById('password').value;
//   console.log(username);
//   // Send login request to the server
//   var xhr = new XMLHttpRequest();
//   xhr.open('POST', '/login', true);
//   xhr.setRequestHeader('Content-Type', 'application/json');
//   xhr.onreadystatechange = function () {
//       if (xhr.readyState === 4) {
//           if (xhr.status === 200) {
//               // Redirect to home page if login is successful
//               window.location.href = '/home';
//           } else {
//               alert('Invalid username or password. Please try again.');
//           }
//       }
//   };
//   var data = JSON.stringify({username: username, password: password});
//   xhr.send(data);
// });







var isEdit=false;
var isEditVideo=false;
var isEditDocument=false;
function showSection(sectionId) {
    isEditVideo=false;
    isEditDocument=false;
    var sections = document.getElementsByTagName('section');
    for (var i = 0; i < sections.length; i++) {
        sections[i].style.display='none';
    }
    
    if(sectionId==='view-videos')
    {
      fetchVideo(); 
    }
    else if(sectionId==='view-documents')
    {
      fetchDocument(); 
    }
    else if(sectionId==='logout') {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/logout', true);
      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
              // Redirect to login page after successful logout
              window.location.href = '/';
          }
      };
      xhr.send();
    }
    document.getElementById(sectionId).style.display='block';
}


function validateForm() {
    var contentName = document.getElementById('contentName').value.trim();
    var contentType = document.getElementById('contentType').value.trim();
    var comment = document.getElementById('comment').value.trim();
    var file = document.getElementById('file').value.trim();

    if (contentName === '') {
        alert('Please enter content name');
        return false;
    }

    if (contentType === '') {
        alert('Please select content type');
        return false;
    }

    if (file === '') {
        alert('Please select a file to upload');
        return false;
    }

    return true;
}

document.getElementById('uploadForm').addEventListener('submit', function(e) {
     alert("submit");
    e.preventDefault();
    
    var formData = new FormData(this);
    
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Upload successful!');
            // Optional: Clear the form fields or update UI as needed
            // Call a function to display uploaded data in the same section
            showUploadedData(data.uploadedData);
        } else {
            alert('Upload failed!');
        }
    })
    .catch(error => console.error('Error:', error));
});

function showUploadedData(data) {
    // Assuming there's a div with id "uploadedData" in the same section
    var uploadedDataDiv = document.getElementById('upload');
    uploadedDataDiv.innerHTML = ''; // Clear previous content
    
    // Create HTML content to display uploaded data
    var content = '<h2>Uploaded Data</h2>';
    content += '<p><strong>Content Name:</strong> ' + data.contentName + '</p>';
    content += '<p><strong>Content Type:</strong> ' + data.contentType + '</p>';
    content += '<p><strong>Comment:</strong> ' + data.comment + '</p>';
    content += '<p><strong>File:</strong> <a href="' + data.filePath + '">' + data.fileName + '</a></p>';
    
    uploadedDataDiv.innerHTML = content;
}


function fetchVideo() {
    fetch('/get_video_url')
    .then(response => response.json())
    .then(data => {
        if (data) {
           showVideo(data);
           isEdit=false;
        } else {
            isEdit=false;
            alert('Failed to fetch video.');
        }
    })
    .catch(error => console.error('Error:', error));
}


function showVideo(videosList) {
   var videoListDiv;
   if(isEdit) {
    videoListDiv = document.getElementById("videoEditList");
   }
   else {
    videoListDiv = document.getElementById("videoList");
   }
  videoListDiv.innerHTML = ""; // Clear existing content

  videosList.forEach(function(video) {
    var videoCard = document.createElement("div");
    videoCard.className = "video-card";
    videoCard.textContent = video.comment+" "+video.file_path;
    videoCard.addEventListener("click", function() {
      if(isEditVideo) {
        playEditVideo(video.file_path,video.content_name,video.comment,video.id);
      }  
      else {
        playVideo(video.file_path);
      }
    });
    videoListDiv.appendChild(videoCard);
  });
}

function playVideo(videoId) {
    var videoPlayer = document.getElementById("videoPlayer");
    videoPlayer.innerHTML="";
    //videoPlayer.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    var videoElement = document.createElement('video');
        videoElement.controls = true;
        videoElement.style.width = "600px"; // Set width to 200px
        videoElement.style.height = "400px"; // Set height to 200px
        // Create a new source element
        var sourceElement = document.createElement('source');
        sourceElement.src = videoId;
        sourceElement.type = 'video/mp4';

        // Append the source element to the video element
        videoElement.appendChild(sourceElement);

        // Append the video element to the video container
        videoPlayer.appendChild(videoElement);

  }

  function playEditVideo(videoId,content_name,comment,id) {
   
    var videoPlayer = document.getElementById("editScreen");
    videoPlayer.innerHTML="";
    //videoPlayer.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    var videoElement = document.createElement('video');
        videoElement.controls = true;
        videoElement.style.width = "600px"; // Set width to 200px
        videoElement.style.height = "400px"; // Set height to 200px
        // Create a new source element
        var sourceElement = document.createElement('source');
        sourceElement.src = videoId;
        sourceElement.type = 'video/mp4';

        // Append the source element to the video element
        videoElement.appendChild(sourceElement);

        // Append the video element to the video container
        videoPlayer.appendChild(videoElement);

          // Create content name input field
    var contentNameInput = document.createElement('input');
    contentNameInput.type = 'text';
    contentNameInput.className = 'editInput';
    contentNameInput.id = 'editContentName';
    contentNameInput.value = content_name;
    videoPlayer.appendChild(contentNameInput);

    // Create comment input field
    var commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.className = 'editInput';
    commentInput.id = 'editComment';
    commentInput.value = comment;
    videoPlayer.appendChild(commentInput);


       // Create delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn delete-btn';
    deleteBtn.innerText = 'Delete';
    deleteBtn.onclick = function() {
        deleteVideo(id,videoId);
    };
    
    // Create update button
    var updateBtn = document.createElement('button');
    updateBtn.className = 'btn update-btn';
    updateBtn.innerText = 'Update';
    updateBtn.onclick = function() {
      var contentName = contentNameInput.value;
      var comment = commentInput.value;
      // Pass content name and comment to updateVideo function
      updateVideo(id, contentName, comment);
    };

    videoPlayer.appendChild(deleteBtn);
    videoPlayer.appendChild(updateBtn);
  }

  function deleteVideo(videoId,video_name) {
    // Implement delete functionality here
    console.log(video_name);
    console.log("Deleting video with ID: " + videoId);
    var xhr = new XMLHttpRequest();
            xhr.open("POST", "/delete_video", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    // Handle response here, if needed
                    console.log(xhr.responseText);
                }
            };
            var data = JSON.stringify({ "videoId": videoId, "video_name": video_name});
            xhr.send(data);
}

function updateVideo(videoId) {
    // Implement update functionality here
    console.log("Updating video with ID: " + videoId);
    var contentName = document.getElementById('editContentName').value;
            var comment = document.getElementById('editComment').value;
     console.log(contentName);
     console.log(comment);
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/update_video", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    // Handle response here, if needed
                    console.log(xhr.responseText);
                }
            };
            var data = JSON.stringify({ "videoId": videoId, "contentName": contentName, "comment": comment });
            xhr.send(data);
}

function fetchDocument() {
    fetch('/get_document_url')
    .then(response => response.json())
    .then(data => {
        if (data) {
        loadDocument(data);
    isEdit=false;
        } else {
            isEdit=false;
            alert('Failed to fetch video.');
        }
    })
    .catch(error => console.error('Error:', error));
}

function loadDocument(data) {
    var videoListDiv;
    if(isEdit) {
        videoListDiv = document.getElementById("documentEditList");
    }
    else {
        videoListDiv = document.getElementById("documentList");
    }
    videoListDiv.innerHTML = ""; // Clear existing content
  
    data.forEach(function(video) {
      var videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.textContent = video.comment+" "+video.file_path;
      videoCard.addEventListener("click", function() {
        if(isEditDocument) {
            showEditDocument(video.file_path,video.id,video.content_name,video.comment);
          }  
          else {
            showDocument(video.file_path);
          }
      });
      videoListDiv.appendChild(videoCard);
    });
}

function showDocument(documentList) {
    var documentContainer = document.getElementById('documentPlayer');
    documentContainer.innerHTML = '';
    
       var iframe = document.createElement('iframe');
            iframe.src = documentList;
            iframe.width = '800px';
            iframe.height = '800px';
            documentContainer.appendChild(iframe);
   
}

function showEditDocument(documentList,id,content_name,comment) {
    var documentContainer = document.getElementById('editScreen');
    documentContainer.innerHTML = '';
    
       var iframe = document.createElement('iframe');
            iframe.src = documentList;
            iframe.width = '600px';
            iframe.height = '400px';
            documentContainer.appendChild(iframe);

      // Create content name input field
      var contentNameInput = document.createElement('input');
      contentNameInput.type = 'text';
      contentNameInput.className = 'editInput';
      contentNameInput.id = 'editContentName';
      contentNameInput.value = content_name;
      documentContainer.appendChild(contentNameInput);
  
      // Create comment input field
      var commentInput = document.createElement('input');
      commentInput.type = 'text';
      commentInput.className = 'editInput';
      commentInput.id = 'editComment';
      commentInput.value = comment;
      documentContainer.appendChild(commentInput);   
       
       // Create delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn delete-btn';
    deleteBtn.innerText = 'Delete';
    deleteBtn.onclick = function() {
        deleteDocument(id,documentList);
    };
    
    // Create update button
    var updateBtn = document.createElement('button');
    updateBtn.className = 'btn update-btn';
    updateBtn.innerText = 'Update';
    updateBtn.onclick = function() {
        updateDocument(id, contentName, comment);
    };

    documentContainer.appendChild(deleteBtn);
    documentContainer.appendChild(updateBtn);     
   
}


function deleteDocument(videoId,video_name) {
    // Implement delete functionality here
    console.log(video_name);
    console.log("Deleting video with ID: " + videoId);
    var xhr = new XMLHttpRequest();
            xhr.open("POST", "/delete_video", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    // Handle response here, if needed
                    console.log(xhr.responseText);
                }
            };
            var data = JSON.stringify({ "videoId": videoId, "video_name": video_name});
            xhr.send(data);
}

function updateDocument(videoId, contentName, comment) {
    // Implement update functionality here
    console.log("Updating video with ID: " + videoId);
    var contentName = document.getElementById('editContentName').value;
            var comment = document.getElementById('editComment').value;
     console.log(contentName);
     console.log(comment);
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/update_video", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    // Handle response here, if needed
                    console.log(xhr.responseText);
                }
            };
            var data = JSON.stringify({ "videoId": videoId, "contentName": contentName, "comment": comment });
            xhr.send(data)
}

function toggleContent(contentType) {
    var contents = document.querySelectorAll('.content');
    var buttons = document.querySelectorAll('.toggle-btn');
    var documentContainer = document.getElementById('editScreen');
    documentContainer.innerHTML = '';
  
    contents.forEach(function(content) {
      if (content.id === contentType) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  
    buttons.forEach(function(button) {
      if (button.innerText.toLowerCase() === contentType) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    if(contentType==="videoEditList") {
       isEdit=true; 
       isEditVideo=true;
       fetchVideo();
    }
    else {
        isEdit=true;
        isEditDocument=true;
        fetchDocument();
    }
  }
  