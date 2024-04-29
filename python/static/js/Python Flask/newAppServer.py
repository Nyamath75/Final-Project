from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, session
import os
import sqlite3

app = Flask(__name__)
app.secret_key = 'afgsr+345#gg@'

DATABASE = 'resources.db'

def create_connection():
    return sqlite3.connect(DATABASE)

def table_exists(table_name):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
    result = cursor.fetchone()
    conn.close()
    return result is not None

def create_table():
    if not table_exists('resources'):
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE resources (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            content_name TEXT,
                            content_type TEXT,
                            comment TEXT,
                            file_path TEXT)''')
        conn.commit()
        conn.close()

create_table()

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login_user():
    username = request.json['username']
    password = request.json['password']
    
    # Check if the username and password are correct
    if username == 'admin' and password == 'admin':
        # Store username in session
        session['username'] = username
        return 'Login successful', 200
    else:
        return 'Invalid credentials', 401


@app.route('/home')
def home():
    # Check if user is logged in
    if 'username' in session:
        return render_template('home.html', username=session['username'])
    else:
        return redirect('/')

@app.route('/logout')
def logout():
    # Remove username from session if it exists
    session.pop('username', None)
    return redirect('/')


@app.route('/upload', methods=['POST'])
def upload_file():
    content_name = request.form['contentName']
    content_type = request.form['contentType']
    comment = request.form['comment']
    file = request.files['file']
    file_path = 'static/uploads/' + file.filename
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO resources (content_name, content_type, comment, file_path) VALUES (?, ?, ?, ?)''', (content_name, content_type, comment, file_path))
    conn.commit()
    conn.close()
    file.save(file_path)
    
    # Prepare the response data
    uploaded_data = {
        'contentName': content_name,
        'contentType': content_type,
        'comment': comment,
        'fileName': file.filename,
        'filePath': 'uploads/' + file.filename  # Assuming the files are stored in "uploads" folder
    }
    
    return jsonify({'success': True, 'uploadedData': uploaded_data})

@app.route('/get_video_url')
def get_video_url():
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resources where content_type='Video'")
    data = cursor.fetchall()
    conn.close()

    # Convert fetched data to a list of dictionaries
    data_list = [{'id': row[0], 'content_name': row[1], 'content_type': row[2], 'comment': row[3], 'file_path': row[4]} for row in data]

    # Return data as JSON
    return jsonify(data_list)

@app.route('/get_document_url')
def get_document_url():
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resources where content_type='Document'")
    data = cursor.fetchall()
    conn.close()

    # Convert fetched data to a list of dictionaries
    data_list = [{'id': row[0], 'content_name': row[1], 'content_type': row[2], 'comment': row[3], 'file_path': row[4]} for row in data]

    # Return data as JSON
    return jsonify(data_list)

@app.route('/update_video', methods=['POST'])
def update_video():
    data = request.get_json()
    video_id = data['videoId']
    content_name = data['contentName']
    comment = data['comment']

    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('''UPDATE resources SET content_name = ?, comment = ? WHERE id = ?''', (content_name, comment, video_id))
    conn.commit()
    conn.close()
    print(f"Updating video with ID {video_id}. New Content Name: {content_name}. New Comment: {comment}")

    # Return a response, if needed
    return jsonify({"message": "Video details updated successfully"})

@app.route('/delete_video', methods=['POST'])
def delete_video():
    data = request.get_json()
    video_id = data['videoId']
    video_name = data['video_name']
    print(video_name)
    print(video_id);
    conn = create_connection()
    cursor = conn.cursor()

    # Execute the DELETE statement to delete the video with the given ID
    cursor.execute("DELETE FROM resources WHERE id = ?", (video_id,))
    conn.commit()
    conn.close()
    
    if os.path.exists(video_name):
        os.remove(video_name)
        print('Video deleted successfully.')
    else:
        print('Video not found.')

    return jsonify({"message": "Video deleted successfully"})

@app.route('/user')
def user():
    return render_template('user.html')

if __name__ == '__main__':
    app.run(debug=True)
