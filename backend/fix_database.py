import re
with open('config/settings.py', 'r') as f:
    content = f.read()
# Find and replace the DATABASES section
old_db = r"DATABASES = \{[^}]*'default': \{[^}]*'ENGINE': 'django\.db\.backends\.mysql'[^}]*\}[^}]*\}"

new_db = """DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}"""
content = re.sub(old_db, new_db, content, flags=re.DOTALL)

with open('config/settings.py', 'w') as f:
    f.write(content)

print("✅ Database configuration updated to SQLite!")
