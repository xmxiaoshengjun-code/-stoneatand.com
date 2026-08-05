import os
import glob

CONTENT = '''import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [];
}

export async function GET() {
  return NextResponse.json({});
}
'''

# Process both api and api.disabled directories
base = os.path.dirname(os.path.abspath(__file__))
app_dir = os.path.join(base, '..', 'src', 'app')

count = 0
for dir_name in ['api', 'api.disabled']:
    dir_path = os.path.join(app_dir, dir_name)
    if not os.path.isdir(dir_path):
        print(f"Directory not found: {dir_path}")
        continue
    for route_file in glob.glob(os.path.join(dir_path, '**', 'route.ts'), recursive=True):
        with open(route_file, 'w', encoding='utf-8') as f:
            f.write(CONTENT)
        count += 1

print(f"Updated {count} route.ts files")
