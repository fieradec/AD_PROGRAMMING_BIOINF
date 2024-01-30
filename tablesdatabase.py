import sqlite3
from sqlite3 import Error


try:
    conn = sqlite3.connect("py4bio.db")
    print(sqlite3.version)

    # cursor
    c = conn.cursor()

    c.execute("""DROP TABLE IF EXISTS contacts""")
    c.execute("""DROP TABLE IF EXISTS data""")
    c.execute("""DROP TABLE IF EXISTS range""")

    c.execute("""CREATE TABLE contacts (
                contact_id integer PRIMARY KEY AUTOINCREMENT,
                name varchar ( 128 ) NOT NULL,
                surname varchar ( 128 ) NOT NULL,
                email text varchar ( 255 ) NOT NULL
                )""")

    c.execute("""CREATE TABLE data (
                id integer primary key autoincrement,
                humidity real,
                temperature real,
                luminosity real,
                timestamp text not null
                )""")
    
    c.execute("""CREATE TABLE range (
                measure varchar ( 128 ) primary key,
                maximum real not null,
                minimum real not null
                )""")
    
    r = c.fetchall()
except Error as e:
    print(e)
finally:
    if conn:
        conn.commit()
        conn.close()