FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN grep -vE 'mysqlclient|celery|redis|amqp|billiard|kombu|vine|click-didyoumean|click-plugins|click-repl' requirements.txt \
    | pip install --no-cache-dir -r /dev/stdin \
    && pip install --no-cache-dir gunicorn

COPY . .

RUN mkdir -p logs static staticfiles

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
