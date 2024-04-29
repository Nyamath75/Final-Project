from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import sqlite3

app = Flask(__name__)

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
def index():
    return render_template('home.html')

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



if __name__ == '__main__':
    app.run(debug=True)
