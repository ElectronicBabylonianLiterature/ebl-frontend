#!/bin/bash
set -e

# Create .env.local from .env.test if it doesn't exist
test -f .env.local || cp .env.test .env.local

# For each variable defined in .env.test, if a Codespaces secret with the
# same name is available in the host environment, override the placeholder value.
python3 << 'PYEOF'
import os
import re

with open('.env.test') as f:
    keys = [
        line.split('=')[0].strip()
        for line in f
        if line.strip() and not line.startswith('#')
    ]

with open('.env.local') as f:
    content = f.read()

injected = []
for key in keys:
    value = os.environ.get(key, '')
    if value:
        content = re.sub(
            r'^' + re.escape(key) + r'=.*',
            key + '=' + value,
            content,
            flags=re.MULTILINE
        )
        injected.append(key)

if injected:
    with open('.env.local', 'w') as f:
        f.write(content)
    print('Injected Codespaces secrets into .env.local: ' + ', '.join(injected))
else:
    print('No Codespaces secrets found — .env.local uses placeholder values from .env.test')
PYEOF
