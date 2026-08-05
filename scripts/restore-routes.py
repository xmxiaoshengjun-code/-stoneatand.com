import os
import shutil
import glob

"""Restore original API route files from backup"""
backup_dir = r'C:\Users\Sean xiao\AppData\Local\Temp\api_backup'
base = os.path.dirname(os.path.abspath(__file__))
app_dir = os.path.join(base, '..', 'src', 'app')

count = 0
# Walk through backup directory and restore files
for root, dirs, files in os.walk(backup_dir):
    for f in files:
        if f == 'route.ts':
            backup_file = os.path.join(root, f)
            rel_path = os.path.relpath(backup_file, backup_dir)
            
            # Try to restore to both api and api.disabled
            for dir_name in ['api', 'api.disabled']:
                target = os.path.join(app_dir, dir_name, rel_path)
                if os.path.exists(target):
                    shutil.copy2(backup_file, target)
                    count += 1
                    
                    # Also restore any other .ts files in same backup dir
                    for other_f in files:
                        if other_f != 'route.ts':
                            other_backup = os.path.join(root, other_f)
                            other_target = os.path.join(app_dir, dir_name, os.path.dirname(rel_path), other_f)
                            if os.path.exists(other_target):
                                shutil.copy2(other_backup, other_target)

print(f"Total restored: {count} route.ts files")
