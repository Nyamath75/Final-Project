function showSection(sectionId) {
    var sections = document.getElementsByTagName('section');
    for (var i = 0; i < sections.length; i++) {
        sections[i].style.display='none';
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
    var uploadedDataDiv = document.getElementById('uploadedData');
    uploadedDataDiv.innerHTML = ''; // Clear previous content
    
    // Create HTML content to display uploaded data
    var content = '<h2>Uploaded Data</h2>';
    content += '<p><strong>Content Name:</strong> ' + data.contentName + '</p>';
    content += '<p><strong>Content Type:</strong> ' + data.contentType + '</p>';
    content += '<p><strong>Comment:</strong> ' + data.comment + '</p>';
    content += '<p><strong>File:</strong> <a href="' + data.filePath + '">' + data.fileName + '</a></p>';
    
    uploadedDataDiv.innerHTML = content;
}

