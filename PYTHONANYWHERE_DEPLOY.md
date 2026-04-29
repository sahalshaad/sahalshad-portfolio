# PythonAnywhere Deployment

Live URL:

```text
https://sahalshad.pythonanywhere.com
```

## 1. Upload the project to GitHub

Create a new GitHub repository, then upload this project folder.

## 2. Open PythonAnywhere Bash

Go to PythonAnywhere, open a Bash console, then run:

```bash
git clone https://github.com/sahalshaad/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic
python manage.py seed_portfolio_content
python manage.py createsuperuser
```

If the site already has content locally that you want online, upload `db.sqlite3` and the `media/` folder too.

## 3. Create the web app

In PythonAnywhere:

1. Open the **Web** tab.
2. Click **Add a new web app**.
3. Choose **Manual configuration**.
4. Choose **Python 3.13**.

## 4. Configure the web app

Set **Source code** to:

```text
/home/sahalshad/YOUR_REPOSITORY_NAME
```

Set **Virtualenv** to:

```text
/home/sahalshad/YOUR_REPOSITORY_NAME/.venv
```

Open the WSGI file and replace its contents with:

```python
import os
import sys

path = "/home/sahalshad/YOUR_REPOSITORY_NAME"
if path not in sys.path:
    sys.path.append(path)

os.environ["DJANGO_SETTINGS_MODULE"] = "backend.settings"
os.environ["DJANGO_DEBUG"] = "False"

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

## 5. Static and media files

In the **Web** tab, add these static file mappings:

```text
/static/  -> /home/sahalshad/YOUR_REPOSITORY_NAME/staticfiles
/media/   -> /home/sahalshad/YOUR_REPOSITORY_NAME/media
```

## 6. Reload

Click **Reload** on the PythonAnywhere Web tab.

Then open:

```text
https://sahalshad.pythonanywhere.com
https://sahalshad.pythonanywhere.com/admin/
```
