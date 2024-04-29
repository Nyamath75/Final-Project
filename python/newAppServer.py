from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, session
import os
import sqlite3
from flask_socketio import SocketIO, emit
from socketio import Namespace

app = Flask(__name__)
app.secret_key = 'afgsr+345#gg@'
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True

socketio = SocketIO(app)

connections_list={}



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

    if not table_exists('registrations'):
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS registrations (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            username TEXT UNIQUE,
                            password TEXT,
                            usertype TEXT)''')
        conn.commit()
        conn.close()


    if not table_exists('comments'):
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS comments (
                        commentId INTEGER PRIMARY KEY AUTOINCREMENT,
                        commentDescription TEXT,
                        contentId INTEGER,
                        FOREIGN KEY (contentId) REFERENCES resources(id))''')
        conn.commit()
        conn.close()

    if not table_exists('chat_history'):
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS chat_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        sender TEXT,
                        chat TEXT)''')
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
    print(username)
    user_type = request.json['user_type']
    
    print(user_type == 'admin')
    session['username'] = username
    if user_type == 'admin':
        return jsonify({'message': 'admin'})
    else:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM registrations WHERE username = ? AND password = ?", (username, password))
        user = cursor.fetchone()
        print("my user", user)
        conn.close()

        if user:
            return jsonify({'message': 'user'})
        else:
            return jsonify({'message': 'Invalid username or password'})
        

@app.route('/home')
def home():
    # Check if user is logged in
    if 'username' in session:
        username = session['username']
        print("user:",session['username'])
        return render_template('home.html', username=username)
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
    username = session['username']
    return render_template('user.html', username=username)



@app.route('/add_comment', methods=['POST'])
def add_comment():
    # Get the data from the request
    comment_description = request.form['commentDescription']
    #user_id = session.get('username')  
    content_id = request.form['videoId'] 

    # Insert the data into the comments table
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO comments (commentDescription, contentId) 
                      VALUES (?, ?)''', (comment_description, content_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Comment added successfully"})

@app.route('/getComments')
def get_comments():
    conn = create_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('''SELECT resources.content_name, comments.commentDescription 
                          FROM resources 
                          INNER JOIN comments ON resources.id = comments.contentId''')
        data = cursor.fetchall()
        conn.close()

        # Convert fetched data to a list of dictionaries
        comments_list = [{'videoName': row[0], 'comment': row[1]} for row in data]

        return jsonify(comments_list)
    except Exception as e:
        conn.close()
        print("Error fetching comments:", e)
        return jsonify([])  # Return empty list if there's an error

@app.route('/getChatHistory')
def get_chat_history():
    conn = create_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT sender, chat FROM chat_history")
        data = cursor.fetchall()
        conn.close()

        # Convert fetched data to a list of dictionaries
        chat_history = [{'sender': row[0], 'chat': row[1]} for row in data]

        return jsonify(chat_history)
    except Exception as e:
        conn.close()
        print("Error fetching chat history:", e)
        return jsonify([])  # Return empty list if there's an error


def insert_chat_history(sender, chat):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO chat_history (sender, chat) VALUES (?, ?)''', (sender, chat))
    conn.commit()
    conn.close()

@app.route('/add_user', methods=['POST'])
def add_user():
    # Get data from the request
    username = request.json.get('username')
    password = request.json.get('password')
    usertype = request.json.get('usertype') 

    # Insert the new user data into the registration table
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO registrations (username, password, usertype) 
                      VALUES (?, ?, ?)''', (username, password, usertype))
    conn.commit()
    conn.close()

    return jsonify({"message": "User added successfully"})


@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('join_room')
def join_room(data):
    user = session['username']
    connections_list[user] = request.sid
    print('Client added to the room')
    #socketio.emit('check_notification', {'notifications': data,'image_path': imagePath}, room=connections_list[str(user)])
    #socketio.emit('request_notification', {'requests': data,'image_path': imagePath}, room=connections_list[str(user)])

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('push_notification')
def handle_push_notification(data):
    sender = data['sender']
    message = data['message']
    print("sender: ",sender)
    print(connections_list)
    insert_chat_history(sender, message)
    for key in connections_list:
      socketio.emit('received_notification', {'sender': sender, 'message': message}, room=connections_list[str(key)])
    

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5200, debug=True)
