with open("config/settings.py", "r") as f:
    lines = f.readlines()

new_lines = []
in_databases = False
skip_count = 0

for i, line in enumerate(lines):
    if "DATABASES = {" in line:
        in_databases = True
        new_lines.append("DATABASES = {\n")
        new_lines.append("    'default': {\n")
        new_lines.append("        'ENGINE': 'django.db.backends.sqlite3',\n")
        new_lines.append("        'NAME': BASE_DIR / 'db.sqlite3',\n")
        new_lines.append("    }\n")
        new_lines.append("}\n")
        # Skip until we find the closing brace
        skip_count = 1
        continue

    if in_databases and skip_count > 0:
        if "{" in line:
            skip_count += 1
        if "}" in line:
            skip_count -= 1
        if skip_count == 0:
            in_databases = False
        continue

    new_lines.append(line)

with open("config/settings.py", "w") as f:
    f.writelines(new_lines)

print("✅ Database fixed!")
