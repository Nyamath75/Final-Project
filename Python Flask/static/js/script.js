function showSection(sectionId) {
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
           console.log(data);
           console.log(data[0].comment);
           console.log(data[0].file_path);
           console.log(data[0].content_name);
           console.log(data[0].content_type);
           showVideo(data);
        } else {
            alert('Failed to fetch video.');
        }
    })
    .catch(error => console.error('Error:', error));
}


function showVideo(videosList) {
    var videoContainer = document.querySelector('.video-container');

    // Clear existing video elements from the container
    videoContainer.innerHTML = '';

    // Iterate over the list of video URLs
    videosList.forEach(function(videoUrl) {
        // Create a new video element
        var videoElement = document.createElement('video');
        videoElement.controls = true;

        // Create a new source element
        var sourceElement = document.createElement('source');
        sourceElement.src = videoUrl.file_path;
        sourceElement.type = 'video/mp4';

        // Append the source element to the video element
        videoElement.appendChild(sourceElement);

        // Append the video element to the video container
        videoContainer.appendChild(videoElement);
    });
}

function fetchDocument() {
    fetch('/get_document_url')
    .then(response => response.json())
    .then(data => {
        if (data) {
           console.log(data);
           showDocument(data);
        } else {
            alert('Failed to fetch video.');
        }
    })
    .catch(error => console.error('Error:', error));
}

function showDocument(documentList) {
    var documentContainer = document.querySelector('.document-container');
    documentContainer.innerHTML = '';
    documentList.forEach(function(data) {
       var iframe = document.createElement('iframe');
            iframe.src = data.file_path;
            iframe.width = '100%';
            iframe.height = '500px';
            documentContainer.appendChild(iframe);
    });
}

